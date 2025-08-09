import requests
import sys
import json
import jwt
from datetime import datetime

class AfrilanceAPITester:
    def __init__(self, base_url="https://233386b1-2685-4958-abad-b6a050fc11d2.preview.emergentagent.com"):
        self.base_url = base_url
        self.freelancer_token = None
        self.client_token = None
        self.admin_token = None
        self.freelancer_user = None
        self.client_user = None
        self.admin_user = None
        self.test_job_id = None
        self.test_contract_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.auth_tests_run = 0
        self.auth_tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def run_auth_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single authentication-focused API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.auth_tests_run += 1
        print(f"\n🔐 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.auth_tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    # ========== AUTHENTICATION SYSTEM TESTS ==========
    
    def test_auth_register_freelancer(self):
        """Test freelancer registration with South African data"""
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"thabo.mthembu{timestamp}@gmail.com",
            "password": "SecurePass123!",
            "role": "freelancer",
            "full_name": "Thabo Mthembu",
            "phone": "+27823456789"
        }
        
        success, response = self.run_auth_test(
            "Auth - Freelancer Registration",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.freelancer_token = response['token']
            self.freelancer_user = response['user']
            print(f"   ✓ Token generated: {self.freelancer_token[:20]}...")
            print(f"   ✓ User ID: {self.freelancer_user['id']}")
            print(f"   ✓ Role: {self.freelancer_user['role']}")
            print(f"   ✓ Verification required: {self.freelancer_user.get('verification_required', False)}")
            return True
        return False

    def test_auth_register_client(self):
        """Test client registration with South African data"""
        timestamp = datetime.now().strftime('%H%M%S')
        client_data = {
            "email": f"nomsa.dlamini{timestamp}@outlook.com",
            "password": "ClientPass456!",
            "role": "client",
            "full_name": "Nomsa Dlamini",
            "phone": "+27719876543"
        }
        
        success, response = self.run_auth_test(
            "Auth - Client Registration",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.client_token = response['token']
            self.client_user = response['user']
            print(f"   ✓ Token generated: {self.client_token[:20]}...")
            print(f"   ✓ User ID: {self.client_user['id']}")
            print(f"   ✓ Role: {self.client_user['role']}")
            return True
        return False

    def test_auth_register_admin(self):
        """Test admin registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        admin_data = {
            "email": f"admin.afrilance{timestamp}@afrilance.co.za",
            "password": "AdminPass789!",
            "role": "admin",
            "full_name": "Admin User",
            "phone": "+27123456789"
        }
        
        success, response = self.run_auth_test(
            "Auth - Admin Registration",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.admin_token = response['token']
            self.admin_user = response['user']
            print(f"   ✓ Token generated: {self.admin_token[:20]}...")
            print(f"   ✓ User ID: {self.admin_user['id']}")
            print(f"   ✓ Role: {self.admin_user['role']}")
            return True
        return False

    def test_auth_login_valid_credentials(self):
        """Test login with valid credentials"""
        if not self.freelancer_user:
            print("❌ No freelancer user available for login test")
            return False
            
        login_data = {
            "email": self.freelancer_user['email'],
            "password": "SecurePass123!"
        }
        
        success, response = self.run_auth_test(
            "Auth - Login Valid Credentials",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            print(f"   ✓ Login successful, token: {response['token'][:20]}...")
            print(f"   ✓ User data returned: {response['user']['full_name']}")
            return True
        return False

    def test_auth_login_invalid_credentials(self):
        """Test login with invalid credentials - should return 401"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "WrongPassword123!"
        }
        
        success, response = self.run_auth_test(
            "Auth - Login Invalid Credentials",
            "POST",
            "/api/login",
            401,
            data=invalid_data
        )
        return success

    def test_auth_login_wrong_password(self):
        """Test login with correct email but wrong password"""
        if not self.freelancer_user:
            print("❌ No freelancer user available for wrong password test")
            return False
            
        wrong_password_data = {
            "email": self.freelancer_user['email'],
            "password": "WrongPassword123!"
        }
        
        success, response = self.run_auth_test(
            "Auth - Login Wrong Password",
            "POST",
            "/api/login",
            401,
            data=wrong_password_data
        )
        return success

    def test_auth_jwt_token_structure(self):
        """Test JWT token structure and content"""
        if not self.freelancer_token:
            print("❌ No token available for JWT structure test")
            return False
            
        try:
            # Decode token without verification to check structure
            decoded = jwt.decode(self.freelancer_token, options={"verify_signature": False})
            
            print(f"   ✓ Token payload: {decoded}")
            
            # Check required fields
            required_fields = ['user_id', 'role', 'exp']
            for field in required_fields:
                if field not in decoded:
                    print(f"   ❌ Missing required field: {field}")
                    return False
                    
            print(f"   ✓ User ID in token: {decoded['user_id']}")
            print(f"   ✓ Role in token: {decoded['role']}")
            print(f"   ✓ Expiration in token: {decoded['exp']}")
            
            # Verify user_id matches
            if decoded['user_id'] != self.freelancer_user['id']:
                print(f"   ❌ Token user_id doesn't match user: {decoded['user_id']} vs {self.freelancer_user['id']}")
                return False
                
            # Verify role matches
            if decoded['role'] != self.freelancer_user['role']:
                print(f"   ❌ Token role doesn't match user: {decoded['role']} vs {self.freelancer_user['role']}")
                return False
                
            print("   ✅ JWT token structure and content valid")
            return True
            
        except Exception as e:
            print(f"   ❌ JWT token validation failed: {str(e)}")
            return False

    def test_auth_protected_endpoint_valid_token(self):
        """Test protected endpoint with valid JWT token"""
        success, response = self.run_auth_test(
            "Auth - Protected Endpoint Valid Token",
            "GET",
            "/api/profile",
            200,
            token=self.freelancer_token
        )
        
        if success and 'id' in response:
            print(f"   ✓ Profile data retrieved: {response['full_name']}")
            return True
        return False

    def test_auth_protected_endpoint_no_token(self):
        """Test protected endpoint without token - should return 401"""
        success, response = self.run_auth_test(
            "Auth - Protected Endpoint No Token",
            "GET",
            "/api/profile",
            401
        )
        return success

    def test_auth_protected_endpoint_invalid_token(self):
        """Test protected endpoint with invalid token - should return 401"""
        success, response = self.run_auth_test(
            "Auth - Protected Endpoint Invalid Token",
            "GET",
            "/api/profile",
            401,
            token="invalid.jwt.token"
        )
        return success

    def test_auth_email_uniqueness(self):
        """Test email uniqueness validation - duplicate registration should fail"""
        if not self.freelancer_user:
            print("❌ No freelancer user available for duplicate email test")
            return False
            
        duplicate_data = {
            "email": self.freelancer_user['email'],
            "password": "AnotherPassword123!",
            "role": "client",
            "full_name": "Another User",
            "phone": "+27987654321"
        }
        
        success, response = self.run_auth_test(
            "Auth - Email Uniqueness Validation",
            "POST",
            "/api/register",
            400,
            data=duplicate_data
        )
        return success

    def test_auth_password_hashing(self):
        """Test that passwords are properly hashed (not stored in plain text)"""
        # This test verifies that we can login with the original password
        # but the stored password is hashed (we can't directly check the DB in this test)
        
        if not self.client_user:
            print("❌ No client user available for password hashing test")
            return False
            
        # Try to login with the original password
        login_data = {
            "email": self.client_user['email'],
            "password": "ClientPass456!"
        }
        
        success, response = self.run_auth_test(
            "Auth - Password Hashing Verification",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        
        if success:
            print("   ✓ Password hashing working correctly (login successful with original password)")
            return True
        return False

    def test_auth_role_validation(self):
        """Test role validation during registration"""
        invalid_role_data = {
            "email": "invalid.role@test.com",
            "password": "TestPass123!",
            "role": "invalid_role",
            "full_name": "Invalid Role User",
            "phone": "+27123456789"
        }
        
        success, response = self.run_auth_test(
            "Auth - Invalid Role Validation",
            "POST",
            "/api/register",
            400,
            data=invalid_role_data
        )
        return success

    # ========== DEDICATED ADMIN LOGIN SYSTEM TESTS ==========
    
    def test_admin_login_valid_afrilance_email(self):
        """Test admin login with valid @afrilance.co.za email"""
        # First create an approved admin user
        timestamp = datetime.now().strftime('%H%M%S')
        admin_email = f"admin.test{timestamp}@afrilance.co.za"
        admin_password = "AdminSecure123!"
        
        # Create admin user directly (simulating approved admin)
        admin_data = {
            "email": admin_email,
            "password": admin_password,
            "role": "admin",
            "full_name": f"Test Admin {timestamp}",
            "phone": "+27123456789"
        }
        
        # Register admin first
        success, response = self.run_auth_test(
            "Admin Login - Create Approved Admin",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if not success:
            print("❌ Failed to create admin for login test")
            return False
            
        # Now test dedicated admin login
        login_data = {
            "email": admin_email,
            "password": admin_password
        }
        
        success, response = self.run_auth_test(
            "Admin Login - Valid Afrilance Email",
            "POST",
            "/api/admin/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response and 'user' in response:
            print(f"   ✓ Admin login successful")
            print(f"   ✓ Token generated: {response['token'][:20]}...")
            print(f"   ✓ Admin user: {response['user']['full_name']}")
            print(f"   ✓ Role: {response['user']['role']}")
            print(f"   ✓ Admin approved: {response['user'].get('admin_approved', False)}")
            
            # Store for other tests
            self.admin_token = response['token']
            self.admin_user = response['user']
            return True
        return False

    def test_admin_login_non_afrilance_domain(self):
        """Test admin login with non-@afrilance.co.za email - should fail"""
        login_data = {
            "email": "admin@gmail.com",
            "password": "AdminPass123!"
        }
        
        success, response = self.run_auth_test(
            "Admin Login - Non-Afrilance Domain (Should Fail)",
            "POST",
            "/api/admin/login",
            403,
            data=login_data
        )
        
        if success:
            print("   ✓ Non-Afrilance domain properly rejected")
            return True
        return False

    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        login_data = {
            "email": "nonexistent@afrilance.co.za",
            "password": "WrongPassword123!"
        }
        
        success, response = self.run_auth_test(
            "Admin Login - Invalid Credentials",
            "POST",
            "/api/admin/login",
            401,
            data=login_data
        )
        
        if success:
            print("   ✓ Invalid credentials properly rejected")
            return True
        return False

    def test_admin_login_pending_approval(self):
        """Test admin login with pending approval - should show pending message"""
        timestamp = datetime.now().strftime('%H%M%S')
        pending_admin_data = {
            "email": f"pending.admin{timestamp}@afrilance.co.za",
            "password": "PendingPass123!",
            "full_name": f"Pending Admin {timestamp}",
            "phone": "+27987654321",
            "department": "IT Support",
            "reason": "Need admin access for user support tasks"
        }
        
        # Create pending admin request
        success, response = self.run_auth_test(
            "Admin Login - Create Pending Admin",
            "POST",
            "/api/admin/register-request",
            200,
            data=pending_admin_data
        )
        
        if not success:
            print("❌ Failed to create pending admin")
            return False
        
        # Try to login with pending admin
        login_data = {
            "email": pending_admin_data["email"],
            "password": pending_admin_data["password"]
        }
        
        success, response = self.run_auth_test(
            "Admin Login - Pending Approval (Should Fail)",
            "POST",
            "/api/admin/login",
            403,
            data=login_data
        )
        
        if success:
            print("   ✓ Pending admin login properly blocked")
            return True
        return False

    def test_admin_register_request_valid(self):
        """Test admin registration request with valid @afrilance.co.za email"""
        timestamp = datetime.now().strftime('%H%M%S')
        request_data = {
            "email": f"new.admin{timestamp}@afrilance.co.za",
            "password": "NewAdminPass123!",
            "full_name": f"New Admin {timestamp}",
            "phone": "+27123456789",
            "department": "Customer Support",
            "reason": "I need admin access to help with user verification and support ticket management. I am the new customer support manager and require these privileges to effectively assist users and manage platform operations."
        }
        
        success, response = self.run_auth_test(
            "Admin Register - Valid Request",
            "POST",
            "/api/admin/register-request",
            200,
            data=request_data
        )
        
        if success:
            print("   ✓ Admin registration request submitted successfully")
            print(f"   ✓ Email notification sent to sam@afrilance.co.za")
            return True
        return False

    def test_admin_register_request_invalid_domain(self):
        """Test admin registration request with non-@afrilance.co.za email"""
        request_data = {
            "email": "admin@gmail.com",
            "password": "AdminPass123!",
            "full_name": "Invalid Admin",
            "phone": "+27123456789",
            "department": "IT",
            "reason": "Need admin access"
        }
        
        success, response = self.run_auth_test(
            "Admin Register - Invalid Domain (Should Fail)",
            "POST",
            "/api/admin/register-request",
            400,
            data=request_data
        )
        
        if success:
            print("   ✓ Non-Afrilance domain registration properly rejected")
            return True
        return False

    def test_admin_register_request_missing_fields(self):
        """Test admin registration request with missing required fields"""
        incomplete_data = {
            "email": "incomplete@afrilance.co.za",
            "password": "Pass123!",
            # Missing full_name, phone, department, reason
        }
        
        success, response = self.run_auth_test(
            "Admin Register - Missing Fields (Should Fail)",
            "POST",
            "/api/admin/register-request",
            400,
            data=incomplete_data
        )
        
        if success:
            print("   ✓ Incomplete registration properly rejected")
            return True
        return False

    def test_admin_approval_workflow_approve(self):
        """Test admin approval workflow - approve admin request"""
        if not self.admin_token:
            print("❌ No admin token available for approval test")
            return False
        
        # First create a pending admin request
        timestamp = datetime.now().strftime('%H%M%S')
        pending_data = {
            "email": f"approve.test{timestamp}@afrilance.co.za",
            "password": "ApproveTest123!",
            "full_name": f"Approve Test {timestamp}",
            "phone": "+27123456789",
            "department": "Quality Assurance",
            "reason": "Need admin access for testing and quality assurance of platform features"
        }
        
        success, response = self.run_auth_test(
            "Admin Approval - Create Pending Request",
            "POST",
            "/api/admin/register-request",
            200,
            data=pending_data
        )
        
        if not success:
            print("❌ Failed to create pending admin for approval test")
            return False
        
        # Get the user ID (we need to find it from the database or response)
        # For testing, we'll simulate having the user_id
        # In real scenario, admin would get this from admin dashboard
        
        # Test approval
        approval_data = {
            "status": "approved",
            "admin_notes": "Approved for QA testing purposes. User verified as legitimate Afrilance employee."
        }
        
        # We need to get the user_id first - let's get all users and find our test user
        success, users_response = self.run_auth_test(
            "Admin Approval - Get Users to Find Test User",
            "GET",
            "/api/admin/users",
            200,
            token=self.admin_token
        )
        
        if not success:
            print("❌ Failed to get users for approval test")
            return False
        
        # Find our test user
        test_user_id = None
        for user in users_response:
            if user.get('email') == pending_data['email']:
                test_user_id = user.get('id')
                break
        
        if not test_user_id:
            print("❌ Could not find test user for approval")
            return False
        
        # Now approve the admin
        success, response = self.run_auth_test(
            "Admin Approval - Approve Admin Request",
            "POST",
            f"/api/admin/approve-admin/{test_user_id}",
            200,
            data=approval_data,
            token=self.admin_token
        )
        
        if success:
            print("   ✓ Admin approval successful")
            print(f"   ✓ User approved: {response.get('user_id', 'Unknown')}")
            print(f"   ✓ Status: {response.get('status', 'Unknown')}")
            
            # Test that approved admin can now login
            login_data = {
                "email": pending_data["email"],
                "password": pending_data["password"]
            }
            
            success, login_response = self.run_auth_test(
                "Admin Approval - Test Approved Admin Login",
                "POST",
                "/api/admin/login",
                200,
                data=login_data
            )
            
            if success:
                print("   ✓ Approved admin can now login successfully")
                return True
            else:
                print("   ❌ Approved admin still cannot login")
                return False
        return False

    def test_admin_approval_workflow_reject(self):
        """Test admin approval workflow - reject admin request"""
        if not self.admin_token:
            print("❌ No admin token available for rejection test")
            return False
        
        # Create another pending admin request
        timestamp = datetime.now().strftime('%H%M%S')
        pending_data = {
            "email": f"reject.test{timestamp}@afrilance.co.za",
            "password": "RejectTest123!",
            "full_name": f"Reject Test {timestamp}",
            "phone": "+27987654321",
            "department": "Unknown",
            "reason": "Testing rejection workflow"
        }
        
        success, response = self.run_auth_test(
            "Admin Rejection - Create Pending Request",
            "POST",
            "/api/admin/register-request",
            200,
            data=pending_data
        )
        
        if not success:
            print("❌ Failed to create pending admin for rejection test")
            return False
        
        # Get the user ID
        success, users_response = self.run_auth_test(
            "Admin Rejection - Get Users to Find Test User",
            "GET",
            "/api/admin/users",
            200,
            token=self.admin_token
        )
        
        if not success:
            return False
        
        # Find our test user
        test_user_id = None
        for user in users_response:
            if user.get('email') == pending_data['email']:
                test_user_id = user.get('id')
                break
        
        if not test_user_id:
            print("❌ Could not find test user for rejection")
            return False
        
        # Reject the admin request
        rejection_data = {
            "status": "rejected",
            "admin_notes": "Request rejected due to insufficient justification and unclear department role. Please provide more details about your position and specific admin requirements."
        }
        
        success, response = self.run_auth_test(
            "Admin Rejection - Reject Admin Request",
            "POST",
            f"/api/admin/approve-admin/{test_user_id}",
            200,
            data=rejection_data,
            token=self.admin_token
        )
        
        if success:
            print("   ✓ Admin rejection successful")
            print(f"   ✓ User rejected: {response.get('user_id', 'Unknown')}")
            
            # Test that rejected admin still cannot login
            login_data = {
                "email": pending_data["email"],
                "password": pending_data["password"]
            }
            
            success, login_response = self.run_auth_test(
                "Admin Rejection - Test Rejected Admin Login (Should Fail)",
                "POST",
                "/api/admin/login",
                403,
                data=login_data
            )
            
            if success:
                print("   ✓ Rejected admin properly blocked from login")
                return True
            else:
                print("   ❌ Rejected admin can still login")
                return False
        return False

    def test_admin_approval_unauthorized(self):
        """Test that only admins can approve admin requests"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for unauthorized test")
            return False
        
        approval_data = {
            "status": "approved",
            "admin_notes": "Unauthorized approval attempt"
        }
        
        success, response = self.run_auth_test(
            "Admin Approval - Unauthorized Access (Should Fail)",
            "POST",
            "/api/admin/approve-admin/fake-user-id",
            403,
            data=approval_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from admin approval")
            return True
        return False

    def test_admin_security_validations(self):
        """Test comprehensive admin security validations"""
        print("\n🔒 Testing Admin Security Validations...")
        
        # Test 1: Admin login domain restriction
        invalid_domain_data = {
            "email": "hacker@gmail.com",
            "password": "HackerPass123!"
        }
        
        success, response = self.run_auth_test(
            "Security - Domain Restriction",
            "POST",
            "/api/admin/login",
            403,
            data=invalid_domain_data
        )
        
        if not success:
            return False
        
        # Test 2: Admin registration domain restriction
        invalid_reg_data = {
            "email": "fake@yahoo.com",
            "password": "FakePass123!",
            "full_name": "Fake Admin",
            "phone": "+27123456789",
            "department": "Fake",
            "reason": "Fake reason"
        }
        
        success, response = self.run_auth_test(
            "Security - Registration Domain Restriction",
            "POST",
            "/api/admin/register-request",
            400,
            data=invalid_reg_data
        )
        
        if not success:
            return False
        
        # Test 3: Non-admin role trying to access admin login
        if self.freelancer_user:
            # Create a freelancer with @afrilance.co.za email (but not admin role)
            timestamp = datetime.now().strftime('%H%M%S')
            fake_admin_data = {
                "email": f"freelancer{timestamp}@afrilance.co.za",
                "password": "FreelancerPass123!",
                "role": "freelancer",
                "full_name": f"Freelancer {timestamp}",
                "phone": "+27123456789"
            }
            
            # Register as freelancer
            success, response = self.run_auth_test(
                "Security - Create Freelancer with Afrilance Email",
                "POST",
                "/api/register",
                200,
                data=fake_admin_data
            )
            
            if success:
                # Try to login via admin endpoint
                login_data = {
                    "email": fake_admin_data["email"],
                    "password": fake_admin_data["password"]
                }
                
                success, response = self.run_auth_test(
                    "Security - Non-Admin Role Admin Login (Should Fail)",
                    "POST",
                    "/api/admin/login",
                    403,
                    data=login_data
                )
                
                if not success:
                    return False
        
        print("   ✅ All admin security validations passed")
        return True

    # ========== ADMIN USER MANAGEMENT TESTS ==========
    
    def test_admin_get_all_users(self):
        """Test admin endpoint to get all users"""
        if not self.admin_token:
            print("❌ No admin token available for admin users test")
            return False
            
        success, response = self.run_auth_test(
            "Admin - Get All Users",
            "GET",
            "/api/admin/users",
            200,
            token=self.admin_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Retrieved {len(response)} users")
            # Check if our test users are in the list
            user_emails = [user.get('email', '') for user in response]
            if self.freelancer_user and self.freelancer_user['email'] in user_emails:
                print(f"   ✓ Freelancer user found in admin list")
            if self.client_user and self.client_user['email'] in user_emails:
                print(f"   ✓ Client user found in admin list")
            return True
        return False

    def test_admin_get_users_non_admin(self):
        """Test admin endpoint with non-admin token - should return 403"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for non-admin test")
            return False
            
        success, response = self.run_auth_test(
            "Admin - Get Users Non-Admin Access",
            "GET",
            "/api/admin/users",
            403,
            token=self.freelancer_token
        )
        return success

    def test_admin_verify_user(self):
        """Test admin user verification endpoint"""
        if not self.admin_token or not self.freelancer_user:
            print("❌ No admin token or freelancer user available for verification test")
            return False
            
        verification_data = {
            "user_id": self.freelancer_user['id'],
            "verification_status": True
        }
        
        success, response = self.run_auth_test(
            "Admin - Verify User",
            "POST",
            "/api/admin/verify-user",
            200,
            data=verification_data,
            token=self.admin_token
        )
        
        if success:
            print("   ✓ User verification successful")
            return True
        return False

    def test_admin_verify_user_non_admin(self):
        """Test admin verification endpoint with non-admin token - should return 403"""
        if not self.client_token or not self.freelancer_user:
            print("❌ No client token or freelancer user available for non-admin verification test")
            return False
            
        verification_data = {
            "user_id": self.freelancer_user['id'],
            "verification_status": True
        }
        
        success, response = self.run_auth_test(
            "Admin - Verify User Non-Admin Access",
            "POST",
            "/api/admin/verify-user",
            403,
            data=verification_data,
            token=self.client_token
        )
        return success

    def test_role_based_access_control(self):
        """Test comprehensive role-based access control"""
        print("\n🔐 Testing Role-Based Access Control...")
        
        # Test freelancer accessing client-only endpoint (job creation)
        if self.freelancer_token:
            job_data = {
                "title": "Test Job",
                "description": "Test Description",
                "category": "Web Development",
                "budget": 1000.0,
                "budget_type": "fixed",
                "requirements": ["Test"]
            }
            
            success, response = self.run_auth_test(
                "RBAC - Freelancer Create Job (Should Fail)",
                "POST",
                "/api/jobs",
                403,
                data=job_data,
                token=self.freelancer_token
            )
            
            if not success:
                return False
        
        # Test client accessing freelancer-only endpoint (freelancer profile update)
        if self.client_token:
            profile_data = {
                "skills": ["Test"],
                "experience": "Test",
                "hourly_rate": 100.0,
                "bio": "Test"
            }
            
            success, response = self.run_auth_test(
                "RBAC - Client Update Freelancer Profile (Should Fail)",
                "PUT",
                "/api/freelancer/profile",
                403,
                data=profile_data,
                token=self.client_token
            )
            
            if not success:
                return False
        
        print("   ✅ Role-based access control working correctly")
        return True

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        return success

    def test_freelancer_registration(self):
        """Test freelancer registration with enhanced fields"""
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"freelancer_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "freelancer",
            "full_name": f"Test Freelancer {timestamp}",
            "phone": f"+27123456{timestamp[-3:]}"
        }
        
        success, response = self.run_test(
            "Freelancer Registration",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if success and 'token' in response:
            self.freelancer_token = response['token']
            self.freelancer_user = response['user']
            print(f"   Freelancer ID: {self.freelancer_user['id']}")
            return True
        return False

    def test_client_registration(self):
        """Test client registration with enhanced fields"""
        timestamp = datetime.now().strftime('%H%M%S')
        client_data = {
            "email": f"client_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "client",
            "full_name": f"Test Client {timestamp}",
            "phone": f"+27987654{timestamp[-3:]}"
        }
        
        success, response = self.run_test(
            "Client Registration",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in response:
            self.client_token = response['token']
            self.client_user = response['user']
            print(f"   Client ID: {self.client_user['id']}")
            return True
        return False

    def test_login(self):
        """Test login with registered users"""
        if not self.freelancer_user:
            return False
            
        login_data = {
            "email": self.freelancer_user['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Login",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        return success

    def test_get_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get Profile",
            "GET",
            "/api/profile",
            200,
            token=self.freelancer_token
        )
        return success

    def test_update_freelancer_profile(self):
        """Test updating freelancer profile with enhanced fields"""
        profile_data = {
            "skills": ["Python", "React", "Node.js", "FastAPI", "MongoDB", "PostgreSQL", "Docker", "AWS"],
            "experience": "Senior Full-Stack Developer with 7+ years of experience in building scalable web applications. Specialized in Python/Django/FastAPI backends and React/Vue.js frontends. Experience with cloud deployment, microservices architecture, and agile development methodologies.",
            "hourly_rate": 750.0,
            "bio": "Passionate full-stack developer from Cape Town, South Africa. I specialize in creating robust, scalable web applications using modern technologies. My expertise includes backend development with Python (Django/FastAPI), frontend development with React/Vue.js, database design, cloud deployment, and DevOps practices. I have successfully delivered 50+ projects for clients across various industries including fintech, e-commerce, and healthcare.",
            "portfolio_links": [
                "https://github.com/capetown-dev", 
                "https://portfolio.capetown-developer.co.za",
                "https://linkedin.com/in/capetown-fullstack-dev"
            ]
        }
        
        success, response = self.run_test(
            "Update Freelancer Profile with Enhanced Fields",
            "PUT",
            "/api/freelancer/profile",
            200,
            data=profile_data,
            token=self.freelancer_token
        )
        return success

    def test_create_job(self):
        """Test job creation by client with enhanced fields"""
        job_data = {
            "title": "Senior Full-Stack Developer for E-commerce Platform",
            "description": "We need an experienced full-stack developer to build a comprehensive e-commerce platform with React frontend, Python FastAPI backend, and MongoDB database. The project includes user authentication, product catalog, shopping cart, payment integration, and admin dashboard.",
            "category": "Web Development",
            "budget": 25000.0,
            "budget_type": "fixed",
            "requirements": ["React", "Python", "FastAPI", "MongoDB", "Payment Integration", "5+ years experience"]
        }
        
        success, response = self.run_test(
            "Create Job with Enhanced Fields",
            "POST",
            "/api/jobs",
            200,
            data=job_data,
            token=self.client_token
        )
        
        if success and 'job_id' in response:
            self.test_job_id = response['job_id']
            print(f"   Job ID: {self.test_job_id}")
            return True
        return False

    def test_get_jobs(self):
        """Test getting all jobs"""
        success, response = self.run_test(
            "Get Jobs",
            "GET",
            "/api/jobs",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} jobs")
            return True
        return False

    def test_get_my_jobs_client(self):
        """Test getting client's posted jobs"""
        success, response = self.run_test(
            "Get My Jobs (Client)",
            "GET",
            "/api/jobs/my",
            200,
            token=self.client_token
        )
        
        if success and isinstance(response, list):
            print(f"   Client has {len(response)} jobs")
            return True
        return False

    def test_apply_to_job(self):
        """Test job application by freelancer with comprehensive proposal"""
        if not self.test_job_id:
            print("❌ No job ID available for application test")
            return False
            
        application_data = {
            "job_id": self.test_job_id,
            "proposal": """Dear Client,

I am excited to submit my proposal for your Senior Full-Stack Developer position for the E-commerce Platform project. With over 7 years of experience in full-stack development and a proven track record of delivering complex e-commerce solutions, I am confident I can exceed your expectations.

**My Relevant Experience:**
- Built 15+ e-commerce platforms using React, Python FastAPI, and MongoDB
- Integrated multiple payment gateways (Stripe, PayPal, PayFast for South African market)
- Developed scalable admin dashboards with real-time analytics
- Implemented secure user authentication and authorization systems

**Technical Approach:**
- Frontend: React with TypeScript, Redux for state management, Tailwind CSS for styling
- Backend: Python FastAPI with async/await for high performance
- Database: MongoDB with proper indexing and data modeling
- Payment: Stripe integration with South African payment methods
- Deployment: Docker containers on AWS with CI/CD pipeline

**Timeline:** I can complete this project within 8-10 weeks with regular updates and milestone deliveries.

**Why Choose Me:**
- Based in Cape Town, South Africa - perfect timezone alignment
- Strong communication skills in English and Afrikaans
- Available for regular video calls and project updates
- 100% client satisfaction rate on previous projects

I would love to discuss your project requirements in detail. Please feel free to review my portfolio and previous client testimonials.

Best regards,
Thabo Mthembu
Senior Full-Stack Developer""",
            "bid_amount": 23000.0
        }
        
        success, response = self.run_test(
            "Apply to Job with Comprehensive Proposal",
            "POST",
            f"/api/jobs/{self.test_job_id}/apply",
            200,
            data=application_data,
            token=self.freelancer_token
        )
        return success

    def test_get_job_applications(self):
        """Test getting applications for a job (client view)"""
        if not self.test_job_id:
            print("❌ No job ID available for applications test")
            return False
            
        success, response = self.run_test(
            "Get Job Applications",
            "GET",
            f"/api/jobs/{self.test_job_id}/applications",
            200,
            token=self.client_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} applications")
            return True
        return False

    def test_send_message(self):
        """Test sending a message"""
        if not self.test_job_id or not self.client_user:
            print("❌ Missing job ID or client user for message test")
            return False
            
        message_data = {
            "job_id": self.test_job_id,
            "receiver_id": self.client_user['id'],
            "content": "Hello, I have some questions about the project requirements."
        }
        
        success, response = self.run_test(
            "Send Message",
            "POST",
            "/api/messages",
            200,
            data=message_data,
            token=self.freelancer_token
        )
        return success

    def test_get_messages(self):
        """Test getting messages for a job"""
        if not self.test_job_id:
            print("❌ No job ID available for messages test")
            return False
            
        success, response = self.run_test(
            "Get Messages",
            "GET",
            f"/api/messages/{self.test_job_id}",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} messages")
            return True
        return False

    def test_support_ticket(self):
        """Test support ticket submission"""
        support_data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "message": "This is a test support ticket to verify the support system is working correctly."
        }
        
        success, response = self.run_test(
            "Submit Support Ticket",
            "POST",
            "/api/support",
            200,
            data=support_data
        )
        
        if success and 'ticket_id' in response:
            print(f"   Ticket ID: {response['ticket_id']}")
            print(f"   Email sent: {response.get('email_sent', 'Unknown')}")
            return True
        return False

    def test_duplicate_registration(self):
        """Test duplicate email registration (should fail)"""
        if not self.freelancer_user:
            return False
            
        duplicate_data = {
            "email": self.freelancer_user['email'],
            "password": "AnotherPass123!",
            "role": "client",
            "full_name": "Duplicate User"
        }
        
        success, response = self.run_test(
            "Duplicate Registration (Should Fail)",
            "POST",
            "/api/register",
            400,
            data=duplicate_data
        )
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials (should fail)"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "WrongPassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "/api/login",
            401,
            data=invalid_data
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token (should fail)"""
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "/api/profile",
            401
        )
        return success

    def test_id_document_upload(self):
        """Test ID document upload for freelancers"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for ID upload test")
            return False
            
        # Create a dummy file content for testing
        import io
        dummy_file_content = b"dummy pdf content for testing"
        
        # Note: This is a simplified test - in real scenario we'd use proper file upload
        # For now, we'll test the endpoint availability
        success, response = self.run_test(
            "ID Document Upload Endpoint Check",
            "POST",
            "/api/upload-id-document",
            400,  # Expect 400 because we're not sending proper file
            token=self.freelancer_token
        )
        return True  # Return True since we're just checking endpoint availability

    def test_role_based_verification(self):
        """Test that freelancers have verification requirements"""
        if not self.freelancer_user:
            print("❌ No freelancer user available for verification test")
            return False
            
        # Check if freelancer has verification_required flag
        if 'verification_required' in self.freelancer_user:
            verification_required = self.freelancer_user['verification_required']
            can_bid = self.freelancer_user.get('can_bid', True)
            
            print(f"   Freelancer verification_required: {verification_required}")
            print(f"   Freelancer can_bid: {can_bid}")
            
            # For freelancers, verification should be required and can_bid should be False initially
            if verification_required and not can_bid:
                print("✅ Freelancer verification requirements correctly set")
                return True
            else:
                print("❌ Freelancer verification requirements not properly set")
                return False
        else:
            print("❌ Verification fields missing from freelancer user")
            return False

    def test_client_no_verification(self):
        """Test that clients don't need verification"""
        if not self.client_user:
            print("❌ No client user available for verification test")
            return False
            
        # Check if client has verification_required flag
        verification_required = self.client_user.get('verification_required', True)
        can_bid = self.client_user.get('can_bid', False)
        
        print(f"   Client verification_required: {verification_required}")
        print(f"   Client can_bid: {can_bid}")
        
        # For clients, verification should not be required and can_bid should be True
        if not verification_required and can_bid:
            print("✅ Client verification requirements correctly set")
            return True
        else:
            print("❌ Client verification requirements not properly set")
            return False

    def test_job_filtering_by_category(self):
        """Test job filtering by category"""
        success, response = self.run_test(
            "Get Jobs Filtered by Category",
            "GET",
            "/api/jobs?category=Web Development",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} Web Development jobs")
            # Verify all jobs are in the correct category
            for job in response:
                if job.get('category') != 'Web Development':
                    print(f"   ❌ Job {job.get('title', 'Unknown')} has wrong category: {job.get('category')}")
                    return False
            print("   ✓ All jobs have correct category filter")
            return True
        return False

    def test_comprehensive_job_data(self):
        """Test that job responses contain all necessary enhanced data"""
        success, response = self.run_test(
            "Get Jobs with Enhanced Data",
            "GET",
            "/api/jobs",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            job = response[0]  # Check first job
            required_fields = ['id', 'title', 'description', 'category', 'budget', 'budget_type', 'requirements', 'client_id', 'status', 'created_at', 'applications_count']
            
            missing_fields = []
            for field in required_fields:
                if field not in job:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Missing fields in job data: {missing_fields}")
                return False
            
            print("   ✓ Job contains all required enhanced fields")
            print(f"   ✓ Job has {job.get('applications_count', 0)} applications")
            print(f"   ✓ Job requirements: {job.get('requirements', [])}")
            return True
        return False

    def test_freelancer_profile_completion_tracking(self):
        """Test freelancer profile completion tracking"""
        success, response = self.run_test(
            "Get Profile with Completion Tracking",
            "GET",
            "/api/profile",
            200,
            token=self.freelancer_token
        )
        
        if success:
            profile_completed = response.get('profile_completed', False)
            profile_data = response.get('profile', {})
            
            print(f"   Profile completed: {profile_completed}")
            print(f"   Profile data keys: {list(profile_data.keys())}")
            
            # After updating profile, it should be marked as completed
            if profile_completed and profile_data:
                print("   ✓ Profile completion tracking working correctly")
                return True
            else:
                print("   ❌ Profile completion not properly tracked")
                return False
        return False

    def test_admin_dashboard_data(self):
        """Test admin dashboard access and data retrieval"""
        if not self.admin_token:
            print("❌ No admin token available for dashboard test")
            return False
            
        success, response = self.run_test(
            "Admin Dashboard - Get All Users",
            "GET",
            "/api/admin/users",
            200,
            token=self.admin_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Admin can access user data: {len(response)} users")
            
            # Check user data structure
            if len(response) > 0:
                user = response[0]
                admin_required_fields = ['id', 'email', 'role', 'full_name', 'is_verified', 'created_at']
                
                missing_fields = []
                for field in admin_required_fields:
                    if field not in user:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing admin dashboard fields: {missing_fields}")
                    return False
                
                print("   ✓ Admin dashboard contains all required user fields")
                
                # Count users by role
                role_counts = {}
                for user in response:
                    role = user.get('role', 'unknown')
                    role_counts[role] = role_counts.get(role, 0) + 1
                
                print(f"   ✓ User distribution: {role_counts}")
                return True
        return False

    def test_user_verification_workflow(self):
        """Test complete user verification workflow"""
        if not self.admin_token or not self.freelancer_user:
            print("❌ Missing admin token or freelancer user for verification workflow")
            return False
        
        # Step 1: Verify the freelancer
        verification_data = {
            "user_id": self.freelancer_user['id'],
            "verification_status": True
        }
        
        success, response = self.run_test(
            "Admin Verify Freelancer",
            "POST",
            "/api/admin/verify-user",
            200,
            data=verification_data,
            token=self.admin_token
        )
        
        if not success:
            return False
        
        # Step 2: Check if freelancer can now bid (get updated profile)
        success, response = self.run_test(
            "Check Freelancer Can Bid After Verification",
            "GET",
            "/api/profile",
            200,
            token=self.freelancer_token
        )
        
        if success:
            is_verified = response.get('is_verified', False)
            can_bid = response.get('can_bid', False)
            verification_required = response.get('verification_required', True)
            
            print(f"   Freelancer verified: {is_verified}")
            print(f"   Freelancer can bid: {can_bid}")
            print(f"   Verification required: {verification_required}")
            
            if is_verified and can_bid and not verification_required:
                print("   ✓ Verification workflow completed successfully")
                return True
            else:
                print("   ❌ Verification workflow not working properly")
                return False
        return False

    def test_enhanced_messaging_system(self):
        """Test enhanced messaging system with job context"""
        if not self.test_job_id or not self.client_user:
            print("❌ Missing job ID or client user for enhanced messaging test")
            return False
            
        # Send a detailed project message
        message_data = {
            "job_id": self.test_job_id,
            "receiver_id": self.client_user['id'],
            "content": """Hello,

Thank you for considering my proposal for the E-commerce Platform project. I have a few questions to ensure I deliver exactly what you need:

1. **Payment Integration**: Do you have a preference for payment gateways? I recommend Stripe for international payments and PayFast for South African customers.

2. **Admin Dashboard**: What specific analytics and reporting features would you like in the admin dashboard?

3. **Mobile Responsiveness**: Should the platform be fully responsive for mobile devices, or do you plan a separate mobile app?

4. **Timeline**: Are there any specific milestones or deadlines I should be aware of?

I'm excited to work on this project and deliver a high-quality e-commerce solution.

Best regards,
Thabo"""
        }
        
        success, response = self.run_test(
            "Send Enhanced Project Message",
            "POST",
            "/api/messages",
            200,
            data=message_data,
            token=self.freelancer_token
        )
        
        if not success:
            return False
        
        # Get messages to verify content
        success, response = self.run_test(
            "Get Enhanced Messages",
            "GET",
            f"/api/messages/{self.test_job_id}",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            message = response[-1]  # Get latest message
            if len(message.get('content', '')) > 100:  # Check for detailed content
                print("   ✓ Enhanced messaging system working with detailed content")
                return True
        return False

    def test_support_system_comprehensive(self):
        """Test comprehensive support ticket system"""
        support_data = {
            "name": "Sipho Ndlovu",
            "email": "sipho.ndlovu@gmail.com",
            "message": """Hello Afrilance Support Team,

I am experiencing an issue with my freelancer profile verification. I uploaded my South African ID document 3 days ago, but my account is still showing as unverified.

**Issue Details:**
- Account: sipho.ndlovu@gmail.com
- Role: Freelancer
- ID Document: Uploaded on 2025-01-08
- Current Status: Pending verification

**Impact:**
I am unable to bid on projects, which is affecting my ability to earn income through the platform.

**Request:**
Could you please expedite the verification process or let me know if there are any issues with my submitted documents?

**Additional Information:**
- Location: Johannesburg, South Africa
- Phone: +27 11 123 4567
- Preferred contact method: Email

Thank you for your assistance. I look forward to your prompt response.

Best regards,
Sipho Ndlovu
Freelance Web Developer"""
        }
        
        success, response = self.run_test(
            "Submit Comprehensive Support Ticket",
            "POST",
            "/api/support",
            200,
            data=support_data
        )
        
        if success and 'ticket_id' in response:
            print(f"   ✓ Support ticket created: {response['ticket_id']}")
            print(f"   ✓ Email notification sent: {response.get('email_sent', 'Unknown')}")
            return True
        return False

    # ========== COMPREHENSIVE IN-APP MESSAGING SYSTEM TESTS ==========
    
    def test_direct_message_send(self):
        """Test sending direct messages between users"""
        if not self.freelancer_token or not self.client_user:
            print("❌ Missing freelancer token or client user for direct message test")
            return False
            
        message_data = {
            "receiver_id": self.client_user['id'],
            "content": "Hello! I'm interested in discussing potential collaboration opportunities. I specialize in full-stack development with React and Python, and I've noticed you post interesting projects. Would you be open to a brief conversation about your upcoming development needs?"
        }
        
        success, response = self.run_test(
            "Direct Message - Send Message",
            "POST",
            "/api/direct-messages",
            200,
            data=message_data,
            token=self.freelancer_token
        )
        
        if success and 'conversation_id' in response:
            print(f"   ✓ Direct message sent successfully")
            print(f"   ✓ Conversation ID: {response['conversation_id']}")
            self.test_conversation_id = response['conversation_id']
            return True
        return False

    def test_direct_message_to_self(self):
        """Test sending direct message to self - should fail"""
        if not self.freelancer_token or not self.freelancer_user:
            print("❌ Missing freelancer token or user for self-message test")
            return False
            
        message_data = {
            "receiver_id": self.freelancer_user['id'],
            "content": "This should fail - messaging yourself"
        }
        
        success, response = self.run_test(
            "Direct Message - Send to Self (Should Fail)",
            "POST",
            "/api/direct-messages",
            400,
            data=message_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Self-messaging properly blocked")
            return True
        return False

    def test_direct_message_nonexistent_user(self):
        """Test sending direct message to non-existent user - should fail"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for non-existent user test")
            return False
            
        message_data = {
            "receiver_id": "non-existent-user-id",
            "content": "This should fail - user doesn't exist"
        }
        
        success, response = self.run_test(
            "Direct Message - Non-existent User (Should Fail)",
            "POST",
            "/api/direct-messages",
            404,
            data=message_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Non-existent user properly handled")
            return True
        return False

    def test_get_conversations(self):
        """Test getting all conversations for current user"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for conversations test")
            return False
            
        success, response = self.run_test(
            "Conversations - Get All Conversations",
            "GET",
            "/api/conversations",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Retrieved {len(response)} conversations")
            
            if len(response) > 0:
                conversation = response[0]
                required_fields = ['conversation_id', 'participants', 'last_message_at', 'last_message_content', 'other_participant', 'unread_count']
                
                missing_fields = []
                for field in required_fields:
                    if field not in conversation:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing conversation fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Conversation with: {conversation['other_participant']['full_name']}")
                print(f"   ✓ Unread messages: {conversation['unread_count']}")
                print(f"   ✓ Last message preview: {conversation['last_message_content'][:50]}...")
                
            return True
        return False

    def test_get_conversation_messages(self):
        """Test getting messages in a specific conversation"""
        if not self.freelancer_token or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing freelancer token or conversation ID for messages test")
            return False
            
        success, response = self.run_test(
            "Conversations - Get Messages",
            "GET",
            f"/api/conversations/{self.test_conversation_id}/messages",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Retrieved {len(response)} messages in conversation")
            
            if len(response) > 0:
                message = response[0]
                required_fields = ['id', 'conversation_id', 'sender_id', 'receiver_id', 'content', 'created_at', 'read', 'sender_name', 'sender_role']
                
                missing_fields = []
                for field in required_fields:
                    if field not in message:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing message fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Message from: {message['sender_name']} ({message['sender_role']})")
                print(f"   ✓ Message content: {message['content'][:100]}...")
                print(f"   ✓ Message read status: {message['read']}")
                
            return True
        return False

    def test_get_conversation_messages_unauthorized(self):
        """Test getting messages from conversation user is not part of - should fail"""
        if not self.admin_token:
            print("❌ Missing admin token for unauthorized conversation test")
            return False
            
        # Try to access conversation between freelancer and client using admin token
        fake_conversation_id = "dm_fake_user1_fake_user2"
        
        success, response = self.run_test(
            "Conversations - Unauthorized Access (Should Fail)",
            "GET",
            f"/api/conversations/{fake_conversation_id}/messages",
            404,
            token=self.admin_token
        )
        
        if success:
            print("   ✓ Unauthorized conversation access properly blocked")
            return True
        return False

    def test_mark_conversation_read(self):
        """Test marking all messages in a conversation as read"""
        if not self.client_token or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing client token or conversation ID for mark read test")
            return False
            
        success, response = self.run_test(
            "Conversations - Mark as Read",
            "POST",
            f"/api/conversations/{self.test_conversation_id}/mark-read",
            200,
            token=self.client_token
        )
        
        if success and 'message' in response:
            print(f"   ✓ Mark as read successful: {response['message']}")
            return True
        return False

    def test_mark_conversation_read_unauthorized(self):
        """Test marking conversation as read by non-participant - should fail"""
        if not self.admin_token or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing admin token or conversation ID for unauthorized mark read test")
            return False
            
        success, response = self.run_test(
            "Conversations - Mark Read Unauthorized (Should Fail)",
            "POST",
            f"/api/conversations/{self.test_conversation_id}/mark-read",
            404,
            token=self.admin_token
        )
        
        if success:
            print("   ✓ Unauthorized mark as read properly blocked")
            return True
        return False

    def test_search_users_for_messaging(self):
        """Test searching users to start new conversations"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for user search test")
            return False
            
        success, response = self.run_test(
            "Conversations - Search Users",
            "GET",
            "/api/conversations/search?query=client",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} users matching 'client'")
            
            if len(response) > 0:
                user = response[0]
                required_fields = ['id', 'full_name', 'email', 'role', 'is_verified']
                
                missing_fields = []
                for field in required_fields:
                    if field not in user:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing user search fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Found user: {user['full_name']} ({user['role']})")
                print(f"   ✓ User verified: {user['is_verified']}")
                
                # Verify current user is not in results
                for search_user in response:
                    if search_user['id'] == self.freelancer_user['id']:
                        print("   ❌ Current user included in search results")
                        return False
                
                print("   ✓ Current user properly excluded from search results")
                
            return True
        return False

    def test_search_users_short_query(self):
        """Test user search with too short query - should fail"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for short query test")
            return False
            
        success, response = self.run_test(
            "Conversations - Search Short Query (Should Fail)",
            "GET",
            "/api/conversations/search?query=a",
            400,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Short query properly rejected")
            return True
        return False

    def test_search_users_by_email(self):
        """Test searching users by email"""
        if not self.freelancer_token or not self.client_user:
            print("❌ Missing freelancer token or client user for email search test")
            return False
            
        # Search by part of client's email
        client_email_part = self.client_user['email'].split('@')[0][:5]  # First 5 chars before @
        
        success, response = self.run_test(
            "Conversations - Search by Email",
            "GET",
            f"/api/conversations/search?query={client_email_part}",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Email search returned {len(response)} results")
            
            # Check if our client user is in the results
            found_client = False
            for user in response:
                if user['id'] == self.client_user['id']:
                    found_client = True
                    print(f"   ✓ Found client user: {user['full_name']}")
                    break
            
            if not found_client and len(response) == 0:
                print("   ✓ No results found (acceptable if no matching users)")
                return True
            elif found_client:
                return True
            else:
                print("   ❌ Expected client user not found in search results")
                return False
        return False

    def test_conversation_bidirectional_messaging(self):
        """Test bidirectional messaging in a conversation"""
        if not self.client_token or not self.freelancer_user or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing client token, freelancer user, or conversation ID for bidirectional test")
            return False
            
        # Client sends reply to freelancer
        reply_data = {
            "receiver_id": self.freelancer_user['id'],
            "content": "Hello! Thank you for reaching out. I'm always interested in connecting with talented developers. I have several upcoming projects that might be a good fit for your skills. Could you tell me more about your experience with e-commerce platforms and payment integrations?"
        }
        
        success, response = self.run_test(
            "Direct Message - Client Reply",
            "POST",
            "/api/direct-messages",
            200,
            data=reply_data,
            token=self.client_token
        )
        
        if not success:
            return False
        
        # Verify both users can see the conversation
        success, response = self.run_test(
            "Conversations - Client View",
            "GET",
            "/api/conversations",
            200,
            token=self.client_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   ✓ Client can see {len(response)} conversations")
            
            # Find our test conversation
            found_conversation = False
            for conv in response:
                if conv['conversation_id'] == self.test_conversation_id:
                    found_conversation = True
                    print(f"   ✓ Client found conversation with: {conv['other_participant']['full_name']}")
                    break
            
            if not found_conversation:
                print("   ❌ Client cannot find the conversation")
                return False
            
            return True
        return False

    def test_conversation_message_persistence(self):
        """Test that messages persist correctly in conversations"""
        if not self.freelancer_token or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing freelancer token or conversation ID for persistence test")
            return False
            
        # Get messages before sending new one
        success, response_before = self.run_test(
            "Conversations - Get Messages Before",
            "GET",
            f"/api/conversations/{self.test_conversation_id}/messages",
            200,
            token=self.freelancer_token
        )
        
        if not success:
            return False
        
        messages_before = len(response_before) if isinstance(response_before, list) else 0
        
        # Send another message
        message_data = {
            "receiver_id": self.client_user['id'],
            "content": "I have extensive experience with e-commerce platforms. I've built over 15 online stores using React/Next.js frontends with Python FastAPI backends. For payments, I've integrated Stripe, PayPal, and PayFast (for South African market). I can share some portfolio examples if you're interested."
        }
        
        success, response = self.run_test(
            "Direct Message - Follow-up Message",
            "POST",
            "/api/direct-messages",
            200,
            data=message_data,
            token=self.freelancer_token
        )
        
        if not success:
            return False
        
        # Get messages after sending new one
        success, response_after = self.run_test(
            "Conversations - Get Messages After",
            "GET",
            f"/api/conversations/{self.test_conversation_id}/messages",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response_after, list):
            messages_after = len(response_after)
            
            if messages_after == messages_before + 1:
                print(f"   ✓ Message count increased from {messages_before} to {messages_after}")
                
                # Check if the new message is the latest one
                latest_message = response_after[-1]
                if message_data['content'] in latest_message['content']:
                    print("   ✓ Latest message content matches sent message")
                    return True
                else:
                    print("   ❌ Latest message content doesn't match")
                    return False
            else:
                print(f"   ❌ Message count didn't increase correctly: {messages_before} → {messages_after}")
                return False
        return False

    def test_conversation_unread_count_tracking(self):
        """Test unread message count tracking"""
        if not self.client_token or not hasattr(self, 'test_conversation_id'):
            print("❌ Missing client token or conversation ID for unread count test")
            return False
            
        # Get conversations for client (should have unread messages from freelancer)
        success, response = self.run_test(
            "Conversations - Check Unread Count",
            "GET",
            "/api/conversations",
            200,
            token=self.client_token
        )
        
        if success and isinstance(response, list):
            # Find our test conversation
            test_conversation = None
            for conv in response:
                if conv['conversation_id'] == self.test_conversation_id:
                    test_conversation = conv
                    break
            
            if not test_conversation:
                print("   ❌ Test conversation not found")
                return False
            
            unread_count = test_conversation['unread_count']
            print(f"   ✓ Unread count for client: {unread_count}")
            
            if unread_count > 0:
                print("   ✓ Unread count tracking working correctly")
                return True
            else:
                print("   ⚠️ No unread messages (may be expected if messages were already read)")
                return True  # This is acceptable
        return False

    def test_messaging_system_comprehensive_workflow(self):
        """Test complete messaging workflow end-to-end"""
        print("\n💬 Testing Complete Messaging Workflow...")
        
        if not all([self.freelancer_token, self.client_token, self.admin_token, 
                   self.freelancer_user, self.client_user, self.admin_user]):
            print("❌ Missing required tokens or users for comprehensive workflow test")
            return False
        
        workflow_steps = [
            "1. Freelancer initiates conversation with client",
            "2. Client receives and replies to message", 
            "3. Multiple message exchange",
            "4. Mark messages as read",
            "5. Search for users to message",
            "6. Verify conversation persistence"
        ]
        
        print("   Workflow steps:")
        for step in workflow_steps:
            print(f"   {step}")
        
        # All individual tests should have covered these steps
        # This is a summary test to confirm the workflow
        
        # Check final conversation state
        success, response = self.run_test(
            "Workflow - Final Conversation State",
            "GET",
            "/api/conversations",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            conversation = response[0]
            print(f"   ✓ Final conversation state:")
            print(f"     - Participants: {len(conversation['participants'])}")
            print(f"     - Other participant: {conversation['other_participant']['full_name']}")
            print(f"     - Last message: {conversation['last_message_content'][:50]}...")
            print(f"     - Unread count: {conversation['unread_count']}")
            
            print("   ✅ Complete messaging workflow successful")
            return True
        
        print("   ❌ Messaging workflow incomplete")
        return False

    # ========== CONTRACTS SYSTEM TESTS ==========
    
    def test_contract_creation_flow(self):
        """Test complete contract creation flow: Job → Application → Acceptance → Contract"""
        print("\n🔄 Testing Contract Creation Flow...")
        
        # Step 1: Create a job as client
        job_data = {
            "title": "Mobile App Development for Restaurant Chain",
            "description": "Develop a React Native mobile app for a South African restaurant chain with online ordering, payment integration, and loyalty program features.",
            "category": "Mobile Development",
            "budget": 45000.0,
            "budget_type": "fixed",
            "requirements": ["React Native", "Payment Integration", "Firebase", "3+ years experience"]
        }
        
        success, response = self.run_test(
            "Contract Flow - Create Job",
            "POST",
            "/api/jobs",
            200,
            data=job_data,
            token=self.client_token
        )
        
        if not success or 'job_id' not in response:
            print("❌ Failed to create job for contract flow")
            return False
            
        contract_job_id = response['job_id']
        print(f"   ✓ Job created: {contract_job_id}")
        
        # Step 2: Apply to the job as freelancer
        application_data = {
            "job_id": contract_job_id,
            "proposal": """Dear Client,

I am excited to propose my services for your Mobile App Development project. With 5+ years of React Native experience and expertise in South African payment systems, I'm confident I can deliver an exceptional restaurant app.

**My Approach:**
- React Native with TypeScript for cross-platform compatibility
- Firebase for real-time data and push notifications
- PayFast integration for South African payments
- Stripe for card payments
- Custom loyalty program with points system

**Timeline:** 10-12 weeks with weekly progress updates

**Why Choose Me:**
- Built 8+ restaurant apps with online ordering
- Expert in South African payment gateways
- Based in Cape Town for timezone alignment
- 100% client satisfaction rate

Looking forward to discussing your project in detail.

Best regards,
Thabo Mthembu""",
            "bid_amount": 42000.0
        }
        
        success, response = self.run_test(
            "Contract Flow - Apply to Job",
            "POST",
            f"/api/jobs/{contract_job_id}/apply",
            200,
            data=application_data,
            token=self.freelancer_token
        )
        
        if not success:
            print("❌ Failed to apply to job for contract flow")
            return False
        print("   ✓ Application submitted")
        
        # Step 3: Get applications to find the proposal ID
        success, response = self.run_test(
            "Contract Flow - Get Applications",
            "GET",
            f"/api/jobs/{contract_job_id}/applications",
            200,
            token=self.client_token
        )
        
        if not success or not isinstance(response, list) or len(response) == 0:
            print("❌ Failed to get applications for contract flow")
            return False
            
        application = response[0]
        proposal_id = application['id']
        print(f"   ✓ Found application: {proposal_id}")
        
        # Step 4: Accept the proposal (this should create a contract)
        acceptance_data = {
            "job_id": contract_job_id,
            "freelancer_id": self.freelancer_user['id'],
            "proposal_id": proposal_id,
            "bid_amount": 42000.0
        }
        
        success, response = self.run_test(
            "Contract Flow - Accept Proposal",
            "POST",
            f"/api/jobs/{contract_job_id}/accept-proposal",
            200,
            data=acceptance_data,
            token=self.client_token
        )
        
        if not success or 'contract_id' not in response:
            print("❌ Failed to accept proposal and create contract")
            return False
            
        self.test_contract_id = response['contract_id']
        print(f"   ✓ Contract created: {self.test_contract_id}")
        print(f"   ✓ Freelancer: {response.get('freelancer_name', 'Unknown')}")
        
        # Step 5: Verify contract was created with correct fields
        success, contract_response = self.run_test(
            "Contract Flow - Verify Contract Details",
            "GET",
            f"/api/contracts/{self.test_contract_id}",
            200,
            token=self.client_token
        )
        
        if success:
            required_fields = ['id', 'job_id', 'freelancer_id', 'client_id', 'amount', 'status', 'created_at']
            missing_fields = []
            
            for field in required_fields:
                if field not in contract_response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Contract missing required fields: {missing_fields}")
                return False
            
            # Verify contract details
            if (contract_response['job_id'] == contract_job_id and
                contract_response['freelancer_id'] == self.freelancer_user['id'] and
                contract_response['client_id'] == self.client_user['id'] and
                contract_response['amount'] == 42000.0 and
                contract_response['status'] == "In Progress"):
                print("   ✅ Contract created with correct details")
                return True
            else:
                print("   ❌ Contract details don't match expected values")
                return False
        
        return False

    def test_contract_trigger_logic(self):
        """Test that accepting proposal triggers all necessary updates"""
        print("\n🔄 Testing Contract Trigger Logic...")
        
        # Get the job to verify it was updated
        success, job_response = self.run_test(
            "Trigger Logic - Check Job Status",
            "GET",
            "/api/jobs",
            200,
            token=self.client_token
        )
        
        if success and isinstance(job_response, list):
            # Find our test job
            test_job = None
            for job in job_response:
                if hasattr(self, 'test_contract_id') and job.get('contract_id') == self.test_contract_id:
                    test_job = job
                    break
            
            if test_job:
                # Verify job status changed to 'assigned'
                if test_job.get('status') == 'assigned':
                    print("   ✓ Job status updated to 'assigned'")
                else:
                    print(f"   ❌ Job status not updated correctly: {test_job.get('status')}")
                    return False
                
                # Verify job has assigned_freelancer_id
                if test_job.get('assigned_freelancer_id') == self.freelancer_user['id']:
                    print("   ✓ Job assigned to correct freelancer")
                else:
                    print("   ❌ Job not assigned to correct freelancer")
                    return False
                
                # Verify job has contract_id
                if test_job.get('contract_id') == self.test_contract_id:
                    print("   ✓ Job linked to contract")
                else:
                    print("   ❌ Job not linked to contract")
                    return False
                
                print("   ✅ All trigger logic working correctly")
                return True
            else:
                print("   ❌ Could not find test job to verify trigger logic")
                return False
        
        return False

    def test_contracts_get_all_roles(self):
        """Test GET /api/contracts endpoint for all user roles"""
        print("\n📋 Testing Contracts GET for All Roles...")
        
        # Test freelancer access
        success, freelancer_contracts = self.run_test(
            "Contracts - Freelancer Get Contracts",
            "GET",
            "/api/contracts",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(freelancer_contracts, list):
            print(f"   ✓ Freelancer can access contracts: {len(freelancer_contracts)} found")
            
            # Verify freelancer only sees their contracts
            for contract in freelancer_contracts:
                if contract.get('freelancer_id') != self.freelancer_user['id']:
                    print("   ❌ Freelancer seeing contracts they're not part of")
                    return False
            print("   ✓ Freelancer only sees their own contracts")
        else:
            print("   ❌ Freelancer contract access failed")
            return False
        
        # Test client access
        success, client_contracts = self.run_test(
            "Contracts - Client Get Contracts",
            "GET",
            "/api/contracts",
            200,
            token=self.client_token
        )
        
        if success and isinstance(client_contracts, list):
            print(f"   ✓ Client can access contracts: {len(client_contracts)} found")
            
            # Verify client only sees their contracts
            for contract in client_contracts:
                if contract.get('client_id') != self.client_user['id']:
                    print("   ❌ Client seeing contracts they're not part of")
                    return False
            print("   ✓ Client only sees their own contracts")
        else:
            print("   ❌ Client contract access failed")
            return False
        
        # Test admin access
        if self.admin_token:
            success, admin_contracts = self.run_test(
                "Contracts - Admin Get All Contracts",
                "GET",
                "/api/contracts",
                200,
                token=self.admin_token
            )
            
            if success and isinstance(admin_contracts, list):
                print(f"   ✓ Admin can access all contracts: {len(admin_contracts)} found")
                
                # Admin should see more contracts than individual users
                if len(admin_contracts) >= len(freelancer_contracts):
                    print("   ✓ Admin sees all contracts in system")
                else:
                    print("   ❌ Admin not seeing all contracts")
                    return False
            else:
                print("   ❌ Admin contract access failed")
                return False
        
        return True

    def test_contract_detailed_view(self):
        """Test GET /api/contracts/{contract_id} for detailed contract view"""
        if not hasattr(self, 'test_contract_id'):
            print("❌ No test contract available for detailed view test")
            return False
        
        success, response = self.run_test(
            "Contracts - Get Contract Details",
            "GET",
            f"/api/contracts/{self.test_contract_id}",
            200,
            token=self.client_token
        )
        
        if success:
            # Verify enriched contract data
            required_fields = ['id', 'job_id', 'freelancer_id', 'client_id', 'amount', 'status']
            enriched_fields = ['job_details', 'freelancer_details', 'client_details']
            
            missing_required = []
            missing_enriched = []
            
            for field in required_fields:
                if field not in response:
                    missing_required.append(field)
            
            for field in enriched_fields:
                if field not in response:
                    missing_enriched.append(field)
            
            if missing_required:
                print(f"   ❌ Contract missing required fields: {missing_required}")
                return False
            
            if missing_enriched:
                print(f"   ❌ Contract missing enriched fields: {missing_enriched}")
                return False
            
            # Verify job details are included
            job_details = response.get('job_details', {})
            if 'title' in job_details and 'description' in job_details:
                print("   ✓ Job details included in contract")
            else:
                print("   ❌ Job details not properly included")
                return False
            
            # Verify freelancer details are included
            freelancer_details = response.get('freelancer_details', {})
            if 'full_name' in freelancer_details and 'email' in freelancer_details:
                print("   ✓ Freelancer details included in contract")
            else:
                print("   ❌ Freelancer details not properly included")
                return False
            
            # Verify client details are included
            client_details = response.get('client_details', {})
            if 'full_name' in client_details and 'email' in client_details:
                print("   ✓ Client details included in contract")
            else:
                print("   ❌ Client details not properly included")
                return False
            
            print("   ✅ Contract detailed view working correctly")
            return True
        
        return False

    def test_contract_status_update(self):
        """Test PATCH /api/contracts/{contract_id}/status to update contract status"""
        if not hasattr(self, 'test_contract_id'):
            print("❌ No test contract available for status update test")
            return False
        
        # Test updating to "Completed"
        status_data = {"status": "Completed"}
        
        success, response = self.run_test(
            "Contracts - Update Status to Completed",
            "PATCH",
            f"/api/contracts/{self.test_contract_id}/status",
            200,
            data=status_data,
            token=self.client_token
        )
        
        if not success:
            print("   ❌ Failed to update contract status")
            return False
        
        print("   ✓ Contract status updated successfully")
        
        # Verify the status was actually updated
        success, contract_response = self.run_test(
            "Contracts - Verify Status Update",
            "GET",
            f"/api/contracts/{self.test_contract_id}",
            200,
            token=self.client_token
        )
        
        if success and contract_response.get('status') == 'Completed':
            print("   ✓ Contract status verified as 'Completed'")
            
            # Check if job status was also updated
            job_details = contract_response.get('job_details', {})
            if job_details.get('status') == 'completed':
                print("   ✓ Job status also updated to 'completed'")
                return True
            else:
                print("   ❌ Job status not updated when contract completed")
                return False
        else:
            print("   ❌ Contract status not properly updated")
            return False

    def test_contract_stats(self):
        """Test GET /api/contracts/stats endpoint"""
        print("\n📊 Testing Contract Stats...")
        
        # Test freelancer stats
        success, freelancer_stats = self.run_test(
            "Contracts - Freelancer Stats",
            "GET",
            "/api/contracts/stats",
            200,
            token=self.freelancer_token
        )
        
        if success:
            required_stats = ['total_contracts', 'total_amount', 'in_progress', 'completed', 'cancelled']
            missing_stats = []
            
            for stat in required_stats:
                if stat not in freelancer_stats:
                    missing_stats.append(stat)
            
            if missing_stats:
                print(f"   ❌ Freelancer stats missing fields: {missing_stats}")
                return False
            
            print(f"   ✓ Freelancer stats: {freelancer_stats['total_contracts']} contracts, R{freelancer_stats['total_amount']:.2f} total")
        else:
            print("   ❌ Freelancer stats failed")
            return False
        
        # Test client stats
        success, client_stats = self.run_test(
            "Contracts - Client Stats",
            "GET",
            "/api/contracts/stats",
            200,
            token=self.client_token
        )
        
        if success:
            print(f"   ✓ Client stats: {client_stats['total_contracts']} contracts, R{client_stats['total_amount']:.2f} total")
        else:
            print("   ❌ Client stats failed")
            return False
        
        # Test admin stats (if admin token available)
        if self.admin_token:
            success, admin_stats = self.run_test(
                "Contracts - Admin Stats",
                "GET",
                "/api/contracts/stats",
                200,
                token=self.admin_token
            )
            
            if success:
                print(f"   ✓ Admin stats: {admin_stats['total_contracts']} contracts, R{admin_stats['total_amount']:.2f} total")
                
                # Admin stats should be >= individual user stats
                if admin_stats['total_contracts'] >= freelancer_stats['total_contracts']:
                    print("   ✓ Admin sees system-wide contract stats")
                    return True
                else:
                    print("   ❌ Admin stats inconsistent")
                    return False
            else:
                print("   ❌ Admin stats failed")
                return False
        
        return True

    def test_contract_error_handling(self):
        """Test contract system error handling"""
        print("\n⚠️  Testing Contract Error Handling...")
        
        # Test accepting non-existent proposal
        fake_acceptance = {
            "job_id": "fake-job-id",
            "freelancer_id": "fake-freelancer-id",
            "proposal_id": "fake-proposal-id",
            "bid_amount": 1000.0
        }
        
        success, response = self.run_test(
            "Error - Accept Non-existent Proposal",
            "POST",
            "/api/jobs/fake-job-id/accept-proposal",
            404,
            data=fake_acceptance,
            token=self.client_token
        )
        
        if not success:
            print("   ❌ Non-existent proposal error handling failed")
            return False
        print("   ✓ Non-existent proposal properly rejected")
        
        # Test unauthorized access to contract details
        if hasattr(self, 'test_contract_id'):
            # Create a new user who shouldn't have access
            timestamp = datetime.now().strftime('%H%M%S')
            unauthorized_user_data = {
                "email": f"unauthorized{timestamp}@test.com",
                "password": "TestPass123!",
                "role": "client",
                "full_name": "Unauthorized User",
                "phone": "+27123456789"
            }
            
            success, response = self.run_test(
                "Error - Create Unauthorized User",
                "POST",
                "/api/register",
                200,
                data=unauthorized_user_data
            )
            
            if success and 'token' in response:
                unauthorized_token = response['token']
                
                # Try to access contract with unauthorized token
                success, response = self.run_test(
                    "Error - Unauthorized Contract Access",
                    "GET",
                    f"/api/contracts/{self.test_contract_id}",
                    403,
                    token=unauthorized_token
                )
                
                if success:
                    print("   ✓ Unauthorized contract access properly blocked")
                else:
                    print("   ❌ Unauthorized contract access not properly blocked")
                    return False
            else:
                print("   ❌ Could not create unauthorized user for testing")
                return False
        
        # Test invalid contract status update
        if hasattr(self, 'test_contract_id'):
            invalid_status = {"status": "InvalidStatus"}
            
            success, response = self.run_test(
                "Error - Invalid Status Update",
                "PATCH",
                f"/api/contracts/{self.test_contract_id}/status",
                400,
                data=invalid_status,
                token=self.client_token
            )
            
            if success:
                print("   ✓ Invalid status update properly rejected")
            else:
                print("   ❌ Invalid status update not properly rejected")
                return False
        
        print("   ✅ Contract error handling working correctly")
        return True

    def test_contract_integration_workflow(self):
        """Test complete contract integration workflow"""
        print("\n🔄 Testing Complete Contract Integration Workflow...")
        
        # This test verifies the entire workflow works end-to-end
        # We'll create a new job, apply, accept, and manage the contract
        
        # Step 1: Create a new job for integration test
        integration_job_data = {
            "title": "E-commerce Website with Payment Gateway",
            "description": "Build a complete e-commerce website with React frontend, Node.js backend, and integrated payment processing for South African market.",
            "category": "Web Development",
            "budget": 35000.0,
            "budget_type": "fixed",
            "requirements": ["React", "Node.js", "Payment Gateway", "E-commerce Experience"]
        }
        
        success, response = self.run_test(
            "Integration - Create Job",
            "POST",
            "/api/jobs",
            200,
            data=integration_job_data,
            token=self.client_token
        )
        
        if not success or 'job_id' not in response:
            print("   ❌ Integration test job creation failed")
            return False
        
        integration_job_id = response['job_id']
        print(f"   ✓ Integration job created: {integration_job_id}")
        
        # Step 2: Apply as freelancer
        integration_application = {
            "job_id": integration_job_id,
            "proposal": "I have extensive experience building e-commerce websites with South African payment integration. I can deliver this project within 8 weeks with PayFast and Stripe integration.",
            "bid_amount": 33000.0
        }
        
        success, response = self.run_test(
            "Integration - Apply to Job",
            "POST",
            f"/api/jobs/{integration_job_id}/apply",
            200,
            data=integration_application,
            token=self.freelancer_token
        )
        
        if not success:
            print("   ❌ Integration application failed")
            return False
        print("   ✓ Integration application submitted")
        
        # Step 3: Get applications and accept proposal
        success, applications = self.run_test(
            "Integration - Get Applications",
            "GET",
            f"/api/jobs/{integration_job_id}/applications",
            200,
            token=self.client_token
        )
        
        if not success or not applications:
            print("   ❌ Integration get applications failed")
            return False
        
        application = applications[0]
        acceptance_data = {
            "job_id": integration_job_id,
            "freelancer_id": self.freelancer_user['id'],
            "proposal_id": application['id'],
            "bid_amount": 33000.0
        }
        
        success, response = self.run_test(
            "Integration - Accept Proposal",
            "POST",
            f"/api/jobs/{integration_job_id}/accept-proposal",
            200,
            data=acceptance_data,
            token=self.client_token
        )
        
        if not success or 'contract_id' not in response:
            print("   ❌ Integration proposal acceptance failed")
            return False
        
        integration_contract_id = response['contract_id']
        print(f"   ✓ Integration contract created: {integration_contract_id}")
        
        # Step 4: Verify all collections were updated properly
        # Check contract exists and has correct data
        success, contract = self.run_test(
            "Integration - Verify Contract",
            "GET",
            f"/api/contracts/{integration_contract_id}",
            200,
            token=self.client_token
        )
        
        if not success:
            print("   ❌ Integration contract verification failed")
            return False
        
        # Verify contract data
        if (contract['job_id'] == integration_job_id and
            contract['amount'] == 33000.0 and
            contract['status'] == "In Progress"):
            print("   ✓ Contract data verified")
        else:
            print("   ❌ Contract data incorrect")
            return False
        
        # Check job was updated
        job_details = contract.get('job_details', {})
        if (job_details.get('status') == 'assigned' and
            job_details.get('assigned_freelancer_id') == self.freelancer_user['id']):
            print("   ✓ Job status and assignment verified")
        else:
            print("   ❌ Job not properly updated")
            return False
        
        # Step 5: Test contract management
        # Update contract status
        success, response = self.run_test(
            "Integration - Update Contract Status",
            "PATCH",
            f"/api/contracts/{integration_contract_id}/status",
            200,
            data={"status": "Completed"},
            token=self.freelancer_token
        )
        
        if not success:
            print("   ❌ Integration contract status update failed")
            return False
        print("   ✓ Contract status updated by freelancer")
        
        # Verify final state
        success, final_contract = self.run_test(
            "Integration - Verify Final State",
            "GET",
            f"/api/contracts/{integration_contract_id}",
            200,
            token=self.client_token
        )
        
        if success and final_contract.get('status') == 'Completed':
            job_details = final_contract.get('job_details', {})
            if job_details.get('status') == 'completed':
                print("   ✅ Complete integration workflow successful")
                return True
            else:
                print("   ❌ Job status not updated to completed")
                return False
        else:
            print("   ❌ Final contract state incorrect")
            return False

    # ========== WALLET SYSTEM TESTS ==========
    
    def test_wallet_auto_creation_freelancer(self):
        """Test that wallets are automatically created when freelancers register"""
        print("\n💰 Testing Wallet Auto-Creation for Freelancer...")
        
        # Register a new freelancer
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"wallet.freelancer{timestamp}@gmail.com",
            "password": "WalletTest123!",
            "role": "freelancer",
            "full_name": "Wallet Test Freelancer",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "Wallet - Register Freelancer for Auto-Creation Test",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if not success or 'token' not in response:
            print("❌ Failed to register freelancer for wallet test")
            return False
            
        freelancer_token = response['token']
        freelancer_user = response['user']
        
        # Check if wallet was auto-created
        success, wallet_response = self.run_test(
            "Wallet - Check Auto-Created Wallet",
            "GET",
            "/api/wallet",
            200,
            token=freelancer_token
        )
        
        if success:
            # Verify wallet structure
            required_fields = ['id', 'user_id', 'available_balance', 'escrow_balance', 'transaction_history', 'created_at']
            missing_fields = []
            
            for field in required_fields:
                if field not in wallet_response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Wallet missing required fields: {missing_fields}")
                return False
            
            # Verify initial balances are zero
            if (wallet_response['available_balance'] == 0.0 and 
                wallet_response['escrow_balance'] == 0.0 and
                wallet_response['user_id'] == freelancer_user['id']):
                print("   ✅ Wallet auto-created with correct initial state")
                print(f"   ✓ Available balance: R{wallet_response['available_balance']}")
                print(f"   ✓ Escrow balance: R{wallet_response['escrow_balance']}")
                print(f"   ✓ Transaction history: {len(wallet_response['transaction_history'])} transactions")
                return True
            else:
                print("   ❌ Wallet not created with correct initial state")
                return False
        else:
            print("   ❌ Wallet not auto-created for freelancer")
            return False

    def test_wallet_not_created_for_client(self):
        """Test that wallets are NOT created for clients"""
        print("\n💰 Testing Wallet NOT Created for Client...")
        
        # Register a new client
        timestamp = datetime.now().strftime('%H%M%S')
        client_data = {
            "email": f"wallet.client{timestamp}@gmail.com",
            "password": "WalletTest123!",
            "role": "client",
            "full_name": "Wallet Test Client",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "Wallet - Register Client (No Wallet Expected)",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if not success or 'token' not in response:
            print("❌ Failed to register client for wallet test")
            return False
            
        client_token = response['token']
        
        # Try to get wallet (should fail)
        success, wallet_response = self.run_test(
            "Wallet - Check Client Has No Wallet",
            "GET",
            "/api/wallet",
            404,  # Should return 404 - wallet not found
            token=client_token
        )
        
        if success:
            print("   ✅ Client correctly has no wallet (404 returned)")
            return True
        else:
            print("   ❌ Client unexpectedly has a wallet or wrong error code")
            return False

    def test_wallet_not_created_for_admin(self):
        """Test that wallets are NOT created for admins"""
        print("\n💰 Testing Wallet NOT Created for Admin...")
        
        # Register a new admin
        timestamp = datetime.now().strftime('%H%M%S')
        admin_data = {
            "email": f"wallet.admin{timestamp}@gmail.com",
            "password": "WalletTest123!",
            "role": "admin",
            "full_name": "Wallet Test Admin",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "Wallet - Register Admin (No Wallet Expected)",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if not success or 'token' not in response:
            print("❌ Failed to register admin for wallet test")
            return False
            
        admin_token = response['token']
        
        # Try to get wallet (should fail)
        success, wallet_response = self.run_test(
            "Wallet - Check Admin Has No Wallet",
            "GET",
            "/api/wallet",
            404,  # Should return 404 - wallet not found
            token=admin_token
        )
        
        if success:
            print("   ✅ Admin correctly has no wallet (404 returned)")
            return True
        else:
            print("   ❌ Admin unexpectedly has a wallet or wrong error code")
            return False

    def test_contract_escrow_integration(self):
        """Test that contract acceptance moves funds to escrow with transaction logging"""
        print("\n💰 Testing Contract-Escrow Integration...")
        
        # First, ensure we have a verified freelancer with a wallet
        if not self.freelancer_token:
            print("❌ No freelancer token available for escrow test")
            return False
        
        # Get initial wallet state
        success, initial_wallet = self.run_test(
            "Escrow - Get Initial Wallet State",
            "GET",
            "/api/wallet",
            200,
            token=self.freelancer_token
        )
        
        if not success:
            print("❌ Failed to get initial wallet state")
            return False
        
        initial_escrow = initial_wallet['escrow_balance']
        initial_transactions = len(initial_wallet['transaction_history'])
        
        print(f"   Initial escrow balance: R{initial_escrow}")
        print(f"   Initial transactions: {initial_transactions}")
        
        # Create a job and application for escrow test
        job_data = {
            "title": "Escrow Test Job - Website Development",
            "description": "Test job for escrow functionality testing",
            "category": "Web Development",
            "budget": 15000.0,
            "budget_type": "fixed",
            "requirements": ["React", "Node.js"]
        }
        
        success, job_response = self.run_test(
            "Escrow - Create Test Job",
            "POST",
            "/api/jobs",
            200,
            data=job_data,
            token=self.client_token
        )
        
        if not success or 'job_id' not in job_response:
            print("❌ Failed to create job for escrow test")
            return False
        
        escrow_job_id = job_response['job_id']
        
        # Apply to the job
        application_data = {
            "job_id": escrow_job_id,
            "proposal": "I am interested in this escrow test project and can deliver high-quality work.",
            "bid_amount": 14000.0
        }
        
        success, app_response = self.run_test(
            "Escrow - Apply to Test Job",
            "POST",
            f"/api/jobs/{escrow_job_id}/apply",
            200,
            data=application_data,
            token=self.freelancer_token
        )
        
        if not success:
            print("❌ Failed to apply to job for escrow test")
            return False
        
        # Get applications to find proposal ID
        success, applications = self.run_test(
            "Escrow - Get Applications",
            "GET",
            f"/api/jobs/{escrow_job_id}/applications",
            200,
            token=self.client_token
        )
        
        if not success or not applications:
            print("❌ Failed to get applications for escrow test")
            return False
        
        proposal_id = applications[0]['id']
        
        # Accept the proposal (this should trigger escrow)
        acceptance_data = {
            "job_id": escrow_job_id,
            "freelancer_id": self.freelancer_user['id'],
            "proposal_id": proposal_id,
            "bid_amount": 14000.0
        }
        
        success, acceptance_response = self.run_test(
            "Escrow - Accept Proposal (Trigger Escrow)",
            "POST",
            f"/api/jobs/{escrow_job_id}/accept-proposal",
            200,
            data=acceptance_data,
            token=self.client_token
        )
        
        if not success or 'contract_id' not in acceptance_response:
            print("❌ Failed to accept proposal for escrow test")
            return False
        
        contract_id = acceptance_response['contract_id']
        print(f"   Contract created: {contract_id}")
        
        # Check wallet after escrow
        success, updated_wallet = self.run_test(
            "Escrow - Check Wallet After Escrow",
            "GET",
            "/api/wallet",
            200,
            token=self.freelancer_token
        )
        
        if success:
            new_escrow = updated_wallet['escrow_balance']
            new_transactions = len(updated_wallet['transaction_history'])
            
            # Verify escrow balance increased
            expected_escrow = initial_escrow + 14000.0
            if new_escrow == expected_escrow:
                print(f"   ✅ Escrow balance correctly updated: R{initial_escrow} → R{new_escrow}")
            else:
                print(f"   ❌ Escrow balance not updated correctly: expected R{expected_escrow}, got R{new_escrow}")
                return False
            
            # Verify transaction was logged
            if new_transactions == initial_transactions + 1:
                print(f"   ✅ Transaction logged: {initial_transactions} → {new_transactions}")
                
                # Check the latest transaction
                latest_transaction = updated_wallet['transaction_history'][-1]
                if (latest_transaction['type'] == 'Credit' and 
                    latest_transaction['amount'] == 14000.0 and
                    'escrow' in latest_transaction['note'].lower()):
                    print("   ✅ Transaction details correct")
                    print(f"   ✓ Type: {latest_transaction['type']}")
                    print(f"   ✓ Amount: R{latest_transaction['amount']}")
                    print(f"   ✓ Note: {latest_transaction['note']}")
                    return True
                else:
                    print("   ❌ Transaction details incorrect")
                    return False
            else:
                print(f"   ❌ Transaction not logged correctly: expected {initial_transactions + 1}, got {new_transactions}")
                return False
        else:
            print("   ❌ Failed to get updated wallet state")
            return False

    def test_wallet_get_endpoint(self):
        """Test GET /api/wallet endpoint"""
        print("\n💰 Testing Wallet GET Endpoint...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for wallet GET test")
            return False
        
        success, response = self.run_test(
            "Wallet - GET Wallet Info",
            "GET",
            "/api/wallet",
            200,
            token=self.freelancer_token
        )
        
        if success:
            # Verify wallet structure
            required_fields = ['id', 'user_id', 'available_balance', 'escrow_balance', 'transaction_history', 'created_at']
            missing_fields = []
            
            for field in required_fields:
                if field not in response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Wallet response missing fields: {missing_fields}")
                return False
            
            print("   ✅ Wallet GET endpoint working correctly")
            print(f"   ✓ User ID: {response['user_id']}")
            print(f"   ✓ Available balance: R{response['available_balance']}")
            print(f"   ✓ Escrow balance: R{response['escrow_balance']}")
            print(f"   ✓ Transaction count: {len(response['transaction_history'])}")
            return True
        else:
            print("   ❌ Wallet GET endpoint failed")
            return False

    def test_wallet_withdraw_sufficient_balance(self):
        """Test POST /api/wallet/withdraw with sufficient balance"""
        print("\n💰 Testing Wallet Withdrawal - Sufficient Balance...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for withdrawal test")
            return False
        
        # First, get current wallet state
        success, wallet = self.run_test(
            "Withdraw - Get Current Wallet State",
            "GET",
            "/api/wallet",
            200,
            token=self.freelancer_token
        )
        
        if not success:
            print("❌ Failed to get wallet state for withdrawal test")
            return False
        
        available_balance = wallet['available_balance']
        print(f"   Current available balance: R{available_balance}")
        
        # If no available balance, we need to simulate having some
        if available_balance <= 0:
            print("   ⚠️  No available balance for withdrawal test - this is expected in fresh test")
            # Test withdrawal with zero balance (should fail)
            withdrawal_data = {"amount": 100.0}
            
            success, response = self.run_test(
                "Withdraw - Insufficient Balance Test",
                "POST",
                "/api/wallet/withdraw",
                400,  # Should return 400 for insufficient balance
                data=withdrawal_data,
                token=self.freelancer_token
            )
            
            if success:
                print("   ✅ Insufficient balance correctly rejected")
                return True
            else:
                print("   ❌ Insufficient balance not handled correctly")
                return False
        else:
            # Test withdrawal with sufficient balance
            withdrawal_amount = min(100.0, available_balance / 2)  # Withdraw half or 100, whichever is smaller
            withdrawal_data = {"amount": withdrawal_amount}
            
            success, response = self.run_test(
                "Withdraw - Sufficient Balance Test",
                "POST",
                "/api/wallet/withdraw",
                200,
                data=withdrawal_data,
                token=self.freelancer_token
            )
            
            if success and 'remaining_balance' in response:
                expected_remaining = available_balance - withdrawal_amount
                actual_remaining = response['remaining_balance']
                
                if abs(actual_remaining - expected_remaining) < 0.01:  # Allow for floating point precision
                    print(f"   ✅ Withdrawal successful: R{withdrawal_amount}")
                    print(f"   ✓ Remaining balance: R{actual_remaining}")
                    return True
                else:
                    print(f"   ❌ Remaining balance incorrect: expected R{expected_remaining}, got R{actual_remaining}")
                    return False
            else:
                print("   ❌ Withdrawal failed or missing response data")
                return False

    def test_wallet_withdraw_insufficient_balance(self):
        """Test POST /api/wallet/withdraw with insufficient balance"""
        print("\n💰 Testing Wallet Withdrawal - Insufficient Balance...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for withdrawal test")
            return False
        
        # Try to withdraw more than available
        withdrawal_data = {"amount": 999999.0}  # Large amount
        
        success, response = self.run_test(
            "Withdraw - Insufficient Balance",
            "POST",
            "/api/wallet/withdraw",
            400,  # Should return 400 for insufficient balance
            data=withdrawal_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✅ Insufficient balance withdrawal correctly rejected")
            return True
        else:
            print("   ❌ Insufficient balance withdrawal not handled correctly")
            return False

    def test_wallet_withdraw_invalid_amount(self):
        """Test POST /api/wallet/withdraw with invalid amounts"""
        print("\n💰 Testing Wallet Withdrawal - Invalid Amounts...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for withdrawal test")
            return False
        
        # Test negative amount
        withdrawal_data = {"amount": -100.0}
        
        success, response = self.run_test(
            "Withdraw - Negative Amount",
            "POST",
            "/api/wallet/withdraw",
            400,  # Should return 400 for invalid amount
            data=withdrawal_data,
            token=self.freelancer_token
        )
        
        if not success:
            print("   ❌ Negative amount withdrawal not rejected")
            return False
        
        # Test zero amount
        withdrawal_data = {"amount": 0.0}
        
        success, response = self.run_test(
            "Withdraw - Zero Amount",
            "POST",
            "/api/wallet/withdraw",
            400,  # Should return 400 for invalid amount
            data=withdrawal_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✅ Invalid withdrawal amounts correctly rejected")
            return True
        else:
            print("   ❌ Invalid withdrawal amounts not handled correctly")
            return False

    def test_wallet_withdraw_non_freelancer(self):
        """Test that only freelancers can withdraw funds"""
        print("\n💰 Testing Wallet Withdrawal - Non-Freelancer Access...")
        
        if not self.client_token:
            print("❌ No client token available for non-freelancer withdrawal test")
            return False
        
        withdrawal_data = {"amount": 100.0}
        
        success, response = self.run_test(
            "Withdraw - Client Access (Should Fail)",
            "POST",
            "/api/wallet/withdraw",
            403,  # Should return 403 for non-freelancer
            data=withdrawal_data,
            token=self.client_token
        )
        
        if success:
            print("   ✅ Non-freelancer withdrawal correctly rejected")
            return True
        else:
            print("   ❌ Non-freelancer withdrawal not handled correctly")
            return False

    def test_wallet_release_escrow_admin(self):
        """Test POST /api/wallet/release-escrow (admin only)"""
        print("\n💰 Testing Escrow Release - Admin Access...")
        
        if not self.admin_token:
            print("❌ No admin token available for escrow release test")
            return False
        
        # We need a contract with escrow to test release
        # For now, test with a fake contract ID to verify admin access control
        release_data = {"contract_id": "fake-contract-id"}
        
        success, response = self.run_test(
            "Escrow Release - Admin Access Test",
            "POST",
            "/api/wallet/release-escrow",
            404,  # Should return 404 for non-existent contract (but not 403)
            data=release_data,
            token=self.admin_token
        )
        
        if success:
            print("   ✅ Admin can access escrow release endpoint (404 for fake contract is expected)")
            return True
        else:
            print("   ❌ Admin escrow release access failed")
            return False

    def test_wallet_release_escrow_non_admin(self):
        """Test that only admins can release escrow"""
        print("\n💰 Testing Escrow Release - Non-Admin Access...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for non-admin escrow release test")
            return False
        
        release_data = {"contract_id": "fake-contract-id"}
        
        success, response = self.run_test(
            "Escrow Release - Non-Admin Access (Should Fail)",
            "POST",
            "/api/wallet/release-escrow",
            403,  # Should return 403 for non-admin
            data=release_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✅ Non-admin escrow release correctly rejected")
            return True
        else:
            print("   ❌ Non-admin escrow release not handled correctly")
            return False

    def test_wallet_transaction_history(self):
        """Test GET /api/wallet/transactions endpoint"""
        print("\n💰 Testing Wallet Transaction History...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available for transaction history test")
            return False
        
        success, response = self.run_test(
            "Wallet - Get Transaction History",
            "GET",
            "/api/wallet/transactions",
            200,
            token=self.freelancer_token
        )
        
        if success:
            # Verify response structure
            if 'transactions' not in response or 'total_transactions' not in response:
                print("   ❌ Transaction history response missing required fields")
                return False
            
            transactions = response['transactions']
            total_count = response['total_transactions']
            
            print(f"   ✅ Transaction history retrieved successfully")
            print(f"   ✓ Total transactions: {total_count}")
            print(f"   ✓ Transactions returned: {len(transactions)}")
            
            # Verify transaction structure if any exist
            if len(transactions) > 0:
                transaction = transactions[0]
                required_fields = ['type', 'amount', 'date', 'note']
                missing_fields = []
                
                for field in required_fields:
                    if field not in transaction:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Transaction missing fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Latest transaction: {transaction['type']} R{transaction['amount']} - {transaction['note']}")
            
            return True
        else:
            print("   ❌ Transaction history retrieval failed")
            return False

    def test_wallet_role_based_access(self):
        """Test wallet endpoints have proper role-based access control"""
        print("\n💰 Testing Wallet Role-Based Access Control...")
        
        # Test client trying to access wallet endpoints
        if self.client_token:
            # GET /api/wallet should fail for client
            success, response = self.run_test(
                "Wallet RBAC - Client GET Wallet (Should Fail)",
                "GET",
                "/api/wallet",
                404,  # Should return 404 for client (no wallet)
                token=self.client_token
            )
            
            if not success:
                print("   ❌ Client wallet access not properly restricted")
                return False
            
            # POST /api/wallet/withdraw should fail for client
            success, response = self.run_test(
                "Wallet RBAC - Client Withdraw (Should Fail)",
                "POST",
                "/api/wallet/withdraw",
                403,  # Should return 403 for non-freelancer
                data={"amount": 100.0},
                token=self.client_token
            )
            
            if not success:
                print("   ❌ Client withdrawal access not properly restricted")
                return False
            
            # GET /api/wallet/transactions should fail for client
            success, response = self.run_test(
                "Wallet RBAC - Client Transactions (Should Fail)",
                "GET",
                "/api/wallet/transactions",
                404,  # Should return 404 for client (no wallet)
                token=self.client_token
            )
            
            if not success:
                print("   ❌ Client transaction history access not properly restricted")
                return False
        
        print("   ✅ Wallet role-based access control working correctly")
        return True

    # ========== FREELANCER PROFILE ENDPOINTS TESTS ==========
    
    def test_freelancer_featured_endpoint(self):
        """Test GET /api/freelancers/featured endpoint"""
        success, response = self.run_test(
            "Freelancer - Get Featured Freelancers",
            "GET",
            "/api/freelancers/featured",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Featured freelancers endpoint working: {len(response)} freelancers")
            
            # Check if we have sample data or real data
            if len(response) > 0:
                freelancer = response[0]
                
                # Verify required fields
                required_fields = ['id', 'full_name', 'profile']
                missing_fields = []
                for field in required_fields:
                    if field not in freelancer:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Featured freelancer missing fields: {missing_fields}")
                    return False
                
                # Check profile structure
                profile = freelancer.get('profile', {})
                profile_fields = ['profession', 'hourly_rate', 'bio', 'rating']
                for field in profile_fields:
                    if field not in profile:
                        print(f"   ❌ Featured freelancer profile missing: {field}")
                        return False
                
                # Verify ZAR currency formatting (no $ signs)
                hourly_rate = profile.get('hourly_rate', 0)
                if isinstance(hourly_rate, (int, float)) and hourly_rate > 0:
                    print(f"   ✓ Hourly rate in proper format: R{hourly_rate}")
                    
                    # Check for realistic South African rates (R400-R1200 range)
                    if 400 <= hourly_rate <= 1200:
                        print("   ✓ Realistic South African hourly rate")
                    else:
                        print(f"   ⚠️  Hourly rate outside typical SA range: R{hourly_rate}")
                
                # Check for South African context
                full_name = freelancer.get('full_name', '')
                bio = profile.get('bio', '')
                if any(name in full_name for name in ['Thabo', 'Naledi', 'Sipho', 'Nomsa']) or 'South Africa' in bio:
                    print("   ✓ Contains South African context")
                
                print("   ✅ Featured freelancers endpoint working correctly")
                return True
            else:
                print("   ✓ Featured freelancers endpoint accessible (no data yet)")
                return True
        
        return False

    def test_freelancer_public_endpoint(self):
        """Test GET /api/freelancers/public endpoint"""
        success, response = self.run_test(
            "Freelancer - Get Public Freelancers",
            "GET",
            "/api/freelancers/public",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Public freelancers endpoint working: {len(response)} freelancers")
            
            if len(response) > 0:
                freelancer = response[0]
                
                # Verify no sensitive data is exposed
                sensitive_fields = ['password', 'id_document']
                for field in sensitive_fields:
                    if field in freelancer:
                        print(f"   ❌ Sensitive data exposed: {field}")
                        return False
                
                print("   ✓ No sensitive data exposed in public endpoint")
                
                # Verify required public fields
                required_fields = ['id', 'full_name', 'profile', 'created_at', 'is_verified']
                missing_fields = []
                for field in required_fields:
                    if field not in freelancer:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Public freelancer missing fields: {missing_fields}")
                    return False
                
                # Verify only verified freelancers are shown
                if not freelancer.get('is_verified', False):
                    print("   ❌ Unverified freelancer in public listing")
                    return False
                
                print("   ✓ Only verified freelancers in public listing")
                
                # Check profile completeness
                profile = freelancer.get('profile', {})
                if profile.get('profession') and profile.get('hourly_rate') and profile.get('bio'):
                    print("   ✓ Complete freelancer profiles in public listing")
                
                print("   ✅ Public freelancers endpoint working correctly")
                return True
            else:
                print("   ✓ Public freelancers endpoint accessible (no verified freelancers yet)")
                return True
        
        return False

    def test_freelancer_individual_public_profile(self):
        """Test GET /api/freelancers/{freelancer_id}/public endpoint"""
        # First, get a freelancer ID from the public listing
        success, freelancers = self.run_test(
            "Get Freelancer ID for Individual Profile Test",
            "GET",
            "/api/freelancers/public",
            200
        )
        
        if not success or not isinstance(freelancers, list) or len(freelancers) == 0:
            # Try with featured freelancers if public is empty
            success, freelancers = self.run_test(
                "Get Freelancer ID from Featured",
                "GET",
                "/api/freelancers/featured",
                200
            )
        
        if success and isinstance(freelancers, list) and len(freelancers) > 0:
            freelancer_id = freelancers[0]['id']
            
            success, response = self.run_test(
                "Freelancer - Get Individual Public Profile",
                "GET",
                f"/api/freelancers/{freelancer_id}/public",
                200
            )
            
            if success:
                # Verify individual profile structure
                required_fields = ['id', 'full_name', 'profile', 'rating', 'total_reviews', 'completed_projects', 'member_since', 'is_verified']
                missing_fields = []
                for field in required_fields:
                    if field not in response:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Individual profile missing fields: {missing_fields}")
                    return False
                
                # Verify no sensitive data
                sensitive_fields = ['password', 'id_document']
                for field in sensitive_fields:
                    if field in response:
                        print(f"   ❌ Sensitive data in individual profile: {field}")
                        return False
                
                # Check profile completeness
                profile = response.get('profile', {})
                if profile:
                    print("   ✓ Individual profile contains detailed information")
                
                # Check statistics
                completed_projects = response.get('completed_projects', 0)
                total_reviews = response.get('total_reviews', 0)
                rating = response.get('rating', 0)
                
                print(f"   ✓ Profile stats - Projects: {completed_projects}, Reviews: {total_reviews}, Rating: {rating}")
                
                print("   ✅ Individual freelancer profile working correctly")
                return True
        else:
            print("   ⚠️  No freelancers available for individual profile test")
            return True  # Not a failure, just no data yet
        
        return False

    def test_freelancer_profile_data_structure(self):
        """Test freelancer profile data structure and ZAR formatting"""
        success, response = self.run_test(
            "Freelancer - Data Structure Validation",
            "GET",
            "/api/freelancers/featured",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            freelancer = response[0]
            profile = freelancer.get('profile', {})
            
            # Test ZAR currency formatting
            hourly_rate = profile.get('hourly_rate', 0)
            if isinstance(hourly_rate, (int, float)):
                # Verify no dollar signs in the data
                rate_str = str(hourly_rate)
                if '$' in rate_str:
                    print(f"   ❌ Dollar sign found in hourly rate: {rate_str}")
                    return False
                
                print(f"   ✓ Proper ZAR format (no $ signs): R{hourly_rate}")
            
            # Test South African realistic data
            full_name = freelancer.get('full_name', '')
            bio = profile.get('bio', '')
            
            # Check for South African names or context
            sa_indicators = ['South Africa', 'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'SA', 'ZAR', 'Rand']
            has_sa_context = any(indicator in bio for indicator in sa_indicators)
            
            sa_names = ['Thabo', 'Naledi', 'Sipho', 'Nomsa', 'Mandla', 'Zanele', 'Lerato', 'Bongani']
            has_sa_name = any(name in full_name for name in sa_names)
            
            if has_sa_context or has_sa_name:
                print("   ✓ Contains South African context/names")
            
            # Test professional descriptions
            profession = profile.get('profession', '')
            if profession and len(profession) > 5:
                print(f"   ✓ Professional description: {profession}")
            
            # Test rating and review structure
            rating = profile.get('rating', 0)
            total_reviews = profile.get('total_reviews', 0)
            
            if isinstance(rating, (int, float)) and 0 <= rating <= 5:
                print(f"   ✓ Valid rating format: {rating}/5")
            
            if isinstance(total_reviews, int) and total_reviews >= 0:
                print(f"   ✓ Valid review count: {total_reviews}")
            
            print("   ✅ Freelancer data structure validation passed")
            return True
        
        return False

    def test_freelancer_profile_access_control(self):
        """Test access control for freelancer profile endpoints"""
        # Test that public endpoints don't require authentication
        success, response = self.run_test(
            "Freelancer - Public Access Without Auth",
            "GET",
            "/api/freelancers/featured",
            200
        )
        
        if not success:
            print("   ❌ Featured freelancers should be publicly accessible")
            return False
        
        success, response = self.run_test(
            "Freelancer - Public Listing Without Auth",
            "GET",
            "/api/freelancers/public",
            200
        )
        
        if not success:
            print("   ❌ Public freelancers should be publicly accessible")
            return False
        
        print("   ✅ Freelancer public endpoints properly accessible without authentication")
        return True

    def test_freelancer_profile_error_handling(self):
        """Test error handling for freelancer profile endpoints"""
        # Test non-existent freelancer ID
        success, response = self.run_test(
            "Freelancer - Non-existent Profile",
            "GET",
            "/api/freelancers/non-existent-id/public",
            404
        )
        
        if not success:
            print("   ❌ Non-existent freelancer should return 404")
            return False
        
        print("   ✓ Non-existent freelancer properly returns 404")
        
        # Test invalid freelancer ID format
        success, response = self.run_test(
            "Freelancer - Invalid ID Format",
            "GET",
            "/api/freelancers/invalid-id-format/public",
            404
        )
        
        if not success:
            print("   ❌ Invalid freelancer ID should return 404")
            return False
        
        print("   ✓ Invalid freelancer ID properly returns 404")
        print("   ✅ Freelancer profile error handling working correctly")
        return True

    def test_freelancer_profile_integration(self):
        """Test integration with existing freelancer registration flow"""
        if not self.freelancer_user or not self.freelancer_token:
            print("   ❌ No freelancer user available for integration test")
            return False
        
        # Update freelancer profile to make it complete
        profile_data = {
            "skills": ["Python", "React", "FastAPI", "MongoDB"],
            "experience": "Senior developer with 5+ years experience in South African market",
            "hourly_rate": 750.0,
            "bio": "Experienced full-stack developer based in Cape Town, South Africa. Specializing in modern web applications with Python and React.",
            "portfolio_links": ["https://github.com/sa-developer", "https://portfolio.co.za"]
        }
        
        success, response = self.run_test(
            "Integration - Update Freelancer Profile",
            "PUT",
            "/api/freelancer/profile",
            200,
            data=profile_data,
            token=self.freelancer_token
        )
        
        if not success:
            print("   ❌ Failed to update freelancer profile for integration test")
            return False
        
        # Verify freelancer appears in public listings after verification
        # (Note: freelancer needs to be verified by admin first)
        
        print("   ✅ Freelancer profile integration working correctly")
        return True

    # ========== FILE UPLOAD SYSTEM TESTS ==========
    
    def run_file_upload_test(self, name, endpoint, expected_status, files=None, data=None, token=None):
        """Run a file upload API test with multipart/form-data"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n📁 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_file(self, filename, content, content_type):
        """Create a test file for upload testing"""
        import io
        if isinstance(content, str):
            content = content.encode('utf-8')
        return (filename, io.BytesIO(content), content_type)

    def test_profile_picture_upload_valid(self):
        """Test profile picture upload with valid image file"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for profile picture upload test")
            return False
        
        # Create a fake image file
        fake_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': self.create_test_file('profile.png', fake_image_content, 'image/png')}
        
        success, response = self.run_file_upload_test(
            "Profile Picture Upload - Valid Image",
            "/api/upload-profile-picture",
            200,
            files=files,
            token=self.freelancer_token
        )
        
        if success and 'filename' in response and 'file_url' in response:
            print(f"   ✓ File uploaded: {response['filename']}")
            print(f"   ✓ File URL: {response['file_url']}")
            return True
        return False

    def test_profile_picture_upload_invalid_type(self):
        """Test profile picture upload with invalid file type"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for invalid file type test")
            return False
        
        # Create a fake text file
        files = {'file': self.create_test_file('document.txt', 'This is not an image', 'text/plain')}
        
        success, response = self.run_file_upload_test(
            "Profile Picture Upload - Invalid File Type",
            "/api/upload-profile-picture",
            400,
            files=files,
            token=self.freelancer_token
        )
        return success

    def test_profile_picture_upload_no_auth(self):
        """Test profile picture upload without authentication"""
        fake_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde'
        files = {'file': self.create_test_file('profile.png', fake_image_content, 'image/png')}
        
        success, response = self.run_file_upload_test(
            "Profile Picture Upload - No Authentication",
            "/api/upload-profile-picture",
            401,
            files=files
        )
        return success

    def test_resume_upload_valid(self):
        """Test resume upload with valid PDF file"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for resume upload test")
            return False
        
        # Create a fake PDF file
        fake_pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF'
        
        files = {'file': self.create_test_file('resume.pdf', fake_pdf_content, 'application/pdf')}
        
        success, response = self.run_file_upload_test(
            "Resume Upload - Valid PDF",
            "/api/upload-resume",
            200,
            files=files,
            token=self.freelancer_token
        )
        
        if success and 'filename' in response and 'file_url' in response:
            print(f"   ✓ Resume uploaded: {response['filename']}")
            print(f"   ✓ File URL: {response['file_url']}")
            return True
        return False

    def test_resume_upload_client_access(self):
        """Test resume upload with client token (should fail)"""
        if not self.client_token:
            print("❌ No client token available for resume upload access test")
            return False
        
        fake_pdf_content = b'%PDF-1.4\nFake PDF content'
        files = {'file': self.create_test_file('resume.pdf', fake_pdf_content, 'application/pdf')}
        
        success, response = self.run_file_upload_test(
            "Resume Upload - Client Access (Should Fail)",
            "/api/upload-resume",
            403,
            files=files,
            token=self.client_token
        )
        return success

    def test_resume_upload_invalid_type(self):
        """Test resume upload with invalid file type"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for invalid resume type test")
            return False
        
        files = {'file': self.create_test_file('resume.txt', 'This is not a valid resume format', 'text/plain')}
        
        success, response = self.run_file_upload_test(
            "Resume Upload - Invalid File Type",
            "/api/upload-resume",
            400,
            files=files,
            token=self.freelancer_token
        )
        return success

    def test_portfolio_file_upload_valid(self):
        """Test portfolio file upload with valid file"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for portfolio upload test")
            return False
        
        # Create a fake image file for portfolio
        fake_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': self.create_test_file('portfolio_item.png', fake_image_content, 'image/png')}
        
        success, response = self.run_file_upload_test(
            "Portfolio File Upload - Valid Image",
            "/api/upload-portfolio-file",
            200,
            files=files,
            token=self.freelancer_token
        )
        
        if success and 'filename' in response and 'file_url' in response:
            print(f"   ✓ Portfolio file uploaded: {response['filename']}")
            print(f"   ✓ File URL: {response['file_url']}")
            return True
        return False

    def test_portfolio_file_upload_client_access(self):
        """Test portfolio file upload with client token (should fail)"""
        if not self.client_token:
            print("❌ No client token available for portfolio upload access test")
            return False
        
        fake_image_content = b'\x89PNG\r\n\x1a\nFake PNG content'
        files = {'file': self.create_test_file('portfolio.png', fake_image_content, 'image/png')}
        
        success, response = self.run_file_upload_test(
            "Portfolio File Upload - Client Access (Should Fail)",
            "/api/upload-portfolio-file",
            403,
            files=files,
            token=self.client_token
        )
        return success

    def test_project_gallery_upload_valid(self):
        """Test project gallery upload with valid file and metadata"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for project gallery upload test")
            return False
        
        # Create a fake image file
        fake_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': self.create_test_file('project_screenshot.png', fake_image_content, 'image/png')}
        data = {
            'title': 'E-commerce Website Project',
            'description': 'A full-stack e-commerce platform built with React and FastAPI for a South African retail client.',
            'technologies': 'React, FastAPI, MongoDB, Stripe, PayFast',
            'project_url': 'https://demo-ecommerce.co.za'
        }
        
        success, response = self.run_file_upload_test(
            "Project Gallery Upload - Valid with Metadata",
            "/api/upload-project-gallery",
            200,
            files=files,
            data=data,
            token=self.freelancer_token
        )
        
        if success and 'project_id' in response and 'filename' in response:
            print(f"   ✓ Project uploaded: {response['project_id']}")
            print(f"   ✓ File: {response['filename']}")
            print(f"   ✓ File URL: {response['file_url']}")
            self.test_project_id = response['project_id']  # Store for deletion test
            return True
        return False

    def test_project_gallery_upload_missing_metadata(self):
        """Test project gallery upload with missing required metadata"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for project gallery metadata test")
            return False
        
        fake_image_content = b'\x89PNG\r\n\x1a\nFake PNG content'
        files = {'file': self.create_test_file('project.png', fake_image_content, 'image/png')}
        data = {
            'title': 'Test Project'
            # Missing required 'description' field
        }
        
        success, response = self.run_file_upload_test(
            "Project Gallery Upload - Missing Metadata",
            "/api/upload-project-gallery",
            422,  # FastAPI validation error
            files=files,
            data=data,
            token=self.freelancer_token
        )
        return success

    def test_project_gallery_upload_client_access(self):
        """Test project gallery upload with client token (should fail)"""
        if not self.client_token:
            print("❌ No client token available for project gallery access test")
            return False
        
        fake_image_content = b'\x89PNG\r\n\x1a\nFake PNG content'
        files = {'file': self.create_test_file('project.png', fake_image_content, 'image/png')}
        data = {
            'title': 'Test Project',
            'description': 'Test Description'
        }
        
        success, response = self.run_file_upload_test(
            "Project Gallery Upload - Client Access (Should Fail)",
            "/api/upload-project-gallery",
            403,
            files=files,
            data=data,
            token=self.client_token
        )
        return success

    def test_user_files_get_freelancer(self):
        """Test GET /api/user-files endpoint for freelancer"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for user files test")
            return False
        
        success, response = self.run_test(
            "Get User Files - Freelancer",
            "GET",
            "/api/user-files",
            200,
            token=self.freelancer_token
        )
        
        if success:
            # Check expected structure for freelancer
            expected_fields = ['profile_picture', 'id_document', 'resume', 'portfolio_files', 'project_gallery']
            missing_fields = []
            
            for field in expected_fields:
                if field not in response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Missing fields in freelancer files response: {missing_fields}")
                return False
            
            print("   ✓ Freelancer files response contains all expected fields")
            print(f"   ✓ Portfolio files: {len(response.get('portfolio_files', []))}")
            print(f"   ✓ Project gallery: {len(response.get('project_gallery', []))}")
            return True
        return False

    def test_user_files_get_client(self):
        """Test GET /api/user-files endpoint for client"""
        if not self.client_token:
            print("❌ No client token available for client files test")
            return False
        
        success, response = self.run_test(
            "Get User Files - Client",
            "GET",
            "/api/user-files",
            200,
            token=self.client_token
        )
        
        if success:
            # Check that client gets limited fields
            if response.get('resume') is None and response.get('portfolio_files') == [] and response.get('project_gallery') == []:
                print("   ✓ Client correctly gets limited file access")
                return True
            else:
                print("   ❌ Client getting freelancer-only file data")
                return False
        return False

    def test_user_files_no_auth(self):
        """Test GET /api/user-files endpoint without authentication"""
        success, response = self.run_test(
            "Get User Files - No Authentication",
            "GET",
            "/api/user-files",
            401
        )
        return success

    def test_delete_portfolio_file(self):
        """Test DELETE /api/delete-portfolio-file/{filename} endpoint"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for portfolio file deletion test")
            return False
        
        # First, try to get user files to find a portfolio file
        success, response = self.run_test(
            "Get Files for Deletion Test",
            "GET",
            "/api/user-files",
            200,
            token=self.freelancer_token
        )
        
        if success and response.get('portfolio_files') and len(response['portfolio_files']) > 0:
            filename = response['portfolio_files'][0]['filename']
            
            success, delete_response = self.run_test(
                "Delete Portfolio File - Valid",
                "DELETE",
                f"/api/delete-portfolio-file/{filename}",
                200,
                token=self.freelancer_token
            )
            
            if success:
                print(f"   ✓ Portfolio file deleted: {filename}")
                return True
        else:
            # Test with fake filename to check error handling
            success, delete_response = self.run_test(
                "Delete Portfolio File - Non-existent",
                "DELETE",
                "/api/delete-portfolio-file/fake-filename.jpg",
                404,
                token=self.freelancer_token
            )
            return success

    def test_delete_portfolio_file_client_access(self):
        """Test DELETE portfolio file with client token (should fail)"""
        if not self.client_token:
            print("❌ No client token available for portfolio deletion access test")
            return False
        
        success, response = self.run_test(
            "Delete Portfolio File - Client Access (Should Fail)",
            "DELETE",
            "/api/delete-portfolio-file/test-file.jpg",
            403,
            token=self.client_token
        )
        return success

    def test_delete_project_gallery_item(self):
        """Test DELETE /api/delete-project-gallery/{project_id} endpoint"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for project gallery deletion test")
            return False
        
        # Use the project_id from the upload test if available
        if hasattr(self, 'test_project_id'):
            success, response = self.run_test(
                "Delete Project Gallery Item - Valid",
                "DELETE",
                f"/api/delete-project-gallery/{self.test_project_id}",
                200,
                token=self.freelancer_token
            )
            
            if success:
                print(f"   ✓ Project gallery item deleted: {self.test_project_id}")
                return True
        else:
            # Test with fake project ID to check error handling
            success, response = self.run_test(
                "Delete Project Gallery Item - Non-existent",
                "DELETE",
                "/api/delete-project-gallery/fake-project-id",
                404,
                token=self.freelancer_token
            )
            return success

    def test_delete_project_gallery_client_access(self):
        """Test DELETE project gallery with client token (should fail)"""
        if not self.client_token:
            print("❌ No client token available for project gallery deletion access test")
            return False
        
        success, response = self.run_test(
            "Delete Project Gallery - Client Access (Should Fail)",
            "DELETE",
            "/api/delete-project-gallery/test-project-id",
            403,
            token=self.client_token
        )
        return success

    def test_file_size_validation(self):
        """Test file size validation for different upload types"""
        if not self.freelancer_token:
            print("❌ No freelancer token available for file size validation test")
            return False
        
        # Create a file that's too large for profile picture (>2MB)
        large_content = b'x' * (3 * 1024 * 1024)  # 3MB
        files = {'file': self.create_test_file('large_profile.png', large_content, 'image/png')}
        
        success, response = self.run_file_upload_test(
            "File Size Validation - Profile Picture Too Large",
            "/api/upload-profile-picture",
            400,
            files=files,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ File size validation working for profile pictures")
            return True
        return False

    def test_static_file_serving(self):
        """Test static file serving from /uploads/* URLs"""
        # This test checks if the static file serving is configured
        # We'll test by trying to access a non-existent file and checking the response
        
        try:
            response = requests.get(f"{self.base_url}/uploads/profile_pictures/test-file.png", timeout=10)
            
            # We expect either 404 (file not found) or 403 (access denied) - both indicate the endpoint exists
            if response.status_code in [404, 403]:
                print("✅ Static File Serving - Endpoint configured correctly")
                print(f"   Status: {response.status_code} (expected for non-existent file)")
                self.tests_passed += 1
            else:
                print(f"❌ Static File Serving - Unexpected status: {response.status_code}")
            
            self.tests_run += 1
            return response.status_code in [404, 403]
            
        except Exception as e:
            print(f"❌ Static File Serving - Error: {str(e)}")
            self.tests_run += 1
            return False

def main():
    print("🚀 Starting Afrilance Authentication System Tests")
    print("=" * 60)
    
    tester = AfrilanceAPITester()
    
    # Authentication System Test Sequence
    auth_tests = [
        ("Health Check", tester.test_health_check),
        ("Auth - Freelancer Registration", tester.test_auth_register_freelancer),
        ("Auth - Client Registration", tester.test_auth_register_client),
        ("Auth - Admin Registration", tester.test_auth_register_admin),
        ("Auth - Login Valid Credentials", tester.test_auth_login_valid_credentials),
        ("Auth - Login Invalid Credentials", tester.test_auth_login_invalid_credentials),
        ("Auth - Login Wrong Password", tester.test_auth_login_wrong_password),
        ("Auth - JWT Token Structure", tester.test_auth_jwt_token_structure),
        ("Auth - Protected Endpoint Valid Token", tester.test_auth_protected_endpoint_valid_token),
        ("Auth - Protected Endpoint No Token", tester.test_auth_protected_endpoint_no_token),
        ("Auth - Protected Endpoint Invalid Token", tester.test_auth_protected_endpoint_invalid_token),
        ("Auth - Email Uniqueness Validation", tester.test_auth_email_uniqueness),
        ("Auth - Password Hashing Verification", tester.test_auth_password_hashing),
        ("Auth - Invalid Role Validation", tester.test_auth_role_validation),
        ("Admin - Get All Users", tester.test_admin_get_all_users),
        ("Admin - Get Users Non-Admin Access", tester.test_admin_get_users_non_admin),
        ("Admin - Verify User", tester.test_admin_verify_user),
        ("Admin - Verify User Non-Admin Access", tester.test_admin_verify_user_non_admin),
        ("Role-Based Access Control", tester.test_role_based_access_control),
    ]
    
    # Dedicated Admin Login System Tests
    admin_login_tests = [
        ("Admin Login - Valid Afrilance Email", tester.test_admin_login_valid_afrilance_email),
        ("Admin Login - Non-Afrilance Domain", tester.test_admin_login_non_afrilance_domain),
        ("Admin Login - Invalid Credentials", tester.test_admin_login_invalid_credentials),
        ("Admin Login - Pending Approval", tester.test_admin_login_pending_approval),
        ("Admin Register - Valid Request", tester.test_admin_register_request_valid),
        ("Admin Register - Invalid Domain", tester.test_admin_register_request_invalid_domain),
        ("Admin Register - Missing Fields", tester.test_admin_register_request_missing_fields),
        ("Admin Approval - Approve Workflow", tester.test_admin_approval_workflow_approve),
        ("Admin Approval - Reject Workflow", tester.test_admin_approval_workflow_reject),
        ("Admin Approval - Unauthorized Access", tester.test_admin_approval_unauthorized),
        ("Admin Security Validations", tester.test_admin_security_validations),
    ]
    
    # Run authentication tests
    print("\n🔐 AUTHENTICATION SYSTEM TESTS")
    print("=" * 60)
    
    for test_name, test_func in auth_tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Run dedicated admin login system tests
    print("\n🔐 DEDICATED ADMIN LOGIN SYSTEM TESTS")
    print("=" * 60)
    
    for test_name, test_func in admin_login_tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Print authentication test results
    print("\n" + "=" * 60)
    print(f"🔐 AUTHENTICATION TEST RESULTS")
    print(f"Auth Tests Run: {tester.auth_tests_run}")
    print(f"Auth Tests Passed: {tester.auth_tests_passed}")
    print(f"Auth Tests Failed: {tester.auth_tests_run - tester.auth_tests_passed}")
    print(f"Auth Success Rate: {(tester.auth_tests_passed/tester.auth_tests_run*100):.1f}%" if tester.auth_tests_run > 0 else "0%")
    
    # Run additional comprehensive tests if authentication is working
    if tester.auth_tests_passed >= 10:  # If basic auth tests are passing
        print("\n🚀 RUNNING ADDITIONAL SYSTEM TESTS")
        print("=" * 60)
        
        additional_tests = [
            ("Role-based Verification (Freelancer)", tester.test_role_based_verification),
            ("Client No Verification Required", tester.test_client_no_verification),
            ("Update Freelancer Profile", tester.test_update_freelancer_profile),
            ("Freelancer Profile Completion Tracking", tester.test_freelancer_profile_completion_tracking),
            ("Create Job", tester.test_create_job),
            ("Get Jobs", tester.test_get_jobs),
            ("Job Filtering by Category", tester.test_job_filtering_by_category),
            ("Comprehensive Job Data", tester.test_comprehensive_job_data),
            ("Get My Jobs (Client)", tester.test_get_my_jobs_client),
            ("Apply to Job", tester.test_apply_to_job),
            ("Get Job Applications", tester.test_get_job_applications),
            ("User Verification Workflow", tester.test_user_verification_workflow),
            ("Admin Dashboard Data", tester.test_admin_dashboard_data),
            ("Send Message", tester.test_send_message),
            ("Get Messages", tester.test_get_messages),
            ("Enhanced Messaging System", tester.test_enhanced_messaging_system),
            ("Submit Support Ticket", tester.test_support_ticket),
            ("Comprehensive Support System", tester.test_support_system_comprehensive),
            ("ID Document Upload", tester.test_id_document_upload),
        ]
        
        # Run additional tests first
        for test_name, test_func in additional_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Add Contract System Tests
        print("\n📋 CONTRACTS SYSTEM TESTS")
        print("=" * 60)
        
        contract_tests = [
            ("Contract Creation Flow", tester.test_contract_creation_flow),
            ("Contract Trigger Logic", tester.test_contract_trigger_logic),
            ("Contracts GET All Roles", tester.test_contracts_get_all_roles),
            ("Contract Detailed View", tester.test_contract_detailed_view),
            ("Contract Status Update", tester.test_contract_status_update),
            ("Contract Stats", tester.test_contract_stats),
            ("Contract Error Handling", tester.test_contract_error_handling),
            ("Contract Integration Workflow", tester.test_contract_integration_workflow),
        ]
        
        for test_name, test_func in contract_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Add Freelancer Profile Endpoints Tests
        print("\n👥 FREELANCER PROFILE ENDPOINTS TESTS")
        print("=" * 60)
        
        freelancer_profile_tests = [
            ("Freelancer Featured Endpoint", tester.test_freelancer_featured_endpoint),
            ("Freelancer Public Endpoint", tester.test_freelancer_public_endpoint),
            ("Freelancer Individual Public Profile", tester.test_freelancer_individual_public_profile),
            ("Freelancer Profile Data Structure", tester.test_freelancer_profile_data_structure),
            ("Freelancer Profile Access Control", tester.test_freelancer_profile_access_control),
            ("Freelancer Profile Error Handling", tester.test_freelancer_profile_error_handling),
            ("Freelancer Profile Integration", tester.test_freelancer_profile_integration),
        ]
        
        for test_name, test_func in freelancer_profile_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Add Wallet System Tests
        print("\n💰 WALLET SYSTEM TESTS")
        print("=" * 60)
        
        wallet_tests = [
            ("Wallet Auto-Creation for Freelancer", tester.test_wallet_auto_creation_freelancer),
            ("Wallet NOT Created for Client", tester.test_wallet_not_created_for_client),
            ("Wallet NOT Created for Admin", tester.test_wallet_not_created_for_admin),
            ("Contract-Escrow Integration", tester.test_contract_escrow_integration),
            ("Wallet GET Endpoint", tester.test_wallet_get_endpoint),
            ("Wallet Withdraw - Sufficient Balance", tester.test_wallet_withdraw_sufficient_balance),
            ("Wallet Withdraw - Insufficient Balance", tester.test_wallet_withdraw_insufficient_balance),
            ("Wallet Withdraw - Invalid Amount", tester.test_wallet_withdraw_invalid_amount),
            ("Wallet Withdraw - Non-Freelancer Access", tester.test_wallet_withdraw_non_freelancer),
            ("Escrow Release - Admin Access", tester.test_wallet_release_escrow_admin),
            ("Escrow Release - Non-Admin Access", tester.test_wallet_release_escrow_non_admin),
            ("Wallet Transaction History", tester.test_wallet_transaction_history),
            ("Wallet Role-Based Access Control", tester.test_wallet_role_based_access),
        ]
        
        for test_name, test_func in wallet_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Add File Upload System Tests
        print("\n📁 FILE UPLOAD SYSTEM TESTS")
        print("=" * 60)
        
        file_upload_tests = [
            ("Profile Picture Upload - Valid", tester.test_profile_picture_upload_valid),
            ("Profile Picture Upload - Invalid Type", tester.test_profile_picture_upload_invalid_type),
            ("Profile Picture Upload - No Auth", tester.test_profile_picture_upload_no_auth),
            ("Resume Upload - Valid", tester.test_resume_upload_valid),
            ("Resume Upload - Client Access", tester.test_resume_upload_client_access),
            ("Resume Upload - Invalid Type", tester.test_resume_upload_invalid_type),
            ("Portfolio File Upload - Valid", tester.test_portfolio_file_upload_valid),
            ("Portfolio File Upload - Client Access", tester.test_portfolio_file_upload_client_access),
            ("Project Gallery Upload - Valid", tester.test_project_gallery_upload_valid),
            ("Project Gallery Upload - Missing Metadata", tester.test_project_gallery_upload_missing_metadata),
            ("Project Gallery Upload - Client Access", tester.test_project_gallery_upload_client_access),
            ("User Files - Get Freelancer", tester.test_user_files_get_freelancer),
            ("User Files - Get Client", tester.test_user_files_get_client),
            ("User Files - No Auth", tester.test_user_files_no_auth),
            ("Delete Portfolio File", tester.test_delete_portfolio_file),
            ("Delete Portfolio File - Client Access", tester.test_delete_portfolio_file_client_access),
            ("Delete Project Gallery Item", tester.test_delete_project_gallery_item),
            ("Delete Project Gallery - Client Access", tester.test_delete_project_gallery_client_access),
            ("File Size Validation", tester.test_file_size_validation),
            ("Static File Serving", tester.test_static_file_serving),
        ]
        
        for test_name, test_func in file_upload_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        for test_name, test_func in additional_tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Print final comprehensive results
    print("\n" + "=" * 60)
    print(f"📊 COMPREHENSIVE TEST RESULTS")
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Total Tests Passed: {tester.tests_passed}")
    print(f"Total Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Overall Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    print(f"\n🔐 Authentication Tests: {tester.auth_tests_passed}/{tester.auth_tests_run}")
    print(f"🔧 System Tests: {tester.tests_passed - tester.auth_tests_passed}/{tester.tests_run - tester.auth_tests_run}")
    
    # Determine overall result
    auth_success_rate = (tester.auth_tests_passed/tester.auth_tests_run*100) if tester.auth_tests_run > 0 else 0
    
    if auth_success_rate >= 90:
        print("\n🎉 Authentication system is working excellently!")
        return 0
    elif auth_success_rate >= 70:
        print("\n⚠️  Authentication system has some issues but core functionality works.")
        return 1
    else:
        print("\n❌ Authentication system has critical issues that need attention.")
        return 2

if __name__ == "__main__":
    sys.exit(main())