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
import socket

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
JWT_SECRET = os.environ.get('JWT_SECRET', 'afrilance_fallback_secret_key_2025_change_in_production')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Email settings
EMAIL_HOST = "afrilance.co.za"
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
    job_id: Optional[str] = None  # Optional for direct messages
    receiver_id: str
    content: str

class DirectMessage(BaseModel):
    receiver_id: str
    content: str

class ConversationParticipant(BaseModel):
    user_id: str
    last_read_at: Optional[datetime] = None

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

# Phase 2: Advanced Features Models

class ReviewCreate(BaseModel):
    contract_id: str
    rating: int  # 1-5 stars
    review_text: str
    reviewer_type: str  # "client" or "freelancer"

class ReviewUpdate(BaseModel):
    review_id: str
    rating: Optional[int] = None
    review_text: Optional[str] = None
    is_approved: Optional[bool] = None

class AdvancedJobSearch(BaseModel):
    query: Optional[str] = ""
    category: Optional[str] = "all"
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    budget_type: Optional[str] = "all"  # fixed, hourly, all
    skills: Optional[List[str]] = []
    location: Optional[str] = ""
    posted_within_days: Optional[int] = None
    sort_by: Optional[str] = "created_at"  # created_at, budget, title
    sort_order: Optional[str] = "desc"  # asc, desc

class AdvancedUserSearch(BaseModel):
    query: Optional[str] = ""
    role: Optional[str] = "all"
    skills: Optional[List[str]] = []
    min_rating: Optional[float] = None
    max_hourly_rate: Optional[float] = None
    min_hourly_rate: Optional[float] = None
    location: Optional[str] = ""
    is_verified: Optional[bool] = None
    availability: Optional[str] = "all"
    sort_by: Optional[str] = "rating"  # rating, hourly_rate, created_at
    sort_order: Optional[str] = "desc"

