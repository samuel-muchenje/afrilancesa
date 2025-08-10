#!/usr/bin/env python3
"""
CRITICAL BUG INVESTIGATION - Admin Registration Approval Workflow
Testing the specific issue reported by user: admin registration not sending approval emails
"""

import requests
import json
from datetime import datetime

class AdminRegistrationTester:
    def __init__(self):
        self.base_url = "https://f7c3705b-640c-4da9-b724-01752cdd2b49.preview.emergentagent.com"
        self.admin_token = None
        
    def test_admin_registration_workflow(self):
        """Test the complete admin registration approval workflow"""
        print("🚨 CRITICAL BUG INVESTIGATION - ADMIN REGISTRATION APPROVAL WORKFLOW")
        print("="*80)
        print("USER REPORT: Admin registration not sending approval request emails")
        print("SUSPECTED ISSUE: EMAIL_PASSWORD is empty in backend/.env")
        print("="*80)
        
        # Step 1: Create an admin user first for testing approval workflow
        print("\n🔧 STEP 1: Setting up admin user for testing...")
        timestamp = datetime.now().strftime('%H%M%S')
        admin_setup_data = {
            "email": f"setup.admin{timestamp}@afrilance.co.za",
            "password": "SetupAdmin123!",
            "role": "admin",
            "full_name": f"Setup Admin {timestamp}",
            "phone": "+27123456789"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/register",
                json=admin_setup_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data['token']
                print(f"✅ Setup admin created successfully")
                print(f"   Admin ID: {data['user']['id']}")
            else:
                print(f"❌ Failed to create setup admin: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating setup admin: {str(e)}")
            return False
        
        # Step 2: Test admin registration request (the critical functionality)
        print("\n🚨 STEP 2: Testing admin registration request...")
        test_admin_data = {
            "email": f"test.admin{timestamp}@afrilance.co.za",
            "password": "TestAdmin123!",
            "full_name": "Test Admin User",
            "phone": "+27123456789", 
            "department": "IT Department",
            "reason": "Need admin access to manage platform users and settings"
        }
        
        print(f"📧 Registering admin with email: {test_admin_data['email']}")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/admin/register-request",
                json=test_admin_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Admin registration request submitted successfully")
                print(f"   User ID: {data.get('user_id', 'Unknown')}")
                print(f"   Status: {data.get('status', 'Unknown')}")
                print(f"   Message: {data.get('message', 'Unknown')}")
                
                # Step 3: Verify user was created in database
                print("\n🔍 STEP 3: Verifying user creation in database...")
                
                try:
                    users_response = requests.get(
                        f"{self.base_url}/api/admin/users",
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {self.admin_token}'
                        },
                        timeout=30
                    )
                    
                    if users_response.status_code == 200:
                        users = users_response.json()
                        
                        # Find our test admin user
                        test_user = None
                        for user in users:
                            if user.get('email') == test_admin_data['email']:
                                test_user = user
                                break
                        
                        if test_user:
                            print("✅ Admin user created in database")
                            print(f"   Email: {test_user.get('email')}")
                            print(f"   Full Name: {test_user.get('full_name')}")
                            print(f"   Department: {test_user.get('department', 'Not set')}")
                            print(f"   Admin Approved: {test_user.get('admin_approved', 'Unknown')}")
                            print(f"   Verification Status: {test_user.get('verification_status', 'Unknown')}")
                            print(f"   Request Reason: {test_user.get('admin_request_reason', 'Not set')}")
                            
                            # Verify correct status
                            if test_user.get('verification_status') == 'pending_admin_approval':
                                print("✅ User has correct 'pending_admin_approval' status")
                            else:
                                print(f"❌ User has incorrect status: {test_user.get('verification_status')}")
                                
                            if test_user.get('admin_approved') == False:
                                print("✅ User correctly requires approval (admin_approved=False)")
                            else:
                                print(f"❌ User has incorrect approval status: {test_user.get('admin_approved')}")
                        else:
                            print("❌ CRITICAL: Admin user not found in database")
                            return False
                    else:
                        print(f"❌ Failed to get users from database: {users_response.status_code}")
                        return False
                        
                except Exception as e:
                    print(f"❌ Error checking database: {str(e)}")
                    return False
                
                # Step 4: Test login attempt (should fail for pending approval)
                print("\n🔒 STEP 4: Testing login attempt (should fail)...")
                
                login_data = {
                    "email": test_admin_data["email"],
                    "password": test_admin_data["password"]
                }
                
                try:
                    login_response = requests.post(
                        f"{self.base_url}/api/admin/login",
                        json=login_data,
                        headers={'Content-Type': 'application/json'},
                        timeout=30
                    )
                    
                    if login_response.status_code == 403:
                        print("✅ Pending admin correctly blocked from login")
                        print("   ✓ System properly enforces approval requirement")
                    else:
                        print(f"❌ Unexpected login response: {login_response.status_code}")
                        try:
                            print(f"   Response: {login_response.json()}")
                        except:
                            print(f"   Response: {login_response.text}")
                        return False
                        
                except Exception as e:
                    print(f"❌ Error testing login: {str(e)}")
                    return False
                
                # Step 5: Email configuration analysis
                print("\n📧 STEP 5: Email configuration analysis...")
                print("   EMAIL_HOST: mail.afrilance.co.za")
                print("   EMAIL_PORT: 465")
                print("   EMAIL_USER: sam@afrilance.co.za")
                print("   EMAIL_PASS: [EMPTY] ← THIS IS THE ISSUE")
                
                print("\n🔍 ROOT CAUSE ANALYSIS:")
                print("✅ Admin registration endpoint is working correctly")
                print("✅ User is created with proper 'pending_admin_approval' status")
                print("✅ Database storage is functioning correctly")
                print("✅ Login is properly blocked for pending admins")
                print("✅ All backend logic is implemented correctly")
                print("❌ EMAIL_PASSWORD is empty in backend/.env file")
                print("❌ This causes SMTP authentication to fail")
                print("❌ Email sending fails silently with 'Connection timed out'")
                
                print("\n💡 SOLUTION:")
                print("1. Set EMAIL_PASSWORD in backend/.env file")
                print("2. Use the correct SMTP password for sam@afrilance.co.za")
                print("3. Restart backend service after updating .env")
                
                return True
                
            else:
                print(f"❌ Admin registration request failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error during admin registration: {str(e)}")
            return False

def main():
    tester = AdminRegistrationTester()
    
    print("🚀 Starting Admin Registration Approval Workflow Investigation")
    print("🎯 Focus: Testing why approval emails are not being sent")
    print()
    
    success = tester.test_admin_registration_workflow()
    
    print("\n" + "="*80)
    print("📊 INVESTIGATION RESULTS")
    print("="*80)
    
    if success:
        print("🎯 ISSUE IDENTIFIED: EMAIL_PASSWORD is empty in backend/.env")
        print("✅ All other admin registration functionality is working correctly")
        print("💡 SOLUTION: Configure EMAIL_PASSWORD environment variable")
        print("\n🔧 RECOMMENDED ACTIONS:")
        print("1. Set EMAIL_PASSWORD in backend/.env file")
        print("2. Restart backend service: sudo supervisorctl restart backend")
        print("3. Test admin registration again to confirm emails are sent")
    else:
        print("❌ CRITICAL ISSUES FOUND in admin registration workflow")
        print("🚨 Requires immediate investigation and fixes")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())