import requests
import sys
import json
from datetime import datetime

class AfrilanceAPITester:
    def __init__(self, base_url="https://e1488ef0-488b-4f1e-9158-db786f616a3a.preview.emergentagent.com"):
        self.base_url = base_url
        self.freelancer_token = None
        self.client_token = None
        self.freelancer_user = None
        self.client_user = None
        self.test_job_id = None
        self.tests_run = 0
        self.tests_passed = 0

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
        """Test updating freelancer profile"""
        profile_data = {
            "skills": ["Python", "React", "Node.js"],
            "experience": "5 years of full-stack development",
            "hourly_rate": 500.0,
            "bio": "Experienced full-stack developer specializing in web applications",
            "portfolio_links": ["https://github.com/testuser", "https://portfolio.test.com"]
        }
        
        success, response = self.run_test(
            "Update Freelancer Profile",
            "PUT",
            "/api/freelancer/profile",
            200,
            data=profile_data,
            token=self.freelancer_token
        )
        return success

    def test_create_job(self):
        """Test job creation by client"""
        job_data = {
            "title": "Test Web Development Project",
            "description": "Need a full-stack developer to build a web application with React and Python backend",
            "category": "Web Development",
            "budget": 15000.0,
            "budget_type": "fixed",
            "requirements": ["React", "Python", "FastAPI", "MongoDB"]
        }
        
        success, response = self.run_test(
            "Create Job",
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
        """Test job application by freelancer"""
        if not self.test_job_id:
            print("❌ No job ID available for application test")
            return False
            
        application_data = {
            "job_id": self.test_job_id,
            "proposal": "I am an experienced full-stack developer with expertise in React and Python. I can deliver this project within the specified timeline and budget.",
            "bid_amount": 14000.0
        }
        
        success, response = self.run_test(
            "Apply to Job",
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

def main():
    print("🚀 Starting Afrilance API Tests")
    print("=" * 50)
    
    tester = AfrilanceAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Freelancer Registration", tester.test_freelancer_registration),
        ("Client Registration", tester.test_client_registration),
        ("Role-based Verification (Freelancer)", tester.test_role_based_verification),
        ("Client No Verification Required", tester.test_client_no_verification),
        ("Login", tester.test_login),
        ("Get Profile", tester.test_get_profile),
        ("ID Document Upload", tester.test_id_document_upload),
        ("Update Freelancer Profile", tester.test_update_freelancer_profile),
        ("Create Job", tester.test_create_job),
        ("Get Jobs", tester.test_get_jobs),
        ("Get My Jobs (Client)", tester.test_get_my_jobs_client),
        ("Apply to Job", tester.test_apply_to_job),
        ("Get Job Applications", tester.test_get_job_applications),
        ("Send Message", tester.test_send_message),
        ("Get Messages", tester.test_get_messages),
        ("Submit Support Ticket", tester.test_support_ticket),
        ("Duplicate Registration", tester.test_duplicate_registration),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())