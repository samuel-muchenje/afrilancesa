from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import shutil
from pathlib import Path

# Create uploads directory structure
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Create subdirectories for different file types
(UPLOAD_DIR / "id_documents").mkdir(exist_ok=True)
(UPLOAD_DIR / "profile_pictures").mkdir(exist_ok=True)
(UPLOAD_DIR / "portfolios").mkdir(exist_ok=True)
(UPLOAD_DIR / "project_gallery").mkdir(exist_ok=True)
(UPLOAD_DIR / "resumes").mkdir(exist_ok=True)

app = FastAPI()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(mongo_url)
db = client.afrilance

# JWT settings
JWT_SECRET = "afrilance_secret_key_2025"
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Email settings
EMAIL_HOST = "mail.afrilance.co.za"
EMAIL_PORT = 465
EMAIL_USER = "sam@afrilance.co.za"
EMAIL_PASS = os.environ.get('EMAIL_PASSWORD', '')

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # freelancer, client, admin
    full_name: str
    phone: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    full_name: str
    phone: str
    email: EmailStr

class VerificationRequest(BaseModel):
    user_id: str
    verification_status: bool

class FreelancerProfile(BaseModel):
    skills: List[str]
    experience: str
    hourly_rate: float
    bio: str
    portfolio_links: List[str] = []

class JobCreate(BaseModel):
    title: str
    description: str
    category: str
    budget: float
    budget_type: str  # fixed, hourly
    requirements: List[str]

class JobApplication(BaseModel):
    job_id: str
    proposal: str
    bid_amount: float

class Message(BaseModel):
    job_id: str
    receiver_id: str
    content: str

class SupportTicket(BaseModel):
    name: str
    email: EmailStr
    message: str

class FileUploadResponse(BaseModel):
    message: str
    filename: str
    file_url: str
    file_type: str

class ProjectGalleryItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    project_url: Optional[str] = None

class ContractCreate(BaseModel):
    job_id: str
    freelancer_id: str
    client_id: str
    amount: float
    status: str = "In Progress"

class ProposalAcceptance(BaseModel):
    job_id: str
    freelancer_id: str
    proposal_id: str
    bid_amount: float

class WalletTransaction(BaseModel):
    type: str  # Credit/Debit
    amount: float
    date: datetime = None
    note: str

class WithdrawalRequest(BaseModel):
    amount: float

class EscrowRelease(BaseModel):
    contract_id: str

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT)
        server.login(EMAIL_USER, EMAIL_PASS)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def validate_file_upload(file: UploadFile, allowed_types: List[str], max_size_mb: int = 5) -> None:
    """Validate uploaded file type and size"""
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Note: We'll check size when reading the file content

def generate_unique_filename(user_id: str, file_type: str, original_filename: str) -> str:
    """Generate unique filename for uploaded file"""
    file_extension = original_filename.split(".")[-1] if "." in original_filename else "bin"
    timestamp = int(datetime.utcnow().timestamp())
    unique_id = uuid.uuid4().hex[:8]
    return f"{user_id}_{file_type}_{timestamp}_{unique_id}.{file_extension}"

async def save_uploaded_file(
    file: UploadFile, 
    user_id: str, 
    file_type: str, 
    subdirectory: str,
    allowed_types: List[str],
    max_size_mb: int = 5
) -> dict:
    """Save uploaded file and return file info"""
    
    # Validate file type
    validate_file_upload(file, allowed_types, max_size_mb)
    
    # Read and validate file size
    file_content = await file.read()
    max_size = max_size_mb * 1024 * 1024  # Convert MB to bytes
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size is {max_size_mb}MB"
        )
    
    # Generate unique filename and path
    unique_filename = generate_unique_filename(user_id, file_type, file.filename)
    file_path = UPLOAD_DIR / subdirectory / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "file_path": str(file_path),
        "content_type": file.content_type,
        "file_size": len(file_content),
        "uploaded_at": datetime.utcnow()
    }

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Afrilance API"}

@app.post("/api/register")
async def register_user(user: UserRegister):
    # Check if user exists
    existing = db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user.role not in ["freelancer", "client", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be freelancer, client, or admin")
    
    # Create user with enhanced fields
    user_data = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "full_name": user.full_name,
        "phone": user.phone,
        "is_verified": False,  # Always start as unverified
        "id_document": None,   # Will be uploaded later for freelancers
        "profile_completed": False,
        "created_at": datetime.utcnow(),
        "profile": {},
        # Additional metadata
        "last_login": None,
        "status": "active"
    }
    
    # For freelancers, verification is required before they can bid on jobs
    if user.role == "freelancer":
        user_data["verification_required"] = True
        user_data["can_bid"] = False
    else:
        user_data["verification_required"] = False
        user_data["can_bid"] = True
    
    db.users.insert_one(user_data)
    
    # Auto-create wallet for freelancers
    if user.role == "freelancer":
        wallet_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_data["id"],
            "available_balance": 0.0,
            "escrow_balance": 0.0,
            "transaction_history": [],
            "created_at": datetime.utcnow()
        }
        db.wallets.insert_one(wallet_data)
    
    token = create_token(user_data["id"], user_data["role"])
    
    return {
        "token": token,
        "user": {
            "id": user_data["id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "full_name": user_data["full_name"],
            "phone": user_data["phone"],
            "is_verified": user_data["is_verified"],
            "profile_completed": user_data["profile_completed"],
            "verification_required": user_data.get("verification_required", False),
            "can_bid": user_data.get("can_bid", True)
        }
    }

@app.post("/api/login")
async def login_user(user: UserLogin):
    db_user = db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    db.users.update_one(
        {"id": db_user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_token(db_user["id"], db_user["role"])
    
    return {
        "token": token,
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "role": db_user["role"],
            "full_name": db_user["full_name"],
            "phone": db_user.get("phone", ""),
            "is_verified": db_user.get("is_verified", False),
            "profile_completed": db_user.get("profile_completed", False),
            "verification_required": db_user.get("verification_required", False),
            "can_bid": db_user.get("can_bid", True)
        }
    }

@app.get("/api/profile")
async def get_profile(current_user = Depends(verify_token)):
    user = db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "phone": user.get("phone", ""),
        "is_verified": user.get("is_verified", False),
        "profile": user.get("profile", {}),
        "profile_completed": user.get("profile_completed", False),
        "verification_required": user.get("verification_required", False),
        "can_bid": user.get("can_bid", True),
        "created_at": user.get("created_at"),
        "id_document": user.get("id_document")
    }

@app.put("/api/profile")
async def update_profile(profile: UserProfile, current_user = Depends(verify_token)):
    # Update basic profile information
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "full_name": profile.full_name,
                "phone": profile.phone,
                "email": profile.email
            }
        }
    )
    
    return {"message": "Profile updated successfully"}

