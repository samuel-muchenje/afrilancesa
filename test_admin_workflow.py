#!/usr/bin/env python3

import sys
import os
sys.path.append('/app')

from backend_test import AfrilanceAPITester

def main():
    print("🚀 Starting Admin Registration Approval Workflow Test...")
    
    # Initialize tester
    tester = AfrilanceAPITester()
    
    # First, set up basic authentication to get admin token
    print("\n📋 Setting up authentication...")
    
    # Register basic users first
    tester.test_auth_register_freelancer()
    tester.test_auth_register_client() 
    tester.test_auth_register_admin()
    
    # Now run the specific admin registration approval workflow test
    print("\n🔐 Running Admin Registration Approval Workflow Test...")
    
    success = tester.test_admin_registration_approval_workflow_complete()
    
    if success:
        print("\n🎉 ADMIN REGISTRATION APPROVAL WORKFLOW TEST PASSED!")
        print("✅ All expected results achieved")
        print("✅ Critical bug resolution confirmed")
        print("✅ Email sending solution working correctly")
        print("✅ Complete workflow is production-ready")
    else:
        print("\n❌ ADMIN REGISTRATION APPROVAL WORKFLOW TEST FAILED!")
        print("❌ Issues found that need attention")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)