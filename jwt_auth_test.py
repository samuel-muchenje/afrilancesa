#!/usr/bin/env python3

import requests
import jwt
import json
from datetime import datetime

class JWTAuthTester:
    def __init__(self, base_url="https://2844e33a-538f-4735-ad9b-b0c2ef87cab2.preview.emergentagent.com"):
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
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_jwt_secret_environment_variable(self):
        """Test JWT authentication after JWT_SECRET moved to environment variable"""
        print("\n" + "="*80)
        print("🔐 TESTING JWT SECRET ENVIRONMENT VARIABLE CONFIGURATION")
        print("="*80)
        
        # Test 1: Register a new user to get a fresh token with new secret
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"jwt.test{timestamp}@gmail.com",
            "password": "JWTTestPass123!",
            "role": "freelancer",
            "full_name": f"JWT Test User {timestamp}",
            "phone": "+27823456789"
        }
        
        success, response = self.run_test(
            "JWT Secret - Register User with New Secret",
            "POST",
            "/api/register",
            200,
            data=test_user_data
        )
        
        if not success or 'token' not in response:
            print("❌ Failed to register user for JWT secret test")
            return False
        
        jwt_token = response['token']
        user_data = response['user']
        
        print(f"   ✓ New token generated: {jwt_token[:20]}...")
        
        # Test 2: Verify token structure and content
        try:
            decoded = jwt.decode(jwt_token, options={"verify_signature": False})
            print(f"   ✓ Token payload: {decoded}")
            
            # Verify required fields
            required_fields = ['user_id', 'role', 'exp']
            for field in required_fields:
                if field not in decoded:
                    print(f"   ❌ Missing required field in JWT: {field}")
                    return False
            
            print(f"   ✓ JWT contains user_id: {decoded['user_id']}")
            print(f"   ✓ JWT contains role: {decoded['role']}")
            print(f"   ✓ JWT contains expiration: {decoded['exp']}")
            
        except Exception as e:
            print(f"   ❌ JWT token structure validation failed: {str(e)}")
            return False
        
        # Test 3: Use token to access protected endpoint
        success, profile_response = self.run_test(
            "JWT Secret - Access Protected Endpoint",
            "GET",
            "/api/profile",
            200,
            token=jwt_token
        )
        
        if not success:
            print("❌ Failed to access protected endpoint with new JWT token")
            return False
        
        print(f"   ✓ Protected endpoint accessible with new token")
        print(f"   ✓ Profile data retrieved: {profile_response.get('full_name', 'Unknown')}")
        
        # Test 4: Login with same user to get another token
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        success, login_response = self.run_test(
            "JWT Secret - Login to Get New Token",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        
        if not success or 'token' not in login_response:
            print("❌ Failed to login and get new token")
            return False
        
        login_token = login_response['token']
        print(f"   ✓ Login token generated: {login_token[:20]}...")
        
        # Test 5: Verify both tokens work (registration token and login token)
        success, _ = self.run_test(
            "JWT Secret - Registration Token Still Valid",
            "GET",
            "/api/profile",
            200,
            token=jwt_token
        )
        
        if not success:
            print("❌ Registration token no longer valid")
            return False
        
        success, _ = self.run_test(
            "JWT Secret - Login Token Valid",
            "GET",
            "/api/profile",
            200,
            token=login_token
        )
        
        if not success:
            print("❌ Login token not valid")
            return False
        
        print("   ✅ Both registration and login tokens working correctly")
        
        # Test 6: Test invalid token still gets rejected
        success, _ = self.run_test(
            "JWT Secret - Invalid Token Rejected",
            "GET",
            "/api/profile",
            401,
            token="invalid.jwt.token.here"
        )
        
        if not success:
            print("❌ Invalid token not properly rejected")
            return False
        
        print("   ✅ Invalid tokens properly rejected")
        
        # Test 7: Test token without Bearer prefix
        success, _ = self.run_test(
            "JWT Secret - No Token Rejected",
            "GET",
            "/api/profile",
            401
        )
        
        if not success:
            print("❌ No token request not properly rejected")
            return False
        
        print("   ✅ Requests without tokens properly rejected")
        
        # Test 8: Test token verification with different endpoints
        success, _ = self.run_test(
            "JWT Secret - Test Different Protected Endpoint",
            "GET",
            "/api/jobs",
            200,
            token=jwt_token
        )
        
        if not success:
            print("❌ Token not working with different protected endpoint")
            return False
        
        print("   ✅ Token working with multiple protected endpoints")
        
        print("\n✅ JWT SECRET ENVIRONMENT VARIABLE TESTING COMPLETED SUCCESSFULLY!")
        print("   ✓ JWT tokens generated with environment-based secret")
        print("   ✓ Token structure and content validation passed")
        print("   ✓ Protected endpoints accessible with valid tokens")
        print("   ✓ Authentication/authorization working correctly")
        print("   ✓ Invalid tokens properly rejected")
        print("   ✓ Security measures functioning as expected")
        
        return True

    def run_all_tests(self):
        """Run all JWT authentication tests"""
        print("🚀 Starting JWT Authentication Tests...")
        
        success = self.test_jwt_secret_environment_variable()
        
        print(f"\n📊 JWT AUTHENTICATION TEST SUMMARY:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if success:
            print("\n🎉 ALL JWT AUTHENTICATION TESTS PASSED!")
            print("   The JWT secret environment variable configuration is working correctly.")
            print("   Authentication system is functioning as expected after the security update.")
        else:
            print("\n❌ SOME JWT AUTHENTICATION TESTS FAILED!")
            print("   Please check the JWT secret configuration and backend setup.")
        
        return success

if __name__ == "__main__":
    tester = JWTAuthTester()
    tester.run_all_tests()