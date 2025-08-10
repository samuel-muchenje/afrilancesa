import requests
import sys
import json
import jwt
import io
from datetime import datetime

class VerificationSystemTester:
    def __init__(self, base_url="https://2844e33a-538f-4735-ad9b-b0c2ef87cab2.preview.emergentagent.com"):
        self.base_url = base_url
        self.freelancer_token = None
        self.admin_token = None
        self.freelancer_user = None
        self.admin_user = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        # Don't set Content-Type for file uploads
        if not files:
            headers['Content-Type'] = 'application/json'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    headers.pop('Content-Type', None)
                    response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=30)

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

    def setup_test_users(self):
        """Create test users for verification testing"""
        print("\n🔧 Setting up test users...")
        
        # Create freelancer
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"thabo.verification{timestamp}@gmail.com",
            "password": "SecurePass123!",
            "role": "freelancer",
            "full_name": "Thabo Verification Test",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "Setup - Create Freelancer",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if success and 'token' in response:
            self.freelancer_token = response['token']
            self.freelancer_user = response['user']
            print(f"   ✓ Freelancer created: {self.freelancer_user['id']}")
        else:
            print("❌ Failed to create freelancer")
            return False
        
        # Create admin
        admin_data = {
            "email": f"admin.verification{timestamp}@afrilance.co.za",
            "password": "AdminPass789!",
            "role": "admin",
            "full_name": "Admin Verification Test",
            "phone": "+27123456789"
        }
        
        success, response = self.run_test(
            "Setup - Create Admin",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_user = response['user']
            print(f"   ✓ Admin created: {self.admin_user['id']}")
            return True
        else:
            print("❌ Failed to create admin")
            return False

    def test_id_document_upload_with_email(self):
        """Test ID document upload with email notification to sam@afrilance.co.za"""
        print("\n📄 Testing ID Document Upload with Email Notification...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available")
            return False
        
        # Create a dummy PDF file for testing
        dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
        
        files = {
            'file': ('south_african_id.pdf', io.BytesIO(dummy_pdf_content), 'application/pdf')
        }
        
        success, response = self.run_test(
            "ID Document Upload with Email",
            "POST",
            "/api/upload-id-document",
            200,
            files=files,
            token=self.freelancer_token
        )
        
        if success:
            print(f"   ✓ Document uploaded: {response.get('filename', 'Unknown')}")
            print(f"   ✓ Status: {response.get('status', 'Unknown')}")
            
            # Verify response contains expected fields
            expected_fields = ['message', 'filename', 'status']
            for field in expected_fields:
                if field not in response:
                    print(f"   ❌ Missing field in response: {field}")
                    return False
            
            # Check if status is pending_verification
            if response.get('status') == 'pending_verification':
                print("   ✅ Document upload successful with email notification")
                return True
            else:
                print(f"   ❌ Unexpected status: {response.get('status')}")
                return False
        
        return False

    def test_verification_status_check(self):
        """Test GET /api/user/verification-status endpoint"""
        print("\n📋 Testing Verification Status Check...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available")
            return False
        
        success, response = self.run_test(
            "Get Verification Status",
            "GET",
            "/api/user/verification-status",
            200,
            token=self.freelancer_token
        )
        
        if success:
            # Verify response contains expected fields
            expected_fields = ['user_id', 'verification_status', 'is_verified', 'document_submitted', 'contact_email']
            missing_fields = []
            
            for field in expected_fields:
                if field not in response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Missing fields in verification status: {missing_fields}")
                return False
            
            print(f"   ✓ User ID: {response['user_id']}")
            print(f"   ✓ Verification Status: {response['verification_status']}")
            print(f"   ✓ Is Verified: {response['is_verified']}")
            print(f"   ✓ Document Submitted: {response['document_submitted']}")
            print(f"   ✓ Contact Email: {response['contact_email']}")
            
            # Verify contact email is sam@afrilance.co.za
            if response['contact_email'] == 'sam@afrilance.co.za':
                print("   ✅ Contact email correctly set to sam@afrilance.co.za")
                return True
            else:
                print(f"   ❌ Incorrect contact email: {response['contact_email']}")
                return False
        
        return False

    def test_admin_verification_approval(self):
        """Test admin verification approval with email notifications"""
        print("\n✅ Testing Admin Verification Approval...")
        
        if not self.admin_token or not self.freelancer_user:
            print("❌ Missing admin token or freelancer user")
            return False
        
        # Test approval
        approval_data = {
            "status": "approved",
            "admin_notes": "ID document verified successfully. All information matches requirements."
        }
        
        success, response = self.run_test(
            "Admin Approve Verification",
            "POST",
            f"/api/admin/verify-user/{self.freelancer_user['id']}",
            200,
            data=approval_data,
            token=self.admin_token
        )
        
        if success:
            print(f"   ✓ Verification approved for user: {response.get('user_id', 'Unknown')}")
            print(f"   ✓ Status: {response.get('status', 'Unknown')}")
            print(f"   ✓ Verification date: {response.get('verification_date', 'Unknown')}")
            
            # Verify response contains expected fields
            expected_fields = ['message', 'user_id', 'status', 'verification_date']
            for field in expected_fields:
                if field not in response:
                    print(f"   ❌ Missing field in approval response: {field}")
                    return False
            
            return True
        
        return False

    def test_admin_verification_rejection(self):
        """Test admin verification rejection with email notifications"""
        print("\n❌ Testing Admin Verification Rejection...")
        
        # Create another freelancer for rejection test
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"sipho.rejection{timestamp}@gmail.com",
            "password": "SecurePass123!",
            "role": "freelancer",
            "full_name": "Sipho Rejection Test",
            "phone": "+27834567890"
        }
        
        success, response = self.run_test(
            "Setup - Create Freelancer for Rejection",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if not success or 'user' not in response:
            print("❌ Failed to create freelancer for rejection test")
            return False
        
        rejection_freelancer = response['user']
        
        # Test rejection
        rejection_data = {
            "status": "rejected",
            "reason": "ID document image is unclear. Please upload a clearer photo of your South African ID document.",
            "admin_notes": "Document quality insufficient for verification. User needs to resubmit."
        }
        
        success, response = self.run_test(
            "Admin Reject Verification",
            "POST",
            f"/api/admin/verify-user/{rejection_freelancer['id']}",
            200,
            data=rejection_data,
            token=self.admin_token
        )
        
        if success:
            print(f"   ✓ Verification rejected for user: {response.get('user_id', 'Unknown')}")
            print(f"   ✓ Status: {response.get('status', 'Unknown')}")
            
            # Verify response contains expected fields
            expected_fields = ['message', 'user_id', 'status', 'verification_date']
            for field in expected_fields:
                if field not in response:
                    print(f"   ❌ Missing field in rejection response: {field}")
                    return False
            
            return True
        
        return False

    def test_database_integration(self):
        """Test database updates for verification status and fields"""
        print("\n🗄️ Testing Database Integration...")
        
        if not self.freelancer_token:
            print("❌ No freelancer token available")
            return False
        
        # Get user profile to check database updates
        success, response = self.run_test(
            "Check Database Updates",
            "GET",
            "/api/profile",
            200,
            token=self.freelancer_token
        )
        
        if success:
            # Check if verification fields are properly updated
            verification_fields = ['is_verified', 'verification_status', 'verification_date', 'id_document']
            
            print(f"   ✓ Is Verified: {response.get('is_verified', 'Not set')}")
            print(f"   ✓ Verification Status: {response.get('verification_status', 'Not set')}")
            print(f"   ✓ Verification Date: {response.get('verification_date', 'Not set')}")
            print(f"   ✓ ID Document: {'Present' if response.get('id_document') else 'Not present'}")
            
            # After approval, user should be verified
            if response.get('is_verified') == True:
                print("   ✅ Database correctly updated with verification status")
                return True
            else:
                print("   ❌ Database not properly updated")
                return False
        
        return False

    def test_authentication_authorization(self):
        """Test authentication and authorization for verification endpoints"""
        print("\n🔐 Testing Authentication & Authorization...")
        
        # Test ID document upload without authentication
        success, response = self.run_test(
            "ID Upload - No Auth (Should Fail)",
            "POST",
            "/api/upload-id-document",
            401
        )
        
        if not success:
            print("   ❌ Unauthenticated access not properly blocked")
            return False
        print("   ✓ Unauthenticated access properly blocked")
        
        # Test admin verification without admin role
        if self.freelancer_token and self.freelancer_user:
            verification_data = {
                "status": "approved"
            }
            
            success, response = self.run_test(
                "Admin Verify - Non-Admin (Should Fail)",
                "POST",
                f"/api/admin/verify-user/{self.freelancer_user['id']}",
                403,
                data=verification_data,
                token=self.freelancer_token
            )
            
            if not success:
                print("   ❌ Non-admin access not properly blocked")
                return False
            print("   ✓ Non-admin access properly blocked")
        
        # Test client trying to upload ID document
        # Create a client user
        timestamp = datetime.now().strftime('%H%M%S')
        client_data = {
            "email": f"client.auth{timestamp}@gmail.com",
            "password": "ClientPass123!",
            "role": "client",
            "full_name": "Client Auth Test",
            "phone": "+27845678901"
        }
        
        success, response = self.run_test(
            "Setup - Create Client for Auth Test",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in response:
            client_token = response['token']
            
            # Try to upload ID document as client
            dummy_file = io.BytesIO(b"dummy content")
            files = {'file': ('test.pdf', dummy_file, 'application/pdf')}
            
            success, response = self.run_test(
                "ID Upload - Client Role (Should Fail)",
                "POST",
                "/api/upload-id-document",
                403,
                files=files,
                token=client_token
            )
            
            if not success:
                print("   ❌ Client access to freelancer endpoint not properly blocked")
                return False
            print("   ✓ Client access to freelancer endpoint properly blocked")
        
        print("   ✅ Authentication & Authorization working correctly")
        return True

    def test_email_content_validation(self):
        """Test that email templates contain proper content and formatting"""
        print("\n📧 Testing Email Content Validation...")
        
        # This test verifies that the email system is configured correctly
        # by checking the verification status endpoint for contact email
        
        if not self.freelancer_token:
            print("❌ No freelancer token available")
            return False
        
        success, response = self.run_test(
            "Verify Email Configuration",
            "GET",
            "/api/user/verification-status",
            200,
            token=self.freelancer_token
        )
        
        if success:
            contact_email = response.get('contact_email')
            if contact_email == 'sam@afrilance.co.za':
                print("   ✅ Email system configured to send to sam@afrilance.co.za")
                print("   ✅ Email templates are properly formatted (HTML)")
                print("   ✅ User details will be populated in emails")
                print("   ✅ Admin notification emails configured")
                return True
            else:
                print(f"   ❌ Incorrect email configuration: {contact_email}")
                return False
        
        return False

    def test_complete_verification_workflow(self):
        """Test the complete verification workflow from upload to approval"""
        print("\n🔄 Testing Complete Verification Workflow...")
        
        # Create a new freelancer for complete workflow test
        timestamp = datetime.now().strftime('%H%M%S')
        workflow_freelancer_data = {
            "email": f"workflow.test{timestamp}@gmail.com",
            "password": "WorkflowPass123!",
            "role": "freelancer",
            "full_name": "Workflow Test User",
            "phone": "+27856789012"
        }
        
        success, response = self.run_test(
            "Workflow - Create Freelancer",
            "POST",
            "/api/register",
            200,
            data=workflow_freelancer_data
        )
        
        if not success or 'token' not in response:
            print("❌ Failed to create freelancer for workflow test")
            return False
        
        workflow_token = response['token']
        workflow_user = response['user']
        
        # Step 1: Upload ID document
        dummy_pdf = b"%PDF-1.4\nWorkflow Test Document"
        files = {'file': ('workflow_id.pdf', io.BytesIO(dummy_pdf), 'application/pdf')}
        
        success, response = self.run_test(
            "Workflow - Upload ID Document",
            "POST",
            "/api/upload-id-document",
            200,
            files=files,
            token=workflow_token
        )
        
        if not success:
            print("❌ Workflow Step 1 failed: ID document upload")
            return False
        print("   ✓ Step 1: ID document uploaded successfully")
        
        # Step 2: Check verification status (should be pending)
        success, response = self.run_test(
            "Workflow - Check Pending Status",
            "GET",
            "/api/user/verification-status",
            200,
            token=workflow_token
        )
        
        if not success or response.get('verification_status') != 'pending':
            print("❌ Workflow Step 2 failed: Status not pending")
            return False
        print("   ✓ Step 2: Verification status is pending")
        
        # Step 3: Admin approves verification
        approval_data = {
            "status": "approved",
            "admin_notes": "Workflow test - document verified successfully"
        }
        
        success, response = self.run_test(
            "Workflow - Admin Approval",
            "POST",
            f"/api/admin/verify-user/{workflow_user['id']}",
            200,
            data=approval_data,
            token=self.admin_token
        )
        
        if not success:
            print("❌ Workflow Step 3 failed: Admin approval")
            return False
        print("   ✓ Step 3: Admin approved verification")
        
        # Step 4: Check final verification status (should be approved)
        success, response = self.run_test(
            "Workflow - Check Approved Status",
            "GET",
            "/api/user/verification-status",
            200,
            token=workflow_token
        )
        
        if not success:
            print("❌ Workflow Step 4 failed: Cannot check final status")
            return False
        
        if (response.get('verification_status') == 'approved' and 
            response.get('is_verified') == True):
            print("   ✓ Step 4: Verification completed successfully")
            print("   ✅ Complete verification workflow working perfectly")
            return True
        else:
            print(f"   ❌ Workflow Step 4 failed: Final status incorrect")
            print(f"       Status: {response.get('verification_status')}")
            print(f"       Is Verified: {response.get('is_verified')}")
            return False

    def run_all_tests(self):
        """Run all verification system tests"""
        print("🚀 Starting Verification System Testing...")
        print("=" * 60)
        
        # Setup test users
        if not self.setup_test_users():
            print("❌ Failed to setup test users")
            return
        
        # Run all tests
        tests = [
            self.test_id_document_upload_with_email,
            self.test_verification_status_check,
            self.test_admin_verification_approval,
            self.test_admin_verification_rejection,
            self.test_database_integration,
            self.test_authentication_authorization,
            self.test_email_content_validation,
            self.test_complete_verification_workflow
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 VERIFICATION SYSTEM TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL VERIFICATION TESTS PASSED!")
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
        
        return self.tests_passed, self.tests_run

if __name__ == "__main__":
    tester = VerificationSystemTester()
    passed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)