# Admin-only endpoint for user verification
@app.post("/api/admin/verify-user")
async def verify_user(verification: VerificationRequest, current_user = Depends(verify_token)):
    # Check if current user is admin
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update user verification status
    update_data = {
        "is_verified": verification.verification_status,
        "verified_at": datetime.utcnow() if verification.verification_status else None
    }
    
    # If verifying a freelancer, allow them to bid
    user = db.users.find_one({"id": verification.user_id})
    if user and user["role"] == "freelancer" and verification.verification_status:
        update_data["can_bid"] = True
        update_data["verification_required"] = False
    
    db.users.update_one(
        {"id": verification.user_id},
        {"$set": update_data}
    )
    
    return {"message": "User verification status updated"}

@app.get("/api/admin/users")
async def get_all_users(current_user = Depends(verify_token)):
    # Check if current user is admin
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = list(db.users.find({}, {"password": 0}).sort("created_at", -1))
    
    # Convert ObjectId to string for JSON serialization
    for user in users:
        user["_id"] = str(user["_id"])
    
    return users

@app.put("/api/freelancer/profile")
async def update_freelancer_profile(profile: FreelancerProfile, current_user = Depends(verify_token)):
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can update this profile")
    
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "profile": profile.dict(),
                "profile_completed": True
            }
        }
    )
    
    return {"message": "Profile updated successfully"}

@app.post("/api/jobs")
async def create_job(job: JobCreate, current_user = Depends(verify_token)):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can create jobs")
    
    job_data = {
        "id": str(uuid.uuid4()),
        "client_id": current_user["user_id"],
        "status": "open",
        "created_at": datetime.utcnow(),
        "applications_count": 0,
        **job.dict()
    }
    
    db.jobs.insert_one(job_data)
    return {"message": "Job created successfully", "job_id": job_data["id"]}

@app.get("/api/jobs")
async def get_jobs(category: Optional[str] = None, current_user = Depends(verify_token)):
    query = {"status": "open"}
    if category:
        query["category"] = category
        
    jobs = list(db.jobs.find(query).sort("created_at", -1))
    
    # Get client info for each job
    for job in jobs:
        client = db.users.find_one({"id": job["client_id"]})
        if client:
            job["client_name"] = client["full_name"]
        job["_id"] = str(job["_id"])  # Convert ObjectId to string
    
    return jobs

@app.get("/api/jobs/my")
async def get_my_jobs(current_user = Depends(verify_token)):
    if current_user["role"] == "client":
        jobs = list(db.jobs.find({"client_id": current_user["user_id"]}).sort("created_at", -1))
    else:
        # For freelancers, get jobs they've applied to
        applications = list(db.applications.find({"freelancer_id": current_user["user_id"]}))
        job_ids = [app["job_id"] for app in applications]
        jobs = list(db.jobs.find({"id": {"$in": job_ids}}).sort("created_at", -1))
    
    for job in jobs:
        job["_id"] = str(job["_id"])
        # Get applications count
        job["applications_count"] = db.applications.count_documents({"job_id": job["id"]})
        
    return jobs