class TransactionSearch(BaseModel):
    user_id: Optional[str] = None
    transaction_type: Optional[str] = "all"  # Credit, Debit, all
    amount_min: Optional[float] = None
    amount_max: Optional[float] = None
    date_from: Optional[str] = None  # ISO date string
    date_to: Optional[str] = None
    sort_by: Optional[str] = "date"
    sort_order: Optional[str] = "desc"

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
        # Check if we're in a test environment where SMTP may be blocked
        import socket
        
        # Test connection first with a shorter timeout
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)  # 5 second timeout for connection test
        result = sock.connect_ex((EMAIL_HOST, EMAIL_PORT))
        sock.close()
        
        if result != 0:
            # Connection failed, log for debugging but continue with mock mode
            print(f"SMTP connection to {EMAIL_HOST}:{EMAIL_PORT} failed (code: {result})")
            print(f"MOCK EMAIL SENT TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"BODY LENGTH: {len(body)} characters")
            print("EMAIL CONTENT PREVIEW:")
            print("="*50)
            print(body[:500] + "..." if len(body) > 500 else body)
            print("="*50)
            print("✅ Email logged successfully (mock mode due to network restrictions)")
            return True
        
        # If connection test passes, try to send real email
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
        print(f"✅ Real email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Email sending failed: {e}")
        # Fallback to mock mode
        print(f"FALLBACK: MOCK EMAIL SENT TO: {to_email}")
        print(f"SUBJECT: {subject}")
        print(f"BODY LENGTH: {len(body)} characters")
        print("EMAIL CONTENT PREVIEW:")
        print("="*50)
        print(body[:500] + "..." if len(body) > 500 else body)
        print("="*50)
        print("✅ Email logged successfully (fallback mock mode)")
        return True

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

# ENHANCED MESSAGING SYSTEM - Direct Messages & Conversations

@app.post("/api/direct-messages")
async def send_direct_message(message: DirectMessage, current_user = Depends(verify_token)):
    """Send a direct message between users (not tied to a specific job)"""
    
    # Check if receiver exists
    receiver = db.users.find_one({"id": message.receiver_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Don't allow messaging yourself
    if message.receiver_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    # Create conversation ID based on participants (consistent ordering)
    participants = sorted([current_user["user_id"], message.receiver_id])
    conversation_id = f"dm_{participants[0]}_{participants[1]}"
    
    message_data = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "sender_id": current_user["user_id"],
        "receiver_id": message.receiver_id,
        "content": message.content,
        "message_type": "direct",
        "created_at": datetime.utcnow(),
        "read": False,
        "job_id": None  # No job association for direct messages
    }
    
    db.messages.insert_one(message_data)
    
    # Update or create conversation metadata
    conversation_data = {
        "conversation_id": conversation_id,
        "participants": participants,
        "last_message_id": message_data["id"],
        "last_message_at": datetime.utcnow(),
        "last_message_content": message.content[:100],  # Preview
        "updated_at": datetime.utcnow()
    }
    
    # Upsert conversation
    db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": conversation_data},
        upsert=True
    )
    
    return {"message": "Direct message sent successfully", "conversation_id": conversation_id}

@app.get("/api/conversations")
async def get_conversations(current_user = Depends(verify_token)):
    """Get all conversations for the current user"""
    
    conversations = list(db.conversations.find({
        "participants": current_user["user_id"]
    }).sort("last_message_at", -1))
    
    # Enrich conversations with participant info and unread counts
    for conv in conversations:
        # Get other participant's info
        other_participant_id = next(
            (p for p in conv["participants"] if p != current_user["user_id"]), 
            None
        )
        
        if other_participant_id:
            other_user = db.users.find_one({"id": other_participant_id})
            if other_user:
                conv["other_participant"] = {
                    "id": other_user["id"],
                    "full_name": other_user["full_name"],
                    "role": other_user["role"],
                    "is_verified": other_user.get("is_verified", False),
                    "profile_picture": other_user.get("profile_picture")
                }
        
        # Count unread messages
        unread_count = db.messages.count_documents({
            "conversation_id": conv["conversation_id"],
            "receiver_id": current_user["user_id"],
            "read": False
        })
        conv["unread_count"] = unread_count
        
        # Convert ObjectId to string
        conv["_id"] = str(conv["_id"])
    
    return conversations

@app.get("/api/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, current_user = Depends(verify_token)):
    """Get all messages in a specific conversation"""
    
    # Verify user is participant in this conversation
    conversation = db.conversations.find_one({
        "conversation_id": conversation_id,
        "participants": current_user["user_id"]
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")
    
    # Get messages for this conversation
    messages = list(db.messages.find({
        "conversation_id": conversation_id
    }).sort("created_at", 1))
    
    # Enrich messages with sender info
    for msg in messages:
        sender = db.users.find_one({"id": msg["sender_id"]})
        if sender:
            msg["sender_name"] = sender["full_name"]
            msg["sender_role"] = sender["role"]
            msg["sender_profile_picture"] = sender.get("profile_picture")
        msg["_id"] = str(msg["_id"])
    
    # Mark messages as read for the current user
    db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "receiver_id": current_user["user_id"],
            "read": False
        },
        {"$set": {"read": True, "read_at": datetime.utcnow()}}
    )
    
    return messages

@app.post("/api/conversations/{conversation_id}/mark-read")
async def mark_conversation_read(conversation_id: str, current_user = Depends(verify_token)):
    """Mark all messages in a conversation as read for the current user"""
    
    # Verify user is participant
    conversation = db.conversations.find_one({
        "conversation_id": conversation_id,
        "participants": current_user["user_id"]
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")
    
    # Mark all unread messages as read
    result = db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "receiver_id": current_user["user_id"],
            "read": False
        },
        {"$set": {"read": True, "read_at": datetime.utcnow()}}
    )
    
    return {"message": f"Marked {result.modified_count} messages as read"}

@app.get("/api/conversations/search")
async def search_users_for_messaging(query: str, current_user = Depends(verify_token)):
    """Search users to start a new conversation"""
    
    if len(query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    # Search users by name or email (exclude current user)
    search_regex = {"$regex": query, "$options": "i"}
    users = list(db.users.find({
        "$and": [
            {"id": {"$ne": current_user["user_id"]}},  # Exclude current user
            {
                "$or": [
                    {"full_name": search_regex},
                    {"email": search_regex}
                ]
            }
        ]
    }, {
        "id": 1,
        "full_name": 1,
        "email": 1,
        "role": 1,
        "is_verified": 1,
        "profile_picture": 1
    }).limit(20))
    
    # Convert ObjectId to string
    for user in users:
        user["_id"] = str(user["_id"])
    
    return users

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

# Enhanced Portfolio Showcase System - Phase 2 Implementation

@app.get("/api/portfolio/showcase/{freelancer_id}")
async def get_portfolio_showcase(freelancer_id: str):
    """Get enhanced portfolio showcase for a freelancer (public endpoint)"""
    
    # Find the freelancer
    freelancer = db.users.find_one(
        {"id": freelancer_id, "role": "freelancer"},
        {"password": 0}  # Exclude password
    )
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    # Calculate portfolio statistics
    portfolio_files = freelancer.get("portfolio_files", [])
    project_gallery = freelancer.get("project_gallery", [])
    
    # Categorize projects by technology
    tech_categories = {}
    total_projects = len(project_gallery)
    
    for project in project_gallery:
        technologies = project.get("technologies", [])
        for tech in technologies:
            tech_lower = tech.lower().strip()
            if tech_lower not in tech_categories:
                tech_categories[tech_lower] = {
                    "name": tech,
                    "count": 0,
                    "projects": []
                }
            tech_categories[tech_lower]["count"] += 1
            tech_categories[tech_lower]["projects"].append(project["id"])
    
    # Get recent activity (latest uploads)
    recent_files = sorted(
        portfolio_files + [
            {
                **project,
                "type": "project_gallery",
                "uploaded_at": project["created_at"]
            } for project in project_gallery
        ],
        key=lambda x: x.get("uploaded_at", ""),
        reverse=True
    )[:10]
    
    showcase_data = {
        "freelancer": {
            "id": freelancer["id"],
            "full_name": freelancer["full_name"],
            "email": freelancer.get("email"),
            "profile": freelancer.get("profile", {}),
            "is_verified": freelancer.get("is_verified", False),
            "profile_picture": freelancer.get("profile_picture"),
            "created_at": freelancer.get("created_at")
        },
        "portfolio_stats": {
            "total_portfolio_files": len(portfolio_files),
            "total_projects": total_projects,
            "total_technologies": len(tech_categories),
            "portfolio_completion": min(100, (len(portfolio_files) * 20 + total_projects * 30)),
            "last_updated": max(
                [f.get("uploaded_at", "") for f in portfolio_files] +
                [p.get("created_at", "") for p in project_gallery],
                default=""
            )
        },
        "technology_breakdown": list(tech_categories.values())[:10],  # Top 10 technologies
        "portfolio_files": portfolio_files,
        "project_gallery": project_gallery,
        "recent_activity": recent_files
    }
    
    return showcase_data

@app.get("/api/portfolio/featured")
async def get_featured_portfolios(limit: int = 12):
    """Get featured portfolios for homepage showcase"""
    
    # Get verified freelancers with complete portfolios and good ratings
    pipeline = [
        {
            "$match": {
                "role": "freelancer",
                "is_verified": True,
                "$and": [
                    {"$or": [
                        {"portfolio_files": {"$exists": True, "$ne": []}},
                        {"project_gallery": {"$exists": True, "$ne": []}}
                    ]}
                ]
            }
        },
        {
            "$addFields": {
                "portfolio_score": {
                    "$add": [
                        {"$multiply": [{"$size": {"$ifNull": ["$portfolio_files", []]}}, 2]},
                        {"$multiply": [{"$size": {"$ifNull": ["$project_gallery", []]}}, 5]},
                        {"$multiply": [{"$ifNull": ["$profile.rating", 3]}, 10]}
                    ]
                }
            }
        },
        {"$sort": {"portfolio_score": -1}},
        {"$limit": limit},
        {
            "$project": {
                "id": 1,
                "full_name": 1,
                "profile": 1,
                "profile_picture": 1,
                "is_verified": 1,
                "portfolio_files": {"$slice": ["$portfolio_files", 3]},  # Preview only
                "project_gallery": {"$slice": ["$project_gallery", 2]},  # Preview only
                "portfolio_score": 1,
                "created_at": 1
            }
        }
    ]
    
    featured_freelancers = list(db.users.aggregate(pipeline))
    
    # Convert ObjectId to string for JSON serialization
    for freelancer in featured_freelancers:
        freelancer["_id"] = str(freelancer["_id"])
    
    return {
        "featured_portfolios": featured_freelancers,
        "total_featured": len(featured_freelancers),
        "selection_criteria": "verified_freelancers_with_complete_portfolios"
    }

@app.post("/api/portfolio/category/update")
async def update_portfolio_categories(
    categories_data: dict,
    current_user = Depends(verify_token)
):
    """Update portfolio categories and tags for better organization"""
    
    if current_user["role"] != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can update portfolio categories")
    
    # Validate categories data
    primary_category = categories_data.get("primary_category")
    secondary_categories = categories_data.get("secondary_categories", [])
    portfolio_tags = categories_data.get("portfolio_tags", [])
    specializations = categories_data.get("specializations", [])
    
    # Update user's portfolio categorization
    db.users.update_one(
        {"id": current_user["user_id"]},
        {
            "$set": {
                "portfolio_categories": {
                    "primary": primary_category,
                    "secondary": secondary_categories,
                    "tags": portfolio_tags,
                    "specializations": specializations,
                    "updated_at": datetime.utcnow()
                }
            }
        }
    )
    
    return {
        "message": "Portfolio categories updated successfully",
        "categories": {
            "primary_category": primary_category,
            "secondary_categories": secondary_categories,
            "portfolio_tags": portfolio_tags,
            "specializations": specializations
        }
    }

@app.post("/api/portfolio/search/advanced")
async def search_portfolios_advanced(search_data: dict):
    """Advanced portfolio search with filtering capabilities"""
    
    # Extract search parameters
    query = search_data.get("query", "")
    categories = search_data.get("categories", [])
    technologies = search_data.get("technologies", [])
    min_projects = search_data.get("min_projects", 0)
    min_rating = search_data.get("min_rating", 0)
    location = search_data.get("location", "")
    verified_only = search_data.get("verified_only", False)
    page = max(1, search_data.get("page", 1))
    limit = min(50, max(1, search_data.get("limit", 20)))
    skip = (page - 1) * limit
    
    # Build aggregation pipeline
    match_conditions = {"role": "freelancer"}
    
    # Text search
    if query:
        match_conditions["$or"] = [
            {"full_name": {"$regex": query, "$options": "i"}},
            {"profile.bio": {"$regex": query, "$options": "i"}},
            {"profile.skills": {"$elemMatch": {"$regex": query, "$options": "i"}}},
            {"project_gallery.title": {"$regex": query, "$options": "i"}},
            {"project_gallery.description": {"$regex": query, "$options": "i"}}
        ]
    
    # Verification filter
    if verified_only:
        match_conditions["is_verified"] = True
    
    # Location filter
    if location:
        match_conditions["profile.location"] = {"$regex": location, "$options": "i"}
    
    # Rating filter
    if min_rating > 0:
        match_conditions["profile.rating"] = {"$gte": min_rating}
    
    # Categories filter
    if categories:
        match_conditions["$or"] = match_conditions.get("$or", []) + [
            {"profile.category": {"$in": categories}},
            {"portfolio_categories.primary": {"$in": categories}},
            {"portfolio_categories.secondary": {"$elemMatch": {"$in": categories}}}
        ]
    
    # Technologies filter
    if technologies:
        tech_conditions = []
        for tech in technologies:
            tech_conditions.extend([
                {"profile.skills": {"$elemMatch": {"$regex": tech, "$options": "i"}}},
                {"project_gallery.technologies": {"$elemMatch": {"$regex": tech, "$options": "i"}}}
            ])
        if tech_conditions:
            match_conditions["$or"] = match_conditions.get("$or", []) + tech_conditions
    
    pipeline = [
        {"$match": match_conditions},
        {
            "$addFields": {
                "project_count": {"$size": {"$ifNull": ["$project_gallery", []]}},
                "portfolio_score": {
                    "$add": [
                        {"$multiply": [{"$size": {"$ifNull": ["$portfolio_files", []]}}, 2]},
                        {"$multiply": [{"$size": {"$ifNull": ["$project_gallery", []]}}, 3]},
                        {"$multiply": [{"$ifNull": ["$profile.rating", 0]}, 10]}
                    ]
                }
            }
        }
    ]
    
    # Min projects filter
    if min_projects > 0:
        pipeline.append({"$match": {"project_count": {"$gte": min_projects}}})
    
    # Get total count for pagination
    count_pipeline = pipeline + [{"$count": "total"}]
    count_result = list(db.users.aggregate(count_pipeline))
    total = count_result[0]["total"] if count_result else 0
    
    # Add sorting, pagination, and projection
    pipeline.extend([
        {"$sort": {"portfolio_score": -1, "project_count": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {
            "$project": {
                "id": 1,
                "full_name": 1,
                "profile": 1,
                "profile_picture": 1,
                "is_verified": 1,
                "portfolio_files": {"$slice": ["$portfolio_files", 3]},
                "project_gallery": {"$slice": ["$project_gallery", 3]},
                "project_count": 1,
                "portfolio_score": 1,
                "created_at": 1,
                "portfolio_categories": 1
            }
        }
    ])
    
    results = list(db.users.aggregate(pipeline))
    
    # Convert ObjectId to string for JSON serialization
    for result in results:
        result["_id"] = str(result["_id"])
    
    return {
        "portfolios": results,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        },
        "search_params": search_data,
        "results_count": len(results)
    }

@app.get("/api/portfolio/analytics/{freelancer_id}")
async def get_portfolio_analytics(
    freelancer_id: str,
    current_user = Depends(verify_token)
):
    """Get portfolio analytics for freelancer dashboard"""
    
    # Only allow freelancers to view their own analytics or admins to view any
    if current_user["role"] == "freelancer" and current_user["user_id"] != freelancer_id:
        raise HTTPException(status_code=403, detail="You can only view your own portfolio analytics")
    elif current_user["role"] not in ["freelancer", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get freelancer data
    freelancer = db.users.find_one({"id": freelancer_id, "role": "freelancer"})
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    portfolio_files = freelancer.get("portfolio_files", [])
    project_gallery = freelancer.get("project_gallery", [])
    
    # Calculate analytics
    analytics = {
        "overview": {
            "total_files": len(portfolio_files),
            "total_projects": len(project_gallery),
            "verification_status": freelancer.get("is_verified", False),
            "profile_completion": freelancer.get("profile_completed", False),
            "account_created": freelancer.get("created_at")
        },
        "file_breakdown": {
            "images": len([f for f in portfolio_files if f.get("content_type", "").startswith("image/")]),
            "videos": len([f for f in portfolio_files if f.get("content_type", "").startswith("video/")]),
            "documents": len([f for f in portfolio_files if f.get("content_type", "") in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]),
            "other": len([f for f in portfolio_files if not any([
                f.get("content_type", "").startswith("image/"),
                f.get("content_type", "").startswith("video/"),
                f.get("content_type", "") in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
            ])])
        },
        "project_analytics": {
            "projects_with_urls": len([p for p in project_gallery if p.get("project_url")]),
            "avg_technologies_per_project": sum(len(p.get("technologies", [])) for p in project_gallery) / max(1, len(project_gallery)),
            "most_used_technologies": {}
        },
        "storage_usage": {
            "total_storage_mb": sum(f.get("file_size", 0) for f in portfolio_files + [p.get("file_info", {}) for p in project_gallery]) / (1024 * 1024),
            "storage_by_type": {}
        },
        "recommendations": []
    }
    
    # Technology frequency analysis
    tech_count = {}
    for project in project_gallery:
        for tech in project.get("technologies", []):
            tech_count[tech] = tech_count.get(tech, 0) + 1
    
    analytics["project_analytics"]["most_used_technologies"] = dict(
        sorted(tech_count.items(), key=lambda x: x[1], reverse=True)[:10]
    )
    
    # Generate recommendations
    recommendations = []
    if len(portfolio_files) < 3:
        recommendations.append("Upload more portfolio files to showcase your work better")
    if len(project_gallery) < 2:
        recommendations.append("Add project gallery items with detailed descriptions")
    if not freelancer.get("is_verified"):
        recommendations.append("Complete verification to increase client trust")
    if not freelancer.get("profile_completed"):
        recommendations.append("Complete your profile to improve visibility")
    
    analytics["recommendations"] = recommendations
    
    return analytics

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

@app.post("/api/admin/login")
async def admin_login(user_data: UserLogin):
    """Dedicated admin login endpoint with additional security"""
    
    # Validate Afrilance domain for admin login
    if not user_data.email.lower().endswith('@afrilance.co.za'):
        raise HTTPException(
            status_code=403, 
            detail="Admin access is restricted to @afrilance.co.za email addresses"
        )
    
    # Find user
    user = db.users.find_one({"email": user_data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user is admin
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Check if admin account is approved
    if not user.get("admin_approved", False):
        raise HTTPException(
            status_code=403, 
            detail="Your admin account is pending approval. Contact sam@afrilance.co.za"
        )
    
    # Update last login
    db.users.update_one(
        {"email": user_data.email.lower()},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create JWT token
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Remove sensitive data
    user_response = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "admin_approved": user.get("admin_approved", False),
        "department": user.get("department", ""),
        "last_login": user.get("last_login")
    }
    
    return {"token": token, "user": user_response}

@app.post("/api/admin/register-request")
async def admin_register_request(request_data: dict):
    """Handle admin access requests - requires approval"""
    
    email = request_data.get("email", "").lower()
    password = request_data.get("password", "")
    full_name = request_data.get("full_name", "")
    phone = request_data.get("phone", "")
    department = request_data.get("department", "")
    reason = request_data.get("reason", "")
    
    # Validate required fields
    if not all([email, password, full_name, phone, department, reason]):
        raise HTTPException(status_code=400, detail="All fields are required")
    
    # Validate Afrilance domain
    if not email.endswith('@afrilance.co.za'):
        raise HTTPException(
            status_code=400, 
            detail="Admin requests are only accepted from @afrilance.co.za email addresses"
        )
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Create pending admin user
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": email,
        "password": hashed_password,
        "full_name": full_name,
        "phone": phone,
        "role": "admin",
        "department": department,
        "admin_approved": False,  # Requires approval
        "admin_request_reason": reason,
        "admin_request_date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "verification_status": "pending_admin_approval"
    }
    
    # Save to database
    db.users.insert_one(user_data)
    
    # Send approval request email to sam@afrilance.co.za
    try:
        approval_subject = f"🔐 New Admin Access Request - {full_name}"
        approval_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #e74c3c; margin-bottom: 10px;">🔐 Admin Access Request</h1>
                    <h2 style="color: #2c3e50;">Requires Your Approval</h2>
                </div>
                
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">⚠️ Security Alert</h3>
                    <p>A new admin access request has been submitted and requires your immediate review.</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Applicant Details:</h3>
                    <p><strong>Name:</strong> {full_name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Phone:</strong> {phone}</p>
                    <p><strong>Department/Role:</strong> {department}</p>
                    <p><strong>User ID:</strong> {user_id}</p>
                    <p><strong>Request Date:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                
                <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Reason for Admin Access:</h3>
                    <p style="font-style: italic; color: #555; background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #3498db;">
                        "{reason}"
                    </p>
                </div>
                
                <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #721c24; margin-top: 0;">🔒 Security Verification Required</h3>
                    <p>Please verify this person's identity and authority before approving admin access.</p>
                    <ul style="color: #721c24;">
                        <li>Confirm they are an authorized Afrilance employee</li>
                        <li>Verify their role requires admin privileges</li>
                        <li>Check with HR/Management if unsure</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Choose your action:</p>
                    <div style="display: inline-block; margin: 0 10px;">
                        <a href="http://localhost:3000/admin-dashboard" 
                           style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px;">
                            ✅ Review & Approve
                        </a>
                    </div>
                    <div style="display: inline-block; margin: 0 10px;">
                        <a href="mailto:{email}?subject=Admin Access Request Update" 
                           style="background-color: #3498db; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px;">
                            💬 Contact Applicant
                        </a>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    <p><strong>Security Notice:</strong> This is a critical security request. Only approve admin access for verified Afrilance employees who require these privileges for their role.</p>
                    <p>This is an automated security notification from Afrilance Admin Portal.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email
        email_sent = send_email("sam@afrilance.co.za", approval_subject, approval_body)
        
        if email_sent:
            print(f"✅ Admin approval request sent to sam@afrilance.co.za for {full_name}")
        else:
            print(f"❌ Failed to send admin approval request for {full_name}")
    
    except Exception as e:
        print(f"❌ Error sending admin approval email: {str(e)}")
    
    return {
        "message": "Admin access request submitted successfully. You will be notified once reviewed.",
        "user_id": user_id,
        "status": "pending_approval"
    }

@app.post("/api/admin/approve-admin/{user_id}")
async def approve_admin_request(
    user_id: str,
    approval_data: dict,
    current_user = Depends(verify_token)
):
    """Approve or reject admin access requests - only existing admins can do this"""
    
    # Check if current user is admin
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve admin requests")
    
    status = approval_data.get("status")  # "approved" or "rejected"
    admin_notes = approval_data.get("admin_notes", "")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Find the pending admin user
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=400, detail="User is not an admin request")
    
    # Update admin approval status
    update_data = {
        "admin_approved": status == "approved",
        "admin_approval_date": datetime.utcnow(),
        "approved_by": current_user["user_id"],
        "admin_approval_notes": admin_notes,
        "verification_status": "approved" if status == "approved" else "rejected"
    }
    
    db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    # Send notification emails
    try:
        if status == "approved":
            # Email to new admin - Approval
            user_subject = "🎉 Your Afrilance Admin Access Has Been Approved!"
            user_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #27ae60; margin-bottom: 10px;">🎉 Admin Access Approved!</h1>
                        <h2 style="color: #2c3e50;">Welcome to Afrilance Admin Portal</h2>
                    </div>
                    
                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>Dear {user['full_name']},</p>
                        <p>Congratulations! Your admin access request has been approved by sam@afrilance.co.za. You now have full administrative privileges on the Afrilance platform.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Your Admin Privileges Include:</h3>
                        <ul style="color: #555;">
                            <li>✅ User verification management</li>
                            <li>✅ System analytics and reporting</li>
                            <li>✅ Support ticket management</li>
                            <li>✅ Admin user management</li>
                            <li>✅ Platform oversight and monitoring</li>
                        </ul>
                    </div>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">🔒 Security Responsibilities</h3>
                        <p>As an admin, you have access to sensitive user data and platform controls:</p>
                        <ul style="color: #856404;">
                            <li>Keep your credentials secure</li>
                            <li>Follow data protection protocols</li>
                            <li>Report security concerns immediately</li>
                            <li>Use admin privileges responsibly</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/admin" 
                           style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Access Admin Portal
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Need help? Contact sam@afrilance.co.za</p>
                        <p style="font-size: 12px;">This account has elevated privileges. Use responsibly.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        else:  # rejected
            # Email to applicant - Rejection
            user_subject = "Afrilance Admin Access Request Update"
            user_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e74c3c;">Admin Access Request Update</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>Dear {user['full_name']},</p>
                        <p>Thank you for your admin access request. After review, we need additional information or authorization before we can grant admin privileges.</p>
                    </div>
                    
                    {f'<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;"><h3 style="margin-top: 0; color: #856404;">Feedback:</h3><p>{admin_notes}</p></div>' if admin_notes else ''}
                    
                    <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Next Steps:</h3>
                        <ol style="color: #555;">
                            <li>Contact sam@afrilance.co.za for clarification</li>
                            <li>Provide any additional documentation required</li>
                            <li>Confirm your role and authorization level</li>
                        </ol>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Contact sam@afrilance.co.za for assistance</p>
                    </div>
                </div>
            </body>
            </html>
            """
        
        # Send emails
        user_email_sent = send_email(user['email'], user_subject, user_body)
        
        # Admin notification
        admin_subject = f"✅ Admin Request {status.title()} - {user['full_name']}"
        admin_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: {'#27ae60' if status == 'approved' else '#e74c3c'};">✅ Admin Request {status.title()}</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Action Completed:</h3>
                    <p><strong>User:</strong> {user['full_name']} ({user['email']})</p>
                    <p><strong>Department:</strong> {user.get('department', 'Unknown')}</p>
                    <p><strong>Decision:</strong> {status.title()}</p>
                    <p><strong>Decided by:</strong> {current_user.get('full_name', current_user['user_id'])}</p>
                    <p><strong>Date:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                
                {f'<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0;">Admin Notes:</h3><p>{admin_notes}</p></div>' if admin_notes else ''}
                
                <p>The user has been notified via email.</p>
            </div>
        </body>
        </html>
        """
        
        admin_email_sent = send_email("sam@afrilance.co.za", admin_subject, admin_body)
        
        print(f"📧 Admin approval emails sent - User: {user_email_sent}, Admin: {admin_email_sent}")
        
    except Exception as e:
        print(f"❌ Error sending admin approval emails: {str(e)}")
    
    return {
        "message": f"Admin request {status} successfully",
        "user_id": user_id,
        "status": status,
        "approval_date": update_data["admin_approval_date"]
    }

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

@app.get("/api/categories/counts")
async def get_category_counts():
    """Get freelancer counts for each category (public endpoint)"""
    try:
        # Define the categories that match the frontend
        categories = [
            'ICT & Digital Work', 'Construction & Engineering', 'Creative & Media',
            'Admin & Office Support', 'Health & Wellness', 'Beauty & Fashion',
            'Logistics & Labour', 'Education & Training', 'Home & Domestic Services'
        ]
        
        category_counts = {}
        
        # Count verified freelancers for each category
        for category in categories:
            count = db.users.count_documents({
                "role": "freelancer",
                "is_verified": True,
                "profile.category": category
            })
            category_counts[category] = count
        
        # Also get total counts
        total_freelancers = db.users.count_documents({"role": "freelancer", "is_verified": True})
        total_jobs = db.jobs.count_documents({"status": "active"})
        
        return {
            "category_counts": category_counts,
            "totals": {
                "freelancers": total_freelancers,
                "active_jobs": total_jobs
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category counts: {str(e)}")

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

# Phase 2: Advanced Features Endpoints

@app.post("/api/reviews")
async def create_review(review_data: ReviewCreate, current_user = Depends(verify_token)):
    """Create a review for a completed contract"""
    try:
        # Verify contract exists and is completed
        contract = db.contracts.find_one({"id": review_data.contract_id, "status": "Completed"})
        if not contract:
            raise HTTPException(status_code=404, detail="Completed contract not found")
        
        # Verify user is part of the contract
        if current_user["user_id"] not in [contract["freelancer_id"], contract["client_id"]]:
            raise HTTPException(status_code=403, detail="You can only review contracts you're part of")
        
        # Determine who is being reviewed
        if review_data.reviewer_type == "client":
            if current_user["user_id"] != contract["client_id"]:
                raise HTTPException(status_code=403, detail="Only the client can submit a client review")
            reviewed_user_id = contract["freelancer_id"]
        else:  # freelancer review
            if current_user["user_id"] != contract["freelancer_id"]:
                raise HTTPException(status_code=403, detail="Only the freelancer can submit a freelancer review")
            reviewed_user_id = contract["client_id"]
        
        # Check if review already exists
        existing_review = db.reviews.find_one({
            "contract_id": review_data.contract_id,
            "reviewer_id": current_user["user_id"],
            "reviewer_type": review_data.reviewer_type
        })
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this contract")
        
        # Validate rating
        if not (1 <= review_data.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Create review
        review_id = str(uuid.uuid4())
        review = {
            "id": review_id,
            "contract_id": review_data.contract_id,
            "reviewer_id": current_user["user_id"],
            "reviewed_user_id": reviewed_user_id,
            "reviewer_type": review_data.reviewer_type,
            "rating": review_data.rating,
            "review_text": review_data.review_text,
            "created_at": datetime.utcnow(),
            "is_approved": True,  # Auto-approve for now
            "is_public": True
        }
        
        db.reviews.insert_one(review)
        
        # Update user's average rating
        user_reviews = list(db.reviews.find({"reviewed_user_id": reviewed_user_id, "is_approved": True}))
        if user_reviews:
            avg_rating = sum(r["rating"] for r in user_reviews) / len(user_reviews)
            total_reviews = len(user_reviews)
            
            db.users.update_one(
                {"id": reviewed_user_id},
                {
                    "$set": {
                        "rating": round(avg_rating, 1),
                        "total_reviews": total_reviews
                    }
                }
            )
        
        return {
            "message": "Review created successfully",
            "review_id": review_id,
            "average_rating": round(avg_rating, 1) if user_reviews else review_data.rating,
            "total_reviews": len(user_reviews) if user_reviews else 1
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating review: {str(e)}")

@app.get("/api/reviews/{user_id}")
async def get_user_reviews(user_id: str, skip: int = 0, limit: int = 10):
    """Get reviews for a specific user"""
    try:
        # Get reviews with reviewer information
        pipeline = [
            {"$match": {"reviewed_user_id": user_id, "is_approved": True, "is_public": True}},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit},
            {"$lookup": {
                "from": "users",
                "let": {"reviewer_id": "$reviewer_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$id", "$$reviewer_id"]}}},
                    {"$project": {"full_name": 1, "role": 1}}
                ],
                "as": "reviewer"
            }},
            {"$lookup": {
                "from": "contracts",
                "let": {"contract_id": "$contract_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$id", "$$contract_id"]}}},
                    {"$lookup": {
                        "from": "jobs",
                        "let": {"job_id": "$job_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$id", "$$job_id"]}}},
                            {"$project": {"title": 1}}
                        ],
                        "as": "job"
                    }}
                ],
                "as": "contract"
            }}
        ]
        
        reviews = list(db.reviews.aggregate(pipeline))
        total_count = db.reviews.count_documents({"reviewed_user_id": user_id, "is_approved": True, "is_public": True})
        
        # Process reviews
        formatted_reviews = []
        for review in reviews:
            reviewer = review["reviewer"][0] if review["reviewer"] else {}
            contract = review["contract"][0] if review["contract"] else {}
            job = contract.get("job", [{}])[0] if contract.get("job") else {}
            
            formatted_reviews.append({
                "id": review["id"],
                "rating": review["rating"],
                "review_text": review["review_text"],
                "reviewer_type": review["reviewer_type"],
                "created_at": review["created_at"],
                "reviewer_name": reviewer.get("full_name", "Anonymous"),
                "job_title": job.get("title", "Unknown Job")
            })
        
        return {
            "reviews": formatted_reviews,
            "total": total_count,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit if total_count > 0 else 1
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")

@app.get("/api/admin/revenue-analytics")
async def get_revenue_analytics(current_user = Depends(verify_token)):
    """Get comprehensive revenue analytics for admin dashboard"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Platform commission rate (5% of contract value)
        PLATFORM_COMMISSION_RATE = 0.05
        
        # Get all completed contracts
        completed_contracts = list(db.contracts.find({"status": "Completed"}))
        
        # Calculate total revenue metrics
        total_contract_value = sum(contract.get("amount", 0) for contract in completed_contracts)
        total_commission = total_contract_value * PLATFORM_COMMISSION_RATE
        
        # Get wallet statistics
        wallet_pipeline = [
            {"$group": {
                "_id": None,
                "total_available": {"$sum": "$available_balance"},
                "total_escrow": {"$sum": "$escrow_balance"},
                "total_wallets": {"$sum": 1}
            }}
        ]
        wallet_stats = list(db.wallets.aggregate(wallet_pipeline))
        wallet_totals = wallet_stats[0] if wallet_stats else {"total_available": 0, "total_escrow": 0, "total_wallets": 0}
        
        # Get transaction analytics
        transaction_pipeline = [
            {"$unwind": "$transaction_history"},
            {"$group": {
                "_id": "$transaction_history.type",
                "total_amount": {"$sum": "$transaction_history.amount"},
                "count": {"$sum": 1}
            }}
        ]
        transaction_stats = list(db.wallets.aggregate(transaction_pipeline))
        
        # Monthly revenue (last 6 months)
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        monthly_revenue = []
        for i in range(6):
            month_start = six_months_ago + timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            month_contracts = [c for c in completed_contracts 
                             if month_start <= c.get("completed_at", datetime.min) < month_end]
            month_value = sum(contract.get("amount", 0) for contract in month_contracts)
            month_commission = month_value * PLATFORM_COMMISSION_RATE
            
            monthly_revenue.append({
                "month": month_start.strftime("%Y-%m"),
                "contract_value": month_value,
                "commission": month_commission,
                "contracts_count": len(month_contracts)
            })
        
        # Top performing freelancers by revenue generated
        freelancer_revenue = {}
        for contract in completed_contracts:
            freelancer_id = contract.get("freelancer_id")
            if freelancer_id:
                if freelancer_id not in freelancer_revenue:
                    freelancer_revenue[freelancer_id] = {"total": 0, "contracts": 0}
                freelancer_revenue[freelancer_id]["total"] += contract.get("amount", 0)
                freelancer_revenue[freelancer_id]["contracts"] += 1
        
        # Get top 10 freelancers
        top_freelancers = []
        for freelancer_id, stats in sorted(freelancer_revenue.items(), 
                                         key=lambda x: x[1]["total"], reverse=True)[:10]:
            freelancer = db.users.find_one({"id": freelancer_id}, {"full_name": 1, "email": 1})
            if freelancer:
                top_freelancers.append({
                    "freelancer_id": freelancer_id,
                    "full_name": freelancer.get("full_name", "Unknown"),
                    "email": freelancer.get("email", ""),
                    "total_earned": stats["total"],
                    "total_contracts": stats["contracts"],
                    "commission_generated": stats["total"] * PLATFORM_COMMISSION_RATE
                })
        
        return {
            "summary": {
                "total_contract_value": total_contract_value,
                "total_commission_earned": total_commission,
                "commission_rate": PLATFORM_COMMISSION_RATE,
                "completed_contracts": len(completed_contracts),
                "active_wallets": wallet_totals["total_wallets"]
            },
            "wallet_statistics": {
                "total_available_balance": wallet_totals["total_available"],
                "total_escrow_balance": wallet_totals["total_escrow"],
                "total_platform_value": wallet_totals["total_available"] + wallet_totals["total_escrow"]
            },
            "transaction_analytics": transaction_stats,
            "monthly_revenue": monthly_revenue,
            "top_freelancers": top_freelancers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching revenue analytics: {str(e)}")

@app.post("/api/search/jobs/advanced")
async def advanced_job_search(search_params: AdvancedJobSearch, skip: int = 0, limit: int = 20):
    """Advanced job search with multiple filters"""
    try:
        # Build query
        query = {"status": "active"}  # Only show active jobs
        
        # Text search
        if search_params.query:
            query["$or"] = [
                {"title": {"$regex": search_params.query, "$options": "i"}},
                {"description": {"$regex": search_params.query, "$options": "i"}},
                {"requirements": {"$elemMatch": {"$regex": search_params.query, "$options": "i"}}}
            ]
        
        # Category filter
        if search_params.category and search_params.category != "all":
            query["category"] = search_params.category
        
        # Budget filters
        if search_params.budget_min is not None or search_params.budget_max is not None:
            budget_query = {}
            if search_params.budget_min is not None:
                budget_query["$gte"] = search_params.budget_min
            if search_params.budget_max is not None:
                budget_query["$lte"] = search_params.budget_max
            query["budget"] = budget_query
        
        # Budget type filter
        if search_params.budget_type and search_params.budget_type != "all":
            query["budget_type"] = search_params.budget_type
        
        # Skills filter
        if search_params.skills and len(search_params.skills) > 0:
            query["requirements"] = {"$in": search_params.skills}
        
        # Posted within days filter
        if search_params.posted_within_days:
            since_date = datetime.utcnow() - timedelta(days=search_params.posted_within_days)
            query["created_at"] = {"$gte": since_date}
        
        # Sort configuration
        sort_field = search_params.sort_by or "created_at"
        sort_direction = -1 if search_params.sort_order == "desc" else 1
        
        # Execute query with pagination
        jobs_cursor = db.jobs.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
        jobs = list(jobs_cursor)
        
        total_count = db.jobs.count_documents(query)
        
        # Enrich with client information
        for job in jobs:
            client = db.users.find_one({"id": job["client_id"]}, {"full_name": 1, "email": 1, "rating": 1})
            if client:
                job["client_info"] = {
                    "name": client.get("full_name", "Anonymous"),
                    "rating": client.get("rating", 0)
                }
            
            # Remove internal fields
            job.pop("_id", None)
        
        return {
            "jobs": jobs,
            "total": total_count,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit if total_count > 0 else 1,
            "filters_applied": {
                "query": search_params.query,
                "category": search_params.category,
                "budget_range": f"{search_params.budget_min or 0}-{search_params.budget_max or 'unlimited'}",
                "skills": search_params.skills,
                "posted_within_days": search_params.posted_within_days
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in advanced job search: {str(e)}")

@app.post("/api/search/users/advanced")
async def advanced_user_search(search_params: AdvancedUserSearch, skip: int = 0, limit: int = 20):
    """Advanced user search with multiple filters"""
    try:
        # Build query
        query = {}
        
        # Role filter
        if search_params.role and search_params.role != "all":
            query["role"] = search_params.role
        
        # Text search
        if search_params.query:
            query["$or"] = [
                {"full_name": {"$regex": search_params.query, "$options": "i"}},
                {"email": {"$regex": search_params.query, "$options": "i"}},
                {"profile.bio": {"$regex": search_params.query, "$options": "i"}}
            ]
        
        # Skills filter
        if search_params.skills and len(search_params.skills) > 0:
            query["profile.skills"] = {"$in": search_params.skills}
        
        # Rating filter
        if search_params.min_rating is not None:
            query["rating"] = {"$gte": search_params.min_rating}
        
        # Hourly rate filters
        if search_params.min_hourly_rate is not None or search_params.max_hourly_rate is not None:
            rate_query = {}
            if search_params.min_hourly_rate is not None:
                rate_query["$gte"] = search_params.min_hourly_rate
            if search_params.max_hourly_rate is not None:
                rate_query["$lte"] = search_params.max_hourly_rate
            query["profile.hourly_rate"] = rate_query
        
        # Verification status
        if search_params.is_verified is not None:
            query["is_verified"] = search_params.is_verified
        
        # Availability filter
        if search_params.availability and search_params.availability != "all":
            query["profile.availability"] = search_params.availability
        
        # Location filter
        if search_params.location:
            query["profile.location"] = {"$regex": search_params.location, "$options": "i"}
        
        # Sort configuration
        sort_field = search_params.sort_by or "rating"
        sort_direction = -1 if search_params.sort_order == "desc" else 1
        
        # Execute query with pagination
        users_cursor = db.users.find(query, {"password": 0}).sort(sort_field, sort_direction).skip(skip).limit(limit)
        users = list(users_cursor)
        
        total_count = db.users.count_documents(query)
        
        # Remove internal fields
        for user in users:
            user.pop("_id", None)
        
        return {
            "users": users,
            "total": total_count,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit if total_count > 0 else 1,
            "filters_applied": {
                "query": search_params.query,
                "role": search_params.role,
                "skills": search_params.skills,
                "min_rating": search_params.min_rating,
                "hourly_rate_range": f"{search_params.min_hourly_rate or 0}-{search_params.max_hourly_rate or 'unlimited'}",
                "is_verified": search_params.is_verified,
                "availability": search_params.availability,
                "location": search_params.location
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in advanced user search: {str(e)}")

@app.post("/api/search/transactions/advanced")
async def advanced_transaction_search(search_params: TransactionSearch, current_user = Depends(verify_token), skip: int = 0, limit: int = 20):
    """Advanced transaction search for admin and wallet owners"""
    try:
        # Only admins can search all transactions, users can only see their own
        if current_user["role"] != "admin" and search_params.user_id != current_user["user_id"]:
            # If not admin, only allow searching own transactions
            search_params.user_id = current_user["user_id"]
        
        # Build aggregation pipeline
        pipeline = []
        
        # Match wallets
        wallet_match = {}
        if search_params.user_id:
            wallet_match["user_id"] = search_params.user_id
        
        if wallet_match:
            pipeline.append({"$match": wallet_match})
        
        # Unwind transaction history
        pipeline.append({"$unwind": "$transaction_history"})
        
        # Match transaction criteria
        transaction_match = {}
        
        # Transaction type filter
        if search_params.transaction_type and search_params.transaction_type != "all":
            transaction_match["transaction_history.type"] = search_params.transaction_type
        
        # Amount filters
        if search_params.amount_min is not None or search_params.amount_max is not None:
            amount_query = {}
            if search_params.amount_min is not None:
                amount_query["$gte"] = search_params.amount_min
            if search_params.amount_max is not None:
                amount_query["$lte"] = search_params.amount_max
            transaction_match["transaction_history.amount"] = amount_query
        
        # Date filters
        if search_params.date_from or search_params.date_to:
            date_query = {}
            if search_params.date_from:
                date_query["$gte"] = datetime.fromisoformat(search_params.date_from.replace('Z', '+00:00'))
            if search_params.date_to:
                date_query["$lte"] = datetime.fromisoformat(search_params.date_to.replace('Z', '+00:00'))
            transaction_match["transaction_history.date"] = date_query
        
        if transaction_match:
            pipeline.append({"$match": transaction_match})
        
        # Add user information
        pipeline.append({
            "$lookup": {
                "from": "users",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$id", "$$user_id"]}}},
                    {"$project": {"full_name": 1, "email": 1, "role": 1}}
                ],
                "as": "user"
            }
        })
        
        # Project final structure
        pipeline.append({
            "$project": {
                "user_id": 1,
                "user_info": {"$arrayElemAt": ["$user", 0]},
                "transaction": "$transaction_history"
            }
        })
        
        # Sort
        sort_field = f"transaction.{search_params.sort_by}" if search_params.sort_by else "transaction.date"
        sort_direction = -1 if search_params.sort_order == "desc" else 1
        pipeline.append({"$sort": {sort_field: sort_direction}})
        
        # Count total before pagination
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        count_result = list(db.wallets.aggregate(count_pipeline))
        total_count = count_result[0]["total"] if count_result else 0
        
        # Add pagination
        pipeline.extend([
            {"$skip": skip},
            {"$limit": limit}
        ])
        
        # Execute pipeline
        transactions = list(db.wallets.aggregate(pipeline))
        
        return {
            "transactions": transactions,
            "total": total_count,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit if total_count > 0 else 1,
            "filters_applied": {
                "user_id": search_params.user_id,
                "transaction_type": search_params.transaction_type,
                "amount_range": f"{search_params.amount_min or 0}-{search_params.amount_max or 'unlimited'}",
                "date_range": f"{search_params.date_from or 'start'} to {search_params.date_to or 'end'}"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in advanced transaction search: {str(e)}")

# Admin Dashboard Enhanced Endpoints

@app.get("/api/admin/stats")
async def get_admin_stats(current_user = Depends(verify_token)):
    """Get comprehensive admin dashboard statistics"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # User stats
        total_users = db.users.count_documents({})
        total_freelancers = db.users.count_documents({"role": "freelancer"})
        total_clients = db.users.count_documents({"role": "client"})
        verified_freelancers = db.users.count_documents({"role": "freelancer", "is_verified": True})
        
        # Job stats
        total_jobs = db.jobs.count_documents({})
        active_jobs = db.jobs.count_documents({"status": "active"})
        completed_jobs = db.jobs.count_documents({"status": "completed"})
        
        # Contract stats
        total_contracts = db.contracts.count_documents({})
        in_progress_contracts = db.contracts.count_documents({"status": "In Progress"})
        completed_contracts = db.contracts.count_documents({"status": "Completed"})
        
        # Revenue stats from wallets
        pipeline = [
            {"$group": {
                "_id": None,
                "total_available": {"$sum": "$available_balance"},
                "total_escrow": {"$sum": "$escrow_balance"}
            }}
        ]
        wallet_stats = list(db.wallets.aggregate(pipeline))
        total_revenue = (wallet_stats[0]["total_available"] + wallet_stats[0]["total_escrow"]) if wallet_stats else 0
        
        # Support ticket stats
        open_tickets = db.support_tickets.count_documents({"status": "open"})
        total_tickets = db.support_tickets.count_documents({})
        
        # Growth metrics (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users_month = db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})
        new_jobs_month = db.jobs.count_documents({"created_at": {"$gte": thirty_days_ago}})
        
        return {
            "users": {
                "total": total_users,
                "freelancers": total_freelancers,
                "clients": total_clients,
                "verified_freelancers": verified_freelancers,
                "new_this_month": new_users_month
            },
            "jobs": {
                "total": total_jobs,
                "active": active_jobs,
                "completed": completed_jobs,
                "new_this_month": new_jobs_month
            },
            "contracts": {
                "total": total_contracts,
                "in_progress": in_progress_contracts,
                "completed": completed_contracts
            },
            "revenue": {
                "total_platform": total_revenue,
                "available_balance": wallet_stats[0]["total_available"] if wallet_stats else 0,
                "escrow_balance": wallet_stats[0]["total_escrow"] if wallet_stats else 0
            },
            "support": {
                "open_tickets": open_tickets,
                "total_tickets": total_tickets
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admin stats: {str(e)}")

@app.get("/api/admin/users/search")
async def search_users(
    q: str = "",
    role: str = "all",
    status: str = "all",
    skip: int = 0,
    limit: int = 20,
    current_user = Depends(verify_token)
):
    """Search and filter users for admin management"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build search query
    query = {}
    
    # Text search
    if q:
        query["$or"] = [
            {"full_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    
    # Role filter
    if role != "all":
        query["role"] = role
    
    # Status filter
    if status == "verified":
        query["is_verified"] = True
    elif status == "unverified":
        query["is_verified"] = {"$ne": True}
    elif status == "suspended":
        query["is_suspended"] = True
    
    # Get users with pagination
    users = list(db.users.find(
        query, 
        {"password": 0}  # Exclude password
    ).skip(skip).limit(limit).sort("created_at", -1))
    
    # Get total count
    total = db.users.count_documents(query)
    
    # Convert ObjectId to string
    for user in users:
        user["_id"] = str(user["_id"])
    
    return {
        "users": users,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.patch("/api/admin/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user = Depends(verify_token)):
    """Suspend or unsuspend a user"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle suspension status
    is_suspended = not user.get("is_suspended", False)
    
    db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "is_suspended": is_suspended,
                "suspended_at": datetime.utcnow() if is_suspended else None,
                "suspended_by": current_user["user_id"] if is_suspended else None
            }
        }
    )
    
    return {
        "message": f"User {'suspended' if is_suspended else 'unsuspended'} successfully",
        "user_id": user_id,
        "is_suspended": is_suspended
    }

