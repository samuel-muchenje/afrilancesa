#!/usr/bin/env python3

import requests
import json

class CategoryCountsTester:
    def __init__(self, base_url="https://9c38454e-b247-48e2-bfc9-c1c62214b98a.preview.emergentagent.com"):
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

    def test_category_counts_endpoint(self):
        """Test GET /api/categories/counts endpoint (public endpoint)"""
        print("\n📊 Testing Category Counts Endpoint...")
        
        success, response = self.run_test(
            "Category Counts - Get All Category Counts",
            "GET",
            "/api/categories/counts",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['category_counts', 'totals']
            missing_fields = []
            
            for field in required_fields:
                if field not in response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Category counts response missing fields: {missing_fields}")
                return False
            
            # Verify category_counts structure
            category_counts = response.get('category_counts', {})
            expected_categories = [
                'ICT & Digital Work', 'Construction & Engineering', 'Creative & Media',
                'Admin & Office Support', 'Health & Wellness', 'Beauty & Fashion',
                'Logistics & Labour', 'Education & Training', 'Home & Domestic Services'
            ]
            
            missing_categories = []
            for category in expected_categories:
                if category not in category_counts:
                    missing_categories.append(category)
            
            if missing_categories:
                print(f"   ❌ Missing categories: {missing_categories}")
                return False
            
            print("   ✓ All 9 expected categories present")
            
            # Verify all counts are integers and >= 0
            for category, count in category_counts.items():
                if not isinstance(count, int) or count < 0:
                    print(f"   ❌ Invalid count for {category}: {count}")
                    return False
            
            print("   ✓ All category counts are valid integers >= 0")
            
            # Verify totals structure
            totals = response.get('totals', {})
            required_total_fields = ['freelancers', 'active_jobs']
            missing_total_fields = []
            
            for field in required_total_fields:
                if field not in totals:
                    missing_total_fields.append(field)
            
            if missing_total_fields:
                print(f"   ❌ Totals missing fields: {missing_total_fields}")
                return False
            
            # Verify totals are integers and >= 0
            for field, value in totals.items():
                if not isinstance(value, int) or value < 0:
                    print(f"   ❌ Invalid total for {field}: {value}")
                    return False
            
            print("   ✓ Totals structure valid")
            
            # Display the results
            print("   📊 Category Counts:")
            for category, count in category_counts.items():
                print(f"     {category}: {count}")
            
            print(f"   📊 Totals:")
            print(f"     Total Freelancers: {totals['freelancers']}")
            print(f"     Active Jobs: {totals['active_jobs']}")
            
            # Since no freelancer profiles have been created yet, all counts should be 0
            total_category_freelancers = sum(category_counts.values())
            if total_category_freelancers == 0:
                print("   ✓ All category counts are 0 (expected since no freelancer profiles created yet)")
            else:
                print(f"   ✓ Found {total_category_freelancers} freelancers across categories")
            
            if totals['freelancers'] == 0:
                print("   ✓ Total freelancers is 0 (expected since no verified freelancers with categories yet)")
            else:
                print(f"   ✓ Found {totals['freelancers']} total verified freelancers")
            
            print("   ✅ Category counts endpoint working correctly")
            return True
        else:
            print("   ❌ Category counts endpoint failed")
            return False

    def test_category_counts_public_access(self):
        """Test that category counts endpoint is publicly accessible (no authentication required)"""
        print("\n🌐 Testing Category Counts Public Access...")
        
        # Test without any authentication token
        success, response = self.run_test(
            "Category Counts - Public Access (No Token)",
            "GET",
            "/api/categories/counts",
            200
        )
        
        if success:
            print("   ✅ Category counts endpoint is publicly accessible")
            print("   ✓ No authentication required")
            return True
        else:
            print("   ❌ Category counts endpoint requires authentication (should be public)")
            return False

    def test_category_counts_response_format(self):
        """Test that category counts endpoint returns the expected JSON format"""
        print("\n📋 Testing Category Counts Response Format...")
        
        success, response = self.run_test(
            "Category Counts - Response Format Validation",
            "GET",
            "/api/categories/counts",
            200
        )
        
        if success:
            # Verify exact response format matches expected structure
            expected_structure = {
                "category_counts": {
                    "ICT & Digital Work": "integer",
                    "Construction & Engineering": "integer",
                    "Creative & Media": "integer",
                    "Admin & Office Support": "integer",
                    "Health & Wellness": "integer",
                    "Beauty & Fashion": "integer",
                    "Logistics & Labour": "integer",
                    "Education & Training": "integer",
                    "Home & Domestic Services": "integer"
                },
                "totals": {
                    "freelancers": "integer",
                    "active_jobs": "integer"
                }
            }
            
            # Check if response matches expected format
            if 'category_counts' in response and 'totals' in response:
                category_counts = response['category_counts']
                totals = response['totals']
                
                # Verify all expected categories are present with integer values
                format_valid = True
                for category in expected_structure['category_counts']:
                    if category not in category_counts:
                        print(f"   ❌ Missing category: {category}")
                        format_valid = False
                    elif not isinstance(category_counts[category], int):
                        print(f"   ❌ Category {category} has non-integer value: {category_counts[category]}")
                        format_valid = False
                
                # Verify totals format
                for field in expected_structure['totals']:
                    if field not in totals:
                        print(f"   ❌ Missing total field: {field}")
                        format_valid = False
                    elif not isinstance(totals[field], int):
                        print(f"   ❌ Total {field} has non-integer value: {totals[field]}")
                        format_valid = False
                
                if format_valid:
                    print("   ✅ Response format matches expected structure exactly")
                    print("   ✓ All categories present with integer values")
                    print("   ✓ Totals section properly formatted")
                    return True
                else:
                    print("   ❌ Response format validation failed")
                    return False
            else:
                print("   ❌ Response missing required top-level fields")
                return False
        else:
            print("   ❌ Could not retrieve response for format validation")
            return False

if __name__ == "__main__":
    tester = CategoryCountsTester()
    
    print("🚀 Starting Category Counts Endpoint Testing...")
    print(f"🌐 Base URL: {tester.base_url}")
    print("=" * 80)
    
    # Category Counts Endpoint Tests
    print("\n" + "="*50)
    print("📊 CATEGORY COUNTS ENDPOINT TESTS")
    print("="*50)
    
    tester.test_category_counts_endpoint()
    tester.test_category_counts_public_access()
    tester.test_category_counts_response_format()
    
    # Print final results
    print("\n" + "="*80)
    print("📊 CATEGORY COUNTS TEST RESULTS")
    print("="*80)
    print(f"🧪 Tests: {tester.tests_passed}/{tester.tests_run} passed ({(tester.tests_passed/tester.tests_run*100):.1f}%)")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 EXCELLENT! Category counts endpoint working perfectly!")
    elif tester.tests_passed >= tester.tests_run * 0.8:
        print("✅ GOOD! Category counts endpoint mostly working.")
    else:
        print("❌ ISSUES FOUND! Category counts endpoint needs attention.")
    
    print("="*80)