@app.post("/api/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, application: JobApplication, current_user = Depends(verify_token)):
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can apply to jobs")
    
    # Get user details to check verification status
    user = db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if freelancer is verified and can bid
    if not user.get("can_bid", False):
        if user.get("verification_required", False) and not user.get("is_verified", False):
            raise HTTPException(
                status_code=403, 
                detail="You must be verified before applying to jobs. Please upload your ID document and wait for admin verification."
            )
    
    # Check if already applied
    existing = db.applications.find_one({
        "job_id": job_id,
        "freelancer_id": current_user["user_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Check if job exists and is open
    job = db.jobs.find_one({"id": job_id, "status": "open"})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or closed")
    
    app_data = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "freelancer_id": current_user["user_id"],
        "proposal": application.proposal,
        "bid_amount": application.bid_amount,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    db.applications.insert_one(app_data)
    
    # Update job applications count
    db.jobs.update_one(
        {"id": job_id},
        {"$inc": {"applications_count": 1}}
    )
    
    return {"message": "Application submitted successfully"}

@app.get("/api/jobs/{job_id}/applications")
async def get_job_applications(job_id: str, current_user = Depends(verify_token)):
    # Check if user owns the job
    job = db.jobs.find_one({"id": job_id, "client_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    applications = list(db.applications.find({"job_id": job_id}).sort("created_at", -1))
    
    # Get freelancer info for each application
    for app in applications:
        freelancer = db.users.find_one({"id": app["freelancer_id"]})
        if freelancer:
            app["freelancer_name"] = freelancer["full_name"]
            app["freelancer_profile"] = freelancer.get("profile", {})
        app["_id"] = str(app["_id"])
    
    return applications

@app.post("/api/messages")
async def send_message(message: Message, current_user = Depends(verify_token)):
    message_data = {
        "id": str(uuid.uuid4()),
        "job_id": message.job_id,
        "sender_id": current_user["user_id"],
        "receiver_id": message.receiver_id,
        "content": message.content,
        "created_at": datetime.utcnow(),
        "read": False
    }
    
    db.messages.insert_one(message_data)
    return {"message": "Message sent successfully"}

@app.get("/api/messages/{job_id}")
async def get_messages(job_id: str, current_user = Depends(verify_token)):
    messages = list(db.messages.find({
        "job_id": job_id,
        "$or": [
            {"sender_id": current_user["user_id"]},
            {"receiver_id": current_user["user_id"]}
        ]
    }).sort("created_at", 1))
    
    # Get sender names
    for msg in messages:
        sender = db.users.find_one({"id": msg["sender_id"]})
        if sender:
            msg["sender_name"] = sender["full_name"]
        msg["_id"] = str(msg["_id"])
    
    return messages

# CONTRACTS MANAGEMENT
@app.post("/api/jobs/{job_id}/accept-proposal")
async def accept_proposal(job_id: str, acceptance: ProposalAcceptance, current_user = Depends(verify_token)):
    # Verify user is client and owns the job
    job = db.jobs.find_one({"id": job_id, "client_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    if job.get("status") != "open":
        raise HTTPException(status_code=400, detail="Job is not open for proposals")
    
    # Verify the proposal exists
    proposal = db.applications.find_one({
        "job_id": job_id,
        "freelancer_id": acceptance.freelancer_id,
        "status": "pending"
    })
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found or already processed")
    
    # Verify freelancer exists and is verified
    freelancer = db.users.find_one({"id": acceptance.freelancer_id})
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    if not freelancer.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Cannot hire unverified freelancer")
    
    # Create contract
    contract_data = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "freelancer_id": acceptance.freelancer_id,
        "client_id": current_user["user_id"],
        "amount": acceptance.bid_amount,
        "status": "In Progress",
        "created_at": datetime.utcnow(),
        "proposal_id": acceptance.proposal_id,
        # Additional fields for contract management
        "start_date": datetime.utcnow(),
        "milestones": [],
        "payments": []
    }
    
    try:
        # Insert contract
        db.contracts.insert_one(contract_data)
        
        # Handle escrow: Move funds to escrow balance for freelancer
        freelancer_wallet = db.wallets.find_one({"user_id": acceptance.freelancer_id})
        if freelancer_wallet:
            # Update wallet escrow balance and add transaction
            transaction = {
                "type": "Credit",
                "amount": acceptance.bid_amount,
                "date": datetime.utcnow(),
                "note": f"Funds held in escrow for job: {job.get('title', 'Untitled Job')}"
            }
            
            db.wallets.update_one(
                {"user_id": acceptance.freelancer_id},
                {
                    "$inc": {"escrow_balance": acceptance.bid_amount},
                    "$push": {"transaction_history": transaction}
                }
            )
        
        # Update job status to 'assigned'
        db.jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "assigned",
                "assigned_freelancer_id": acceptance.freelancer_id,
                "contract_id": contract_data["id"],
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Update accepted proposal status
        db.applications.update_one(
            {"job_id": job_id, "freelancer_id": acceptance.freelancer_id},
            {"$set": {
                "status": "accepted",
                "accepted_at": datetime.utcnow()
            }}
        )
        
        # Reject all other pending proposals for this job
        db.applications.update_many(
            {
                "job_id": job_id,
                "freelancer_id": {"$ne": acceptance.freelancer_id},
                "status": "pending"
            },
            {"$set": {
                "status": "rejected",
                "rejected_at": datetime.utcnow()
            }}
        )
        
        return {
            "message": "Proposal accepted and contract created successfully",
            "contract_id": contract_data["id"],
            "freelancer_name": freelancer["full_name"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating contract: {str(e)}")

@app.get("/api/contracts")
async def get_contracts(current_user = Depends(verify_token)):
    # Get contracts based on user role
    if current_user["role"] == "freelancer":
        contracts = list(db.contracts.find({"freelancer_id": current_user["user_id"]}).sort("created_at", -1))
    elif current_user["role"] == "client":
        contracts = list(db.contracts.find({"client_id": current_user["user_id"]}).sort("created_at", -1))
    elif current_user["role"] == "admin":
        contracts = list(db.contracts.find({}).sort("created_at", -1))
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Enrich contracts with additional data
    for contract in contracts:
        # Get job details
        job = db.jobs.find_one({"id": contract["job_id"]})
        if job:
            contract["job_title"] = job["title"]
            contract["job_category"] = job["category"]
        
        # Get freelancer details
        freelancer = db.users.find_one({"id": contract["freelancer_id"]})
        if freelancer:
            contract["freelancer_name"] = freelancer["full_name"]
            contract["freelancer_profile"] = freelancer.get("profile", {})
        
        # Get client details
        client = db.users.find_one({"id": contract["client_id"]})
        if client:
            contract["client_name"] = client["full_name"]
        
        contract["_id"] = str(contract["_id"])
    
    return contracts

@app.get("/api/contracts/stats")
async def get_contract_stats(current_user = Depends(verify_token)):
    # Get contract statistics based on user role
    if current_user["role"] == "freelancer":
        pipeline = [
            {"$match": {"freelancer_id": current_user["user_id"]}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }}
        ]
    elif current_user["role"] == "client":
        pipeline = [
            {"$match": {"client_id": current_user["user_id"]}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }}
        ]
    elif current_user["role"] == "admin":
        pipeline = [
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }}
        ]
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    stats = list(db.contracts.aggregate(pipeline))
    
    # Format response
    result = {
        "total_contracts": 0,
        "total_amount": 0,
        "in_progress": 0,
        "completed": 0,
        "cancelled": 0,
        "in_progress_amount": 0,
        "completed_amount": 0,
        "cancelled_amount": 0
    }
    
    for stat in stats:
        status = stat["_id"]
        count = stat["count"]
        amount = stat["total_amount"]
        
        result["total_contracts"] += count
        result["total_amount"] += amount
        
        if status == "In Progress":
            result["in_progress"] = count
            result["in_progress_amount"] = amount
        elif status == "Completed":
            result["completed"] = count
            result["completed_amount"] = amount
        elif status == "Cancelled":
            result["cancelled"] = count
            result["cancelled_amount"] = amount
    
    return result

@app.get("/api/contracts/{contract_id}")
async def get_contract(contract_id: str, current_user = Depends(verify_token)):
    contract = db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check access permissions
    if current_user["role"] not in ["admin"] and current_user["user_id"] not in [contract["freelancer_id"], contract["client_id"]]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Convert ObjectId to string for JSON serialization
    contract["_id"] = str(contract["_id"])
    
    # Enrich contract with additional data
    job = db.jobs.find_one({"id": contract["job_id"]})
    if job:
        job["_id"] = str(job["_id"])  # Convert ObjectId to string
        contract["job_details"] = job
    
    freelancer = db.users.find_one({"id": contract["freelancer_id"]})
    if freelancer:
        contract["freelancer_details"] = {
            "full_name": freelancer["full_name"],
            "email": freelancer["email"],
            "profile": freelancer.get("profile", {}),
            "is_verified": freelancer.get("is_verified", False)
        }
    
    client = db.users.find_one({"id": contract["client_id"]})
    if client:
        contract["client_details"] = {
            "full_name": client["full_name"],
            "email": client["email"]
        }
    
    return contract

@app.patch("/api/contracts/{contract_id}/status")
async def update_contract_status(contract_id: str, status_data: dict, current_user = Depends(verify_token)):
    new_status = status_data.get("status")
    if new_status not in ["In Progress", "Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    contract = db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check permissions - only client or freelancer involved in contract can update
    if current_user["user_id"] not in [contract["freelancer_id"], contract["client_id"]] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update contract status
    db.contracts.update_one(
        {"id": contract_id},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.utcnow(),
            "updated_by": current_user["user_id"]
        }}
    )
    
    # If completed, also update job status
    if new_status == "Completed":
        db.jobs.update_one(
            {"id": contract["job_id"]},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.utcnow()
            }}
        )
    elif new_status == "Cancelled":
        db.jobs.update_one(
            {"id": contract["job_id"]},
            {"$set": {
                "status": "cancelled",
                "cancelled_at": datetime.utcnow()
            }}
        )
    
    return {"message": f"Contract status updated to {new_status}"}

@app.post("/api/upload-id-document")
async def upload_id_document(
    file: UploadFile = File(...),
    current_user = Depends(verify_token)
):
    # Check if user is freelancer
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload ID documents")
    
    # Define allowed file types for ID documents
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    
    # Save file using utility function
    file_info = await save_uploaded_file(
        file=file,
        user_id=current_user["user_id"],
        file_type="id_document",
        subdirectory="id_documents",
        allowed_types=allowed_types,
        max_size_mb=5
    )
    
    # Update user document in database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "id_document": file_info,
                "document_submitted": True,
                "verification_status": "pending"
            }
        }
    )
    
    # Send verification approval email to sam@afrilance.co.za
    try:
        user = db.users.find_one({"id": current_user["user_id"]})
        if user:
            verification_email_subject = f"New Verification Request - {user['full_name']}"
            verification_email_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        New Freelancer Verification Request
                    </h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2c3e50;">Freelancer Details:</h3>
                        <p><strong>Name:</strong> {user['full_name']}</p>
                        <p><strong>Email:</strong> {user['email']}</p>
                        <p><strong>Phone:</strong> {user.get('phone', 'Not provided')}</p>
                        <p><strong>User ID:</strong> {user['id']}</p>
                        <p><strong>Registration Date:</strong> {user.get('created_at', 'Unknown')}</p>
                    </div>
                    
                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #27ae60;">Document Information:</h3>
                        <p><strong>Document Type:</strong> ID Document</p>
                        <p><strong>Original Filename:</strong> {file_info['original_name']}</p>
                        <p><strong>File Size:</strong> {round(file_info['file_size'] / 1024 / 1024, 2)} MB</p>
                        <p><strong>Upload Date:</strong> {file_info['uploaded_at']}</p>
                        <p><strong>Server Filename:</strong> {file_info['filename']}</p>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h3 style="margin-top: 0; color: #856404;">Action Required:</h3>
                        <p>Please review the uploaded ID document and verify the freelancer's identity.</p>
                        <p><strong>Document Location:</strong> /app/backend/uploads/id_documents/{file_info['filename']}</p>
                    </div>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/admin-dashboard" 
                           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Review in Admin Dashboard
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                        <p>This is an automated notification from Afrilance verification system.</p>
                        <p>Please do not reply to this email. Contact support if you need assistance.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email to verification team
            email_sent = send_email(
                to_email="sam@afrilance.co.za",
                subject=verification_email_subject,
                body=verification_email_body
            )
            
            if email_sent:
                print(f"✅ Verification email sent to sam@afrilance.co.za for user {user['full_name']}")
            else:
                print(f"❌ Failed to send verification email for user {user['full_name']}")
                
    except Exception as e:
        print(f"❌ Error sending verification email: {str(e)}")
        # Don't fail the upload if email fails
    
    return {
        "message": "ID document uploaded successfully. Verification team has been notified.",
        "filename": file_info["filename"],
        "status": "pending_verification"
    }

