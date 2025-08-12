#!/usr/bin/env python3
"""
Script to update admin accounts for Afrilance platform
"""

import os
import sys
from pymongo import MongoClient
import bcrypt
from datetime import datetime

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

def update_admin_account(email, password, full_name, department="Administration"):
    """Update an existing admin account to be approved"""
    
    # Find existing user
    existing_user = db.users.find_one({"email": email.lower()})
    if not existing_user:
        print(f"❌ Admin account {email} does not exist")
        return False
    
    print(f"📋 Current status of {email}:")
    print(f"   - Role: {existing_user.get('role', 'N/A')}")
    print(f"   - Admin approved: {existing_user.get('admin_approved', False)}")
    print(f"   - Verification status: {existing_user.get('verification_status', 'N/A')}")
    
    # Hash new password
    hashed_password = hash_password(password)
    
    # Update admin user data
    update_data = {
        "password": hashed_password,
        "full_name": full_name,
        "role": "admin",
        "department": department,
        "admin_approved": True,  # Approve the admin
        "admin_approval_date": datetime.utcnow(),
        "approved_by": "system",
        "admin_approval_notes": "Updated admin account - approved by system",
        "verification_status": "approved",
        "is_verified": True
    }
    
    # Update in database
    try:
        result = db.users.update_one(
            {"email": email.lower()},
            {"$set": update_data}
        )
        if result.modified_count > 0:
            print(f"✅ Updated admin account: {email}")
            return True
        else:
            print(f"⚠️ No changes made to admin account: {email}")
            return True
    except Exception as e:
        print(f"❌ Failed to update admin account {email}: {str(e)}")
        return False

def main():
    """Update the three admin accounts"""
    print("🔧 Updating Afrilance Admin Accounts...")
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
        print(f"\n🔧 Processing {admin['email']}...")
        if update_admin_account(
            admin["email"], 
            admin["password"], 
            admin["full_name"], 
            admin["department"]
        ):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Successfully updated {success_count}/3 admin accounts")
    
    # Verify accounts can login
    print("\n🔍 Final verification of admin accounts...")
    for admin in admin_accounts:
        user = db.users.find_one({"email": admin["email"].lower()})
        if user and user.get("admin_approved") and user.get("role") == "admin":
            print(f"✅ {admin['email']}: Ready for login (Admin approved: {user.get('admin_approved')})")
        else:
            print(f"❌ {admin['email']}: Account not properly configured")
            if user:
                print(f"   - Role: {user.get('role')}")
                print(f"   - Admin approved: {user.get('admin_approved')}")
                print(f"   - Verification status: {user.get('verification_status')}")
    
    print("\n🎉 Admin account update completed!")
    print("All admins can now login and approve user requests")

if __name__ == "__main__":
    main()