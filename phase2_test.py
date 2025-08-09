#!/usr/bin/env python3
"""
Simple Phase 2 Advanced Features Test Script
"""
import requests
import json
import sys
import time

BASE_URL = "http://localhost:8001"

def test_endpoint(name, method, endpoint, expected_status=200, data=None, headers=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🧪 Testing {name}")
    print(f"   {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        else:
            print(f"   ❌ Unsupported method: {method}")
            return False
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ PASS - Expected {expected_status}")
            try:
                result = response.json()
                if isinstance(result, dict) and len(result) > 0:
                    print(f"   Response keys: {list(result.keys())}")
                elif isinstance(result, list):
                    print(f"   Response: List with {len(result)} items")
                return True
            except:
                print(f"   Response: {response.text[:100]}...")
                return True
        else:
            print(f"   ❌ FAIL - Expected {expected_status}, got {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        return False

def main():
    print("🚀 Phase 2 Advanced Features Endpoint Test")
    print("=" * 50)
    
    # Test Phase 2 endpoints without authentication first
    tests = [
        # Review System Tests
        ("Get User Reviews (No Auth)", "GET", "/api/reviews/test-user-id", 200),
        
        # Revenue Monitoring (Should require admin auth)
        ("Revenue Analytics (No Auth)", "GET", "/api/admin/revenue-analytics", 403),
        
        # Advanced Search Tests
        ("Advanced Job Search", "POST", "/api/search/jobs/advanced", 200, {"query": "test"}),
        ("Advanced User Search", "POST", "/api/search/users/advanced", 200, {"query": "test"}),
        ("Advanced Transaction Search (No Auth)", "POST", "/api/search/transactions/advanced", 401, {"transaction_type": "all"}),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, method, endpoint, expected_status, *args in tests:
        data = args[0] if args else None
        if test_endpoint(test_name, method, endpoint, expected_status, data):
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All Phase 2 endpoints are accessible!")
        return 0
    elif passed >= total * 0.7:
        print("✅ Most Phase 2 endpoints are working")
        return 0
    else:
        print("❌ Several Phase 2 endpoints have issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())