@app.post("/api/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user = Depends(verify_token)
):
    """Upload profile picture for any user"""
    
    # Define allowed file types for profile pictures
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    
    # Save file using utility function
    file_info = await save_uploaded_file(
        file=file,
        user_id=current_user["user_id"],
        file_type="profile_picture",
        subdirectory="profile_pictures",
        allowed_types=allowed_types,
        max_size_mb=2  # Smaller size for profile pictures
    )
    
    # Update user profile picture in database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "profile_picture": file_info
            }
        }
    )
    
    return {
        "message": "Profile picture uploaded successfully",
        "filename": file_info["filename"],
        "file_url": f"/uploads/profile_pictures/{file_info['filename']}"
    }

@app.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user = Depends(verify_token)
):
    """Upload resume/CV for freelancers"""
    
    # Check if user is freelancer
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload resumes")
    
    # Define allowed file types for resumes
    allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    # Save file using utility function
    file_info = await save_uploaded_file(
        file=file,
        user_id=current_user["user_id"],
        file_type="resume",
        subdirectory="resumes",
        allowed_types=allowed_types,
        max_size_mb=10  # Larger size for documents
    )
    
    # Update user resume in database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "resume": file_info
            }
        }
    )
    
    return {
        "message": "Resume uploaded successfully",
        "filename": file_info["filename"],
        "file_url": f"/uploads/resumes/{file_info['filename']}"
    }

