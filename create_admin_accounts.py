#!/usr/bin/env python3
"""
Script to create approved admin accounts for Afrilance platform
"""

import os
import sys
from pymongo import MongoClient
import bcrypt
from datetime import datetime
import uuid

# Load environment variables from .env file
sys.path.append('/app/backend')
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(mongo_url)
db = client.afrilance

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_admin_account(email, password, full_name, department="Administration"):
    """Create an approved admin account"""
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": email.lower()})
    if existing_user:
        print(f"❌ Admin account {email} already exists")
        return False
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Create admin user data
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": email.lower(),
        "password": hashed_password,
        "full_name": full_name,
        "phone": "+27-10-000-0000",  # Default phone
        "role": "admin",
        "department": department,
        "admin_approved": True,  # Pre-approved
        "admin_request_reason": "System Administrator - Pre-approved by management",
        "admin_request_date": datetime.utcnow(),
        "admin_approval_date": datetime.utcnow(),
        "approved_by": "system",
        "admin_approval_notes": "Pre-approved admin account created by system",
        "created_at": datetime.utcnow(),
        "verification_status": "approved",
        "is_verified": True,
        "last_login": None
    }
    
    # Insert into database
    try:
        db.users.insert_one(user_data)
        print(f"✅ Created admin account: {email}")
        return True
    except Exception as e:
        print(f"❌ Failed to create admin account {email}: {str(e)}")
        return False

def main():
    """Create the three admin accounts"""
    print("🔧 Creating Afrilance Admin Accounts...")
    print("=" * 50)
    
    # Admin account data
    admin_accounts = [
        {
            "email": "sam@afrilance.co.za",
            "password": "Sierra#2030",
            "full_name": "Sam Administrator",
            "department": "System Administration"
        },
        {
            "email": "info@afrilance.co.za",
            "password": "Sierra#2025",
            "full_name": "Info Administrator", 
            "department": "Customer Support"
        },
        {
            "email": "nicovia@afrilance.co.za",
            "password": "Sierra#2025",
            "full_name": "Nicovia Administrator",
            "department": "Business Operations"
        }
    ]
    
    success_count = 0
    for admin in admin_accounts:
        if create_admin_account(
            admin["email"], 
            admin["password"], 
            admin["full_name"], 
            admin["department"]
        ):
            success_count += 1
    
    print("=" * 50)
    print(f"✅ Successfully created {success_count}/3 admin accounts")
    
    # Verify accounts can login
    print("\n🔍 Verifying admin accounts...")
    for admin in admin_accounts:
        user = db.users.find_one({"email": admin["email"].lower()})
        if user and user.get("admin_approved") and user.get("role") == "admin":
            print(f"✅ {admin['email']}: Ready for login")
        else:
            print(f"❌ {admin['email']}: Account not properly configured")
    
    print("\n🎉 Admin account creation completed!")
    print("All admins can now login and approve user requests")

if __name__ == "__main__":
    main()