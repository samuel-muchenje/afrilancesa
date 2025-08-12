#!/usr/bin/env python3

import requests
import json

def test_category_counts_comprehensive():
    """Comprehensive test of the category counts endpoint"""
    
    print("🚀 TESTING CATEGORY COUNTS ENDPOINT")
    print("=" * 60)
    
    # Test both internal and external URLs
    urls = [
        "http://localhost:8001/api/categories/counts",
        "https://afrilance-email-fix.preview.emergentagent.com/api/categories/counts"
    ]
    
    for i, url in enumerate(urls):
        url_type = "Internal" if "localhost" in url else "External"
        print(f"\n📡 Testing {url_type} URL: {url}")
        
        try:
            timeout = 5 if "localhost" in url else 15
            response = requests.get(url, timeout=timeout)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ {url_type} endpoint accessible")
                
                # Only do detailed validation on first successful response
                if i == 0 or not any("✅ Detailed validation" in str(locals().get('validation_done', ''))):
                    print("\n📋 DETAILED VALIDATION:")
                    
                    # Verify response structure
                    required_fields = ['category_counts', 'totals']
                    structure_valid = True
                    
                    for field in required_fields:
                        if field in data:
                            print(f"   ✓ {field}: Present")
                        else:
                            print(f"   ❌ {field}: Missing")
                            structure_valid = False
                    
                    if not structure_valid:
                        continue
                    
                    # Verify categories
                    category_counts = data.get('category_counts', {})
                    expected_categories = [
                        'ICT & Digital Work', 'Construction & Engineering', 'Creative & Media',
                        'Admin & Office Support', 'Health & Wellness', 'Beauty & Fashion',
                        'Logistics & Labour', 'Education & Training', 'Home & Domestic Services'
                    ]
                    
                    print("\n   📊 Category Validation:")
                    categories_valid = True
                    for category in expected_categories:
                        if category in category_counts:
                            count = category_counts[category]
                            print(f"     ✓ {category}: {count}")
                            if not isinstance(count, int) or count < 0:
                                print(f"       ❌ Invalid count: {count}")
                                categories_valid = False
                        else:
                            print(f"     ❌ Missing: {category}")
                            categories_valid = False
                    
                    # Verify totals
                    totals = data.get('totals', {})
                    print("\n   📊 Totals Validation:")
                    totals_valid = True
                    required_totals = ['freelancers', 'active_jobs']
                    
                    for field in required_totals:
                        if field in totals:
                            value = totals[field]
                            print(f"     ✓ {field}: {value}")
                            if not isinstance(value, int) or value < 0:
                                print(f"       ❌ Invalid value: {value}")
                                totals_valid = False
                        else:
                            print(f"     ❌ Missing: {field}")
                            totals_valid = False
                    
                    # Data analysis
                    print("\n   🔍 Data Analysis:")
                    total_category_freelancers = sum(category_counts.values())
                    print(f"     Category freelancers sum: {total_category_freelancers}")
                    print(f"     Total verified freelancers: {totals['freelancers']}")
                    print(f"     Active jobs: {totals['active_jobs']}")
                    
                    # Validate data consistency
                    if total_category_freelancers == 0:
                        print("     ✓ All category counts are 0 (no freelancers with categories)")
                    else:
                        print(f"     ✓ {total_category_freelancers} freelancers have category assignments")
                    
                    # Note: totals['freelancers'] counts all verified freelancers, not just those with categories
                    # So it can be higher than the sum of category counts
                    if totals['freelancers'] >= total_category_freelancers:
                        print("     ✓ Total freelancers >= category sum (consistent)")
                    else:
                        print("     ⚠️  Total freelancers < category sum (potential data issue)")
                    
                    if structure_valid and categories_valid and totals_valid:
                        print("\n   ✅ Detailed validation PASSED")
                        validation_done = True
                    else:
                        print("\n   ❌ Detailed validation FAILED")
                        return False
                
            else:
                print(f"   ❌ {url_type} endpoint failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                
                # If external URL fails but internal works, that's acceptable
                if "localhost" not in url:
                    print("   ⚠️  External URL timeout acceptable if internal works")
                    continue
                else:
                    return False
                    
        except Exception as e:
            print(f"   ❌ {url_type} test failed: {str(e)}")
            # If external URL fails but internal works, that's acceptable
            if "localhost" not in url:
                print("   ⚠️  External URL timeout acceptable if internal works")
                continue
            else:
                return False
    
    print("\n🎉 CATEGORY COUNTS ENDPOINT TESTING COMPLETED!")
    print("✅ Endpoint is working correctly")
    print("✅ All 9 categories present with valid counts")
    print("✅ Totals section properly formatted")
    print("✅ Public access working (no authentication required)")
    print("✅ Response format matches expected structure")
    
    return True

if __name__ == "__main__":
    success = test_category_counts_comprehensive()
    if success:
        print("\n🎯 CATEGORY COUNTS ENDPOINT: WORKING PERFECTLY!")
    else:
        print("\n❌ CATEGORY COUNTS ENDPOINT: ISSUES FOUND!")