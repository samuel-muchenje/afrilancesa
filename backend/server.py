from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

app = FastAPI()

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
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT)
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

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
    
    # Create user
    user_data = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "full_name": user.full_name,
        "profile_completed": False,
        "created_at": datetime.utcnow(),
        "profile": {}
    }
    
    db.users.insert_one(user_data)
    token = create_token(user_data["id"], user_data["role"])
    
    return {
        "token": token,
        "user": {
            "id": user_data["id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "full_name": user_data["full_name"],
            "profile_completed": user_data["profile_completed"]
        }
    }

@app.post("/api/login")
async def login_user(user: UserLogin):
    db_user = db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(db_user["id"], db_user["role"])
    
    return {
        "token": token,
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "role": db_user["role"],
            "full_name": db_user["full_name"],
            "profile_completed": db_user.get("profile_completed", False)
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
        "profile": user.get("profile", {}),
        "profile_completed": user.get("profile_completed", False)
    }

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
    
    # Send email
    subject = f"New Support Request from {ticket.name}"
    body = f"""
    <h2>New Support Request</h2>
    <p><strong>From:</strong> {ticket.name}</p>
    <p><strong>Email:</strong> {ticket.email}</p>
    <p><strong>Message:</strong></p>
    <p>{ticket.message}</p>
    <p><strong>Submitted:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
    """
    
    email_sent = send_email("sam@afrilance.co.za", subject, body)
    
    return {
        "message": "Support ticket submitted successfully",
        "ticket_id": ticket_data["id"],
        "email_sent": email_sent
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)