@app.post("/api/upload-portfolio-file")
async def upload_portfolio_file(
    file: UploadFile = File(...),
    current_user = Depends(verify_token)
):
    """Upload portfolio files for freelancers"""
    
    # Check if user is freelancer
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload portfolio files")
    
    # Define allowed file types for portfolio
    allowed_types = [
        "image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif",
        "application/pdf", 
        "video/mp4", "video/mpeg", "video/quicktime",
        "application/zip", "application/x-zip-compressed"
    ]
    
    # Save file using utility function
    file_info = await save_uploaded_file(
        file=file,
        user_id=current_user["user_id"],
        file_type="portfolio",
        subdirectory="portfolios",
        allowed_types=allowed_types,
        max_size_mb=50  # Larger size for portfolio files
    )
    
    # Add to user's portfolio files in database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$push": {
                "portfolio_files": file_info
            }
        }
    )
    
    return {
        "message": "Portfolio file uploaded successfully",
        "filename": file_info["filename"],
        "file_url": f"/uploads/portfolios/{file_info['filename']}"
    }

@app.post("/api/upload-project-gallery")
async def upload_project_gallery(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    technologies: str = Form(""),  # Comma-separated technologies
    project_url: Optional[str] = Form(None),
    current_user = Depends(verify_token)
):
    """Upload project gallery item with metadata"""
    
    # Check if user is freelancer
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload project gallery items")
    
    # Define allowed file types for project gallery
    allowed_types = [
        "image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif",
        "video/mp4", "video/mpeg", "video/quicktime"
    ]
    
    # Save file using utility function
    file_info = await save_uploaded_file(
        file=file,
        user_id=current_user["user_id"],
        file_type="project_gallery",
        subdirectory="project_gallery",
        allowed_types=allowed_types,
        max_size_mb=25  # Medium size for project media
    )
    
    # Parse technologies
    tech_list = [tech.strip() for tech in technologies.split(",") if tech.strip()] if technologies else []
    
    # Create project gallery item
    gallery_item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "technologies": tech_list,
        "project_url": project_url,
        "file_info": file_info,
        "created_at": datetime.utcnow()
    }
    
    # Add to user's project gallery in database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$push": {
                "project_gallery": gallery_item
            }
        }
    )
    
    return {
        "message": "Project gallery item uploaded successfully",
        "project_id": gallery_item["id"],
        "filename": file_info["filename"],
        "file_url": f"/uploads/project_gallery/{file_info['filename']}"
    }

@app.get("/api/user-files")
async def get_user_files(current_user = Depends(verify_token)):
    """Get all uploaded files for the current user"""
    
    user = db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    files_info = {
        "profile_picture": user.get("profile_picture"),
        "id_document": user.get("id_document"),
        "resume": user.get("resume") if current_user["role"] == "freelancer" else None,
        "portfolio_files": user.get("portfolio_files", []) if current_user["role"] == "freelancer" else [],
        "project_gallery": user.get("project_gallery", []) if current_user["role"] == "freelancer" else []
    }
    
    return files_info