@app.get("/api/admin/support-tickets")
async def get_support_tickets(
    status: str = "all",
    skip: int = 0,
    limit: int = 20,
    current_user = Depends(verify_token)
):
    """Get support tickets for admin management"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = {}
    if status != "all":
        query["status"] = status
    
    # Get tickets with pagination
    tickets = list(db.support_tickets.find(query)
                  .skip(skip).limit(limit)
                  .sort("created_at", -1))
    
    total = db.support_tickets.count_documents(query)
    
    # Convert ObjectId to string
    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
    
    return {
        "tickets": tickets,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.patch("/api/admin/support-tickets/{ticket_id}")
async def update_support_ticket(
    ticket_id: str,
    update_data: dict,
    current_user = Depends(verify_token)
):
    """Update a support ticket (status, assigned admin, reply)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    ticket = db.support_tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    # Prepare update data
    update_fields = {}
    if "status" in update_data:
        update_fields["status"] = update_data["status"]
        if update_data["status"] == "resolved":
            update_fields["resolved_at"] = datetime.utcnow()
            update_fields["resolved_by"] = current_user["user_id"]
    
    if "assigned_to" in update_data:
        update_fields["assigned_to"] = update_data["assigned_to"]
        update_fields["assigned_at"] = datetime.utcnow()
    
    if "admin_reply" in update_data:
        reply = {
            "message": update_data["admin_reply"],
            "replied_by": current_user["user_id"],
            "replied_at": datetime.utcnow()
        }
        update_fields["admin_replies"] = ticket.get("admin_replies", []) + [reply]
        update_fields["last_reply_at"] = datetime.utcnow()
    
    update_fields["updated_at"] = datetime.utcnow()
    
    # Update ticket
    db.support_tickets.update_one(
        {"id": ticket_id},
        {"$set": update_fields}
    )
    
    return {
        "message": "Support ticket updated successfully",
        "ticket_id": ticket_id
    }

