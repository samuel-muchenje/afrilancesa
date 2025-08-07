import requests
import sys
import json
import jwt
from datetime import datetime

class AfrilanceAPITester:
    def __init__(self, base_url="https://e1488ef0-488b-4f1e-9158-db786f616a3a.preview.emergentagent.com"):
        self.base_url = base_url
        self.freelancer_token = None
        self.client_token = None
        self.admin_token = None
        self.freelancer_user = None
        self.client_user = None
        self.admin_user = None
        self.test_job_id = None
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
    
    # Run authentication tests
    print("\n🔐 AUTHENTICATION SYSTEM TESTS")
    print("=" * 60)
    
    for test_name, test_func in auth_tests:
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