@app.delete("/api/delete-portfolio-file/{filename}")
async def delete_portfolio_file(
    filename: str,
    current_user = Depends(verify_token)
):
    """Delete a specific portfolio file"""
    
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can delete portfolio files")
    
    # Remove from database
    result = db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$pull": {
                "portfolio_files": {"filename": filename}
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Try to delete physical file
    try:
        file_path = UPLOAD_DIR / "portfolios" / filename
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Warning: Could not delete physical file {filename}: {e}")
    
    return {"message": "Portfolio file deleted successfully"}

@app.delete("/api/delete-project-gallery/{project_id}")
async def delete_project_gallery_item(
    project_id: str,
    current_user = Depends(verify_token)
):
    """Delete a specific project gallery item"""
    
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can delete project gallery items")
    
    # Find and remove from database
    user = db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the project to get filename for deletion
    project_to_delete = None
    for project in user.get("project_gallery", []):
        if project["id"] == project_id:
            project_to_delete = project
            break
    
    if not project_to_delete:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Remove from database
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$pull": {
                "project_gallery": {"id": project_id}
            }
        }
    )
    
    # Try to delete physical file
    try:
        filename = project_to_delete["file_info"]["filename"]
        file_path = UPLOAD_DIR / "project_gallery" / filename
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Warning: Could not delete physical file: {e}")
    
    return {"message": "Project gallery item deleted successfully"}

@app.post("/api/admin/verify-user/{user_id}")
async def verify_user(
    user_id: str,
    verification_data: dict,
    current_user = Depends(verify_token)
):
    """Admin endpoint to approve/reject user verification"""
    
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can verify users")
    
    status = verification_data.get("status")  # "approved" or "rejected"
    reason = verification_data.get("reason", "")
    admin_notes = verification_data.get("admin_notes", "")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Find the user
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user verification status
    update_data = {
        "verification_status": status,
        "is_verified": status == "approved",
        "verification_date": datetime.utcnow(),
        "verified_by": current_user["user_id"],
        "verification_reason": reason,
        "admin_notes": admin_notes
    }
    
    db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    # Send notification emails
    try:
        if status == "approved":
            # Email to user - Approval
            user_subject = "🎉 Your Afrilance Account Has Been Verified!"
            user_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #27ae60; margin-bottom: 10px;">🎉 Congratulations!</h1>
                        <h2 style="color: #2c3e50;">Your Account Has Been Verified</h2>
                    </div>
                    
                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>Dear {user['full_name']},</p>
                        <p>Great news! Your Afrilance freelancer account has been successfully verified. You now have access to all premium features and can apply for high-value projects.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">What's Next?</h3>
                        <ul style="color: #555;">
                            <li>✅ Complete your profile with skills and portfolio</li>
                            <li>✅ Browse and apply for premium projects</li>
                            <li>✅ Set your competitive rates</li>
                            <li>✅ Start building your reputation</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/freelancer-dashboard" 
                           style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Go to Your Dashboard
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Welcome to the Afrilance community!</p>
                        <p>Need help? Contact us at support@afrilance.co.za</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Email to admin - Verification Completed
            admin_subject = f"✅ User Verification Approved - {user['full_name']}"
            admin_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #27ae60;">✅ User Verification Approved</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">User Details:</h3>
                        <p><strong>Name:</strong> {user['full_name']}</p>
                        <p><strong>Email:</strong> {user['email']}</p>
                        <p><strong>User ID:</strong> {user['id']}</p>
                        <p><strong>Approved by:</strong> {current_user.get('full_name', current_user['user_id'])}</p>
                        <p><strong>Approval Date:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    {f'<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0;">Admin Notes:</h3><p>{admin_notes}</p></div>' if admin_notes else ''}
                    
                    <p>The user has been notified of their approval and can now access all verified freelancer features.</p>
                </div>
            </body>
            </html>
            """
            
        else:  # rejected
            # Email to user - Rejection
            user_subject = "Afrilance Verification Update Required"
            user_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e74c3c;">Verification Update Required</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>Dear {user['full_name']},</p>
                        <p>Thank you for submitting your verification documents. We need some additional information or updates before we can complete your verification.</p>
                    </div>
                    
                    {f'<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;"><h3 style="margin-top: 0; color: #856404;">What needs to be updated:</h3><p>{reason}</p></div>' if reason else ''}
                    
                    <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Next Steps:</h3>
                        <ol style="color: #555;">
                            <li>Review the feedback above</li>
                            <li>Update your documents/information as needed</li>
                            <li>Resubmit for verification</li>
                            <li>Our team will review within 24-48 hours</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/freelancer-dashboard" 
                           style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Update Verification
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Need help? Contact us at sam@afrilance.co.za</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Email to admin - Verification Rejected
            admin_subject = f"❌ User Verification Rejected - {user['full_name']}"
            admin_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e74c3c;">❌ User Verification Rejected</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">User Details:</h3>
                        <p><strong>Name:</strong> {user['full_name']}</p>
                        <p><strong>Email:</strong> {user['email']}</p>
                        <p><strong>User ID:</strong> {user['id']}</p>
                        <p><strong>Rejected by:</strong> {current_user.get('full_name', current_user['user_id'])}</p>
                        <p><strong>Rejection Date:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    {f'<div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0; color: #721c24;">Rejection Reason:</h3><p>{reason}</p></div>' if reason else ''}
                    
                    {f'<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0;">Admin Notes:</h3><p>{admin_notes}</p></div>' if admin_notes else ''}
                    
                    <p>The user has been notified and can resubmit their verification documents after addressing the issues.</p>
                </div>
            </body>
            </html>
            """
        
        # Send emails
        user_email_sent = send_email(user['email'], user_subject, user_body)
        admin_email_sent = send_email("sam@afrilance.co.za", admin_subject, admin_body)
        
        print(f"📧 Verification emails sent - User: {user_email_sent}, Admin: {admin_email_sent}")
        
    except Exception as e:
        print(f"❌ Error sending verification emails: {str(e)}")
    
    return {
        "message": f"User verification {status} successfully",
        "user_id": user_id,
        "status": status,
        "verification_date": update_data["verification_date"]
    }