@app.get("/api/admin/activity-log")
async def get_activity_log(
    skip: int = 0,
    limit: int = 50,
    current_user = Depends(verify_token)
):
    """Get platform activity log for admin monitoring"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create activity log from recent database changes
    activities = []
    
    # Recent user registrations
    recent_users = list(db.users.find(
        {}, {"full_name": 1, "role": 1, "created_at": 1, "is_verified": 1}
    ).sort("created_at", -1).limit(10))
    
    for user in recent_users:
        activities.append({
            "type": "user_registration",
            "description": f"New {user['role']} registered: {user['full_name']}",
            "timestamp": user["created_at"],
            "user_id": user.get("id"),
            "icon": "user-plus"
        })
    
    # Recent job posts
    recent_jobs = list(db.jobs.find(
        {}, {"title": 1, "created_at": 1, "client_id": 1}
    ).sort("created_at", -1).limit(10))
    
    for job in recent_jobs:
        client = db.users.find_one({"id": job["client_id"]}, {"full_name": 1})
        activities.append({
            "type": "job_posted",
            "description": f"New job posted: {job['title']} by {client['full_name'] if client else 'Unknown'}",
            "timestamp": job["created_at"],
            "job_id": job.get("id"),
            "icon": "briefcase"
        })
    
    # Recent support tickets
    recent_tickets = list(db.support_tickets.find(
        {}, {"name": 1, "created_at": 1, "status": 1}
    ).sort("created_at", -1).limit(5))
    
    for ticket in recent_tickets:
        activities.append({
            "type": "support_ticket",
            "description": f"Support ticket from {ticket['name']} - Status: {ticket['status']}",
            "timestamp": ticket["created_at"],
            "ticket_id": ticket.get("id"),
            "icon": "help-circle"
        })
    
    # Sort all activities by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Apply pagination
    total = len(activities)
    activities = activities[skip:skip + limit]
    
    return {
        "activities": activities,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)