#!/usr/bin/env python3

import sys
import os
sys.path.append('/app')

from backend_test import AfrilanceAPITester

if __name__ == "__main__":
    tester = AfrilanceAPITester()
    
    # Run comprehensive messaging and support ticket systems testing
    print("🎯 RUNNING COMPREHENSIVE MESSAGING AND SUPPORT TICKET SYSTEMS TESTING")
    print("=" * 80)
    
    passed, total = tester.test_messaging_and_support_systems_comprehensive()
    
    print(f"\n📊 FINAL TESTING SUMMARY:")
    print(f"✅ Tests Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL MESSAGING AND SUPPORT SYSTEMS TESTS PASSED!")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED - SEE DETAILS ABOVE!")
        sys.exit(1)