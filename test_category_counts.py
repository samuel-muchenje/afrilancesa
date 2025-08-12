#!/usr/bin/env python3

import requests
import json

def test_category_counts_endpoint():
    """Test the category counts endpoint"""
    base_url = "https://afrilance-email-fix.preview.emergentagent.com"
    url = f"{base_url}/api/categories/counts"
    
    print("🚀 Testing Category Counts Endpoint...")
    print(f"🌐 URL: {url}")
    print("=" * 80)
    
    try:
        # Test the endpoint with longer timeout
        response = requests.get(url, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint accessible and returning data")
            
            # Verify response structure
            print("\n📋 Response Structure Validation:")
            
            # Check required fields
            required_fields = ['category_counts', 'totals']
            for field in required_fields:
                if field in data:
                    print(f"   ✓ {field}: Present")
                else:
                    print(f"   ❌ {field}: Missing")
                    return False
            
            # Check category_counts
            category_counts = data.get('category_counts', {})
            expected_categories = [
                'ICT & Digital Work', 'Construction & Engineering', 'Creative & Media',
                'Admin & Office Support', 'Health & Wellness', 'Beauty & Fashion',
                'Logistics & Labour', 'Education & Training', 'Home & Domestic Services'
            ]
            
            print("\n📊 Category Counts Validation:")
            all_categories_present = True
            for category in expected_categories:
                if category in category_counts:
                    count = category_counts[category]
                    print(f"   ✓ {category}: {count}")
                    if not isinstance(count, int) or count < 0:
                        print(f"     ❌ Invalid count value: {count}")
                        return False
                else:
                    print(f"   ❌ {category}: Missing")
                    all_categories_present = False
            
            if not all_categories_present:
                return False
            
            # Check totals
            totals = data.get('totals', {})
            print("\n📊 Totals Validation:")
            required_totals = ['freelancers', 'active_jobs']
            for field in required_totals:
                if field in totals:
                    value = totals[field]
                    print(f"   ✓ {field}: {value}")
                    if not isinstance(value, int) or value < 0:
                        print(f"     ❌ Invalid total value: {value}")
                        return False
                else:
                    print(f"   ❌ {field}: Missing")
                    return False
            
            # Verify expected behavior (all category counts should be 0 since no freelancer profiles created)
            print("\n🔍 Data Analysis:")
            total_category_freelancers = sum(category_counts.values())
            print(f"   Total freelancers across categories: {total_category_freelancers}")
            print(f"   Total verified freelancers: {totals['freelancers']}")
            print(f"   Active jobs: {totals['active_jobs']}")
            
            if total_category_freelancers == 0:
                print("   ✓ All category counts are 0 (expected - no freelancer profiles with categories)")
            else:
                print(f"   ✓ Found {total_category_freelancers} freelancers with category assignments")
            
            # Check if totals make sense
            if totals['freelancers'] >= total_category_freelancers:
                print("   ✓ Total freelancers count is consistent with category counts")
            else:
                print("   ⚠️  Total freelancers less than category sum (may indicate data inconsistency)")
            
            print("\n✅ CATEGORY COUNTS ENDPOINT TEST PASSED!")
            print("✅ All 9 categories present with valid counts")
            print("✅ Totals section properly formatted")
            print("✅ Public endpoint accessible without authentication")
            print("✅ Response format matches expected structure")
            
            return True
            
        else:
            print(f"❌ Endpoint returned status {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_category_counts_endpoint()
    if success:
        print("\n🎉 CATEGORY COUNTS ENDPOINT WORKING PERFECTLY!")
    else:
        print("\n❌ CATEGORY COUNTS ENDPOINT HAS ISSUES!")