@app.get("/api/user/verification-status")
async def get_verification_status(current_user = Depends(verify_token)):
    """Get current user's verification status"""
    
    user = db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    verification_info = {
        "user_id": user["id"],
        "verification_status": user.get("verification_status", "not_submitted"),
        "is_verified": user.get("is_verified", False),
        "document_submitted": user.get("document_submitted", False),
        "verification_date": user.get("verification_date"),
        "verification_reason": user.get("verification_reason", ""),
        "id_document": user.get("id_document"),
        "contact_email": "sam@afrilance.co.za"
    }
    
    return verification_info

@app.post("/api/support")
async def submit_support_ticket(ticket: SupportTicket):
    # Save to database
    ticket_data = {
        "id": str(uuid.uuid4()),
        "name": ticket.name,
        "email": ticket.email,
        "message": ticket.message,
        "status": "open",
        "created_at": datetime.utcnow()
    }
    
    db.support_tickets.insert_one(ticket_data)
    
    # Try to send email but don't block if it fails
    email_sent = False
    try:
        subject = f"New Support Request from {ticket.name}"
        body = f"""
        <h2>New Support Request</h2>
        <p><strong>From:</strong> {ticket.name}</p>
        <p><strong>Email:</strong> {ticket.email}</p>
        <p><strong>Message:</strong></p>
        <p>{ticket.message}</p>
        <p><strong>Submitted:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
        """
        
        # Only try to send email if EMAIL_PASSWORD is configured
        if EMAIL_PASS:
            email_sent = send_email("sam@afrilance.co.za", subject, body)
        else:
            print("Email not configured, skipping email notification")
    except Exception as e:
        print(f"Email sending failed: {e}")
        email_sent = False
    
    return {
        "message": "Support ticket submitted successfully",
        "ticket_id": ticket_data["id"],
        "email_sent": email_sent
    }

# Wallet Management Endpoints

@app.get("/api/wallet")
async def get_wallet(current_user = Depends(verify_token)):
    """Get wallet information for current user"""
    wallet = db.wallets.find_one({"user_id": current_user["user_id"]})
    
    if not wallet:
        # Create wallet if it doesn't exist (for backward compatibility)
        if current_user["role"] == "freelancer":
            wallet_data = {
                "id": str(uuid.uuid4()),
                "user_id": current_user["user_id"],
                "available_balance": 0.0,
                "escrow_balance": 0.0,
                "transaction_history": [],
                "created_at": datetime.utcnow()
            }
            db.wallets.insert_one(wallet_data)
            wallet = wallet_data
        else:
            raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Remove MongoDB _id and return clean data
    wallet.pop("_id", None)
    return wallet

