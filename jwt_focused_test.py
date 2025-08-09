import requests
import sys
import json
import jwt
from datetime import datetime

class JWTFocusedTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔐 Test {self.tests_run}: {name}")
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
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_comprehensive_jwt_authentication(self):
        """Test comprehensive JWT authentication - all 10 scenarios"""
        print("\n🔐 COMPREHENSIVE JWT AUTHENTICATION TESTING - TARGETING 100% SUCCESS RATE")
        print("=" * 80)
        
        # Test 1: User Registration - Generate JWT token with environment-based secret
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"jwt.comprehensive{timestamp}@gmail.com",
            "password": "JWTComprehensive123!",
            "role": "freelancer",
            "full_name": f"JWT Comprehensive Test {timestamp}",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "User Registration - Generate JWT Token",
            "POST",
            "/api/register",
            200,
            data=test_user_data
        )
        
        if not success or 'token' not in response:
            print("❌ CRITICAL FAILURE: User registration failed")
            return False
        
        registration_token = response['token']
        user_data = response['user']
        print(f"   ✓ Registration token: {registration_token[:30]}...")
        
        # Test 2: User Login - Authenticate and get JWT token
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        success, login_response = self.run_test(
            "User Login - Authenticate and Get JWT Token",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        
        if not success or 'token' not in login_response:
            print("❌ CRITICAL FAILURE: User login failed")
            return False
        
        login_token = login_response['token']
        print(f"   ✓ Login token: {login_token[:30]}...")
        
        # Test 3: Token Structure Validation - Verify JWT payload and format
        try:
            decoded_reg = jwt.decode(registration_token, options={"verify_signature": False})
            decoded_login = jwt.decode(login_token, options={"verify_signature": False})
            
            print(f"   ✓ Registration token payload: {decoded_reg}")
            print(f"   ✓ Login token payload: {decoded_login}")
            
            # Verify required fields
            required_fields = ['user_id', 'role', 'exp']
            for field in required_fields:
                if field not in decoded_reg or field not in decoded_login:
                    print(f"❌ FAILURE: Missing required field in JWT: {field}")
                    return False
            
            print("✅ PASSED - Token Structure Validation")
            self.tests_passed += 1
            
        except Exception as e:
            print(f"❌ FAILURE: JWT token structure validation failed: {str(e)}")
            return False
        
        self.tests_run += 1
        
        # Test 4: Protected Endpoint Access - Use token to access /api/profile
        success, profile_response = self.run_test(
            "Protected Endpoint Access - /api/profile with Registration Token",
            "GET",
            "/api/profile",
            200,
            token=registration_token
        )
        
        if not success:
            print("❌ FAILURE: Protected endpoint access with registration token failed")
            return False
        
        # Test 5: Multiple Token Validation - Test both registration and login tokens
        success, profile_response2 = self.run_test(
            "Multiple Token Validation - /api/profile with Login Token",
            "GET",
            "/api/profile",
            200,
            token=login_token
        )
        
        if not success:
            print("❌ FAILURE: Protected endpoint access with login token failed")
            return False
        
        # Test 6: Admin Token Testing - Test admin-level authentication if available
        admin_data = {
            "email": f"admin.jwt{timestamp}@afrilance.co.za",
            "password": "AdminJWT123!",
            "role": "admin",
            "full_name": f"Admin JWT Test {timestamp}",
            "phone": "+27123456789"
        }
        
        success, admin_response = self.run_test(
            "Admin Token Testing - Register Admin User",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if success and 'token' in admin_response:
            admin_token = admin_response['token']
            
            # Test admin endpoint access
            success, admin_users = self.run_test(
                "Admin Token Testing - Access Admin Endpoint",
                "GET",
                "/api/admin/users",
                200,
                token=admin_token
            )
            
            if not success:
                print("❌ FAILURE: Admin token access to admin endpoints failed")
                return False
        else:
            print("❌ FAILURE: Admin user registration failed")
            return False
        
        # Test 7: Invalid Token Rejection - Ensure invalid tokens are rejected (401 status)
        success, invalid_response = self.run_test(
            "Invalid Token Rejection - Test Invalid Token",
            "GET",
            "/api/profile",
            401,
            token="invalid.jwt.token.here"
        )
        
        if not success:
            print("❌ FAILURE: Invalid token not properly rejected")
            return False
        
        # Test 8: No Token Rejection - Ensure requests without tokens are rejected (401 status)
        success, no_token_response = self.run_test(
            "No Token Rejection - Test Request Without Token",
            "GET",
            "/api/profile",
            401
        )
        
        if not success:
            print("❌ FAILURE: Request without token not properly rejected")
            return False
        
        # Test 9: Token Expiration Handling - Test token expiration scenarios
        # For this test, we'll verify the token has proper expiration field
        try:
            exp_time = decoded_reg.get('exp')
            current_time = datetime.utcnow().timestamp()
            
            if exp_time and exp_time > current_time:
                print("✅ PASSED - Token Expiration Handling (Token has valid future expiration)")
                self.tests_passed += 1
            else:
                print("❌ FAILURE: Token expiration not properly set")
                return False
        except Exception as e:
            print(f"❌ FAILURE: Token expiration validation failed: {str(e)}")
            return False
        
        self.tests_run += 1
        
        # Test 10: Cross-Role Authentication - Test different user roles (freelancer, client, admin)
        client_data = {
            "email": f"client.jwt{timestamp}@gmail.com",
            "password": "ClientJWT123!",
            "role": "client",
            "full_name": f"Client JWT Test {timestamp}",
            "phone": "+27987654321"
        }
        
        success, client_response = self.run_test(
            "Cross-Role Authentication - Register Client User",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in client_response:
            client_token = client_response['token']
            
            # Test client can access profile but not admin endpoints
            success, client_profile = self.run_test(
                "Cross-Role Authentication - Client Access Profile",
                "GET",
                "/api/profile",
                200,
                token=client_token
            )
            
            if not success:
                print("❌ FAILURE: Client token access to profile failed")
                return False
            
            # Test client cannot access admin endpoints
            success, client_admin_fail = self.run_test(
                "Cross-Role Authentication - Client Cannot Access Admin",
                "GET",
                "/api/admin/users",
                403,
                token=client_token
            )
            
            if not success:
                print("❌ FAILURE: Client token improperly allowed admin access")
                return False
        else:
            print("❌ FAILURE: Client user registration failed")
            return False
        
        # Calculate final results
        success_rate = (self.tests_passed / self.tests_run) * 100
        
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE JWT AUTHENTICATION TEST RESULTS")
        print("=" * 80)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100.0:
            print("🎉 PERFECT! 100% SUCCESS RATE ACHIEVED!")
            print("✅ ALL JWT AUTHENTICATION SCENARIOS WORKING CORRECTLY")
            return True
        else:
            print(f"⚠️  TARGET NOT MET: {success_rate:.1f}% success rate (need 100%)")
            print("❌ SOME JWT AUTHENTICATION SCENARIOS FAILED")
            return False

def main():
    print("🚀 STARTING COMPREHENSIVE JWT AUTHENTICATION TESTING")
    print("🎯 TARGET: 100% SUCCESS RATE (10/10 TESTS MUST PASS)")
    print("=" * 80)
    
    tester = JWTFocusedTester()
    
    try:
        result = tester.test_comprehensive_jwt_authentication()
        
        if result:
            print("\n🎉 SUCCESS: JWT AUTHENTICATION SYSTEM WORKING PERFECTLY!")
            sys.exit(0)
        else:
            print("\n❌ FAILURE: JWT AUTHENTICATION SYSTEM HAS ISSUES!")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()