@app.post("/api/wallet/withdraw")
async def withdraw_funds(withdrawal: WithdrawalRequest, current_user = Depends(verify_token)):
    """Withdraw funds from available balance (Freelancer only)"""
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can withdraw funds")
    
    wallet = db.wallets.find_one({"user_id": current_user["user_id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet["available_balance"] < withdrawal.amount:
        raise HTTPException(status_code=400, detail="Insufficient available balance")
    
    if withdrawal.amount <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be positive")
    
    # Create withdrawal transaction
    transaction = {
        "type": "Debit",
        "amount": withdrawal.amount,
        "date": datetime.utcnow(),
        "note": "Freelancer withdrawal"
    }
    
    # Update wallet
    db.wallets.update_one(
        {"user_id": current_user["user_id"]},
        {
            "$inc": {"available_balance": -withdrawal.amount},
            "$push": {"transaction_history": transaction}
        }
    )
    
    return {
        "message": "Withdrawal processed",
        "amount": withdrawal.amount,
        "remaining_balance": wallet["available_balance"] - withdrawal.amount
    }

@app.post("/api/wallet/release-escrow")
async def release_escrow(release: EscrowRelease, current_user = Depends(verify_token)):
    """Release escrow funds to available balance (Admin or Contract completion)"""
    # Only admin can manually release escrow OR system-triggered contract completion
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can manually release escrow")
    
    # Find the contract
    contract = db.contracts.find_one({"id": release.contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract["status"] == "Completed":
        raise HTTPException(status_code=400, detail="Escrow already released for this contract")
    
    # Find freelancer wallet
    wallet = db.wallets.find_one({"user_id": contract["freelancer_id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Freelancer wallet not found")
    
    contract_amount = contract["amount"]
    if wallet["escrow_balance"] < contract_amount:
        raise HTTPException(status_code=400, detail="Insufficient escrow balance")
    
    # Create escrow release transaction
    transaction = {
        "type": "Credit",
        "amount": contract_amount,
        "date": datetime.utcnow(),
        "note": "Escrow released for job completion"
    }
    
    # Move funds from escrow to available balance
    db.wallets.update_one(
        {"user_id": contract["freelancer_id"]},
        {
            "$inc": {
                "escrow_balance": -contract_amount,
                "available_balance": contract_amount
            },
            "$push": {"transaction_history": transaction}
        }
    )
    
    # Update contract status
    db.contracts.update_one(
        {"id": release.contract_id},
        {
            "$set": {
                "status": "Completed",
                "completed_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Escrow released successfully",
        "amount": contract_amount,
        "contract_id": release.contract_id
    }

@app.get("/api/freelancers/featured")
async def get_featured_freelancers():
    """Get featured freelancers for homepage"""
    try:
        # Get verified freelancers with highest ratings
        freelancers = list(db.users.find(
            {"role": "freelancer", "is_verified": True},
            {"password": 0}  # Exclude password
        ).sort([("rating", -1), ("created_at", -1)]).limit(8))
        
        # If no real freelancers, return sample data for now
        if not freelancers:
            return [
                {
                    "id": "sample-1",
                    "full_name": "Thabo Mthembu",
                    "profile": {
                        "profession": "Full-Stack Developer",
                        "hourly_rate": 850,
                        "bio": "Building scalable web applications for South African startups and enterprises",
                        "rating": 4.9,
                        "total_reviews": 127,
                        "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    }
                },
                {
                    "id": "sample-2", 
                    "full_name": "Naledi Motaung",
                    "profile": {
                        "profession": "Digital Marketing Specialist",
                        "hourly_rate": 650,
                        "bio": "Driving growth through strategic digital campaigns across African markets",
                        "rating": 4.8,
                        "total_reviews": 98,
                        "profile_image": "https://images.unsplash.com/photo-1494790108755-2616b9c76f36?w=150&h=150&fit=crop&crop=face"
                    }
                }
            ]
        
        # Format real freelancer data
        featured = []
        for freelancer in freelancers:
            if freelancer.get("profile", {}).get("profession"):
                featured.append({
                    "id": freelancer["id"],
                    "full_name": freelancer["full_name"],
                    "email": freelancer["email"],
                    "profile": {
                        "profession": freelancer.get("profile", {}).get("profession", "Freelancer"),
                        "hourly_rate": freelancer.get("profile", {}).get("hourly_rate", 500),
                        "bio": freelancer.get("profile", {}).get("bio", "Professional freelancer"),
                        "rating": freelancer.get("rating", 4.5),
                        "total_reviews": freelancer.get("total_reviews", 0),
                        "profile_image": freelancer.get("profile", {}).get("profile_image", ""),
                        "skills": freelancer.get("profile", {}).get("skills", []),
                        "location": freelancer.get("profile", {}).get("location", "South Africa")
                    }
                })
        
        return featured[:8]  # Return max 8 featured freelancers
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching featured freelancers: {str(e)}")

@app.get("/api/freelancers/public")
async def get_public_freelancers():
    """Get all public freelancer profiles (for clients to browse)"""
    try:
        freelancers = list(db.users.find(
            {"role": "freelancer", "is_verified": True},
            {"password": 0, "id_document": 0}  # Exclude sensitive data
        ).sort([("rating", -1), ("created_at", -1)]))
        
        # Format freelancer data for public display
        public_freelancers = []
        for freelancer in freelancers:
            if freelancer.get("profile", {}).get("profession"):
                public_freelancers.append({
                    "id": freelancer["id"],
                    "full_name": freelancer["full_name"],
                    "profile": {
                        "profession": freelancer.get("profile", {}).get("profession", "Freelancer"),
                        "hourly_rate": freelancer.get("profile", {}).get("hourly_rate", 500),
                        "bio": freelancer.get("profile", {}).get("bio", "Professional freelancer"),
                        "rating": freelancer.get("rating", 4.5),
                        "total_reviews": freelancer.get("total_reviews", 0),
                        "profile_image": freelancer.get("profile", {}).get("profile_image", ""),
                        "skills": freelancer.get("profile", {}).get("skills", []),
                        "location": freelancer.get("profile", {}).get("location", "South Africa"),
                        "availability": freelancer.get("profile", {}).get("availability", "Available"),
                        "languages": freelancer.get("profile", {}).get("languages", ["English"]),
                        "experience": freelancer.get("profile", {}).get("experience", "1-3 years")
                    },
                    "created_at": freelancer["created_at"],
                    "is_verified": freelancer["is_verified"]
                })
        
        return public_freelancers
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching public freelancers: {str(e)}")

@app.get("/api/freelancers/{freelancer_id}/public")
async def get_freelancer_public_profile(freelancer_id: str):
    """Get a specific freelancer's public profile"""
    freelancer = db.users.find_one(
        {"id": freelancer_id, "role": "freelancer", "is_verified": True},
        {"password": 0, "id_document": 0}
    )
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    # Get freelancer's completed projects/reviews
    contracts = list(db.contracts.find(
        {"freelancer_id": freelancer_id, "status": "Completed"}
    ))
    
    return {
        "id": freelancer["id"],
        "full_name": freelancer["full_name"],
        "profile": freelancer.get("profile", {}),
        "rating": freelancer.get("rating", 4.5),
        "total_reviews": freelancer.get("total_reviews", 0),
        "completed_projects": len(contracts),
        "member_since": freelancer["created_at"],
        "is_verified": freelancer["is_verified"]
    }

@app.get("/api/wallet/transactions")
async def get_transaction_history(current_user = Depends(verify_token)):
    """Get transaction history for current user's wallet"""
    wallet = db.wallets.find_one({"user_id": current_user["user_id"]})
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Return transaction history sorted by date (newest first)
    transactions = wallet.get("transaction_history", [])
    transactions.sort(key=lambda x: x.get("date", datetime.min), reverse=True)
    
    return {
        "transactions": transactions,
        "total_transactions": len(transactions)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)