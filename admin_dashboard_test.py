#!/usr/bin/env python3

import requests
import json
from datetime import datetime

class AdminDashboardTester:
    def __init__(self, base_url="https://ff48e49b-fda0-4f45-aeb8-719a72e6b048.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.freelancer_token = None
        self.client_token = None
        self.admin_user = None
        self.freelancer_user = None
        self.client_user = None
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
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
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
        """Create test users for admin dashboard testing"""
        print("\n🔧 Setting up test users...")
        
        # Create admin user
        timestamp = datetime.now().strftime('%H%M%S')
        admin_data = {
            "email": f"admin.test{timestamp}@afrilance.co.za",
            "password": "AdminPass123!",
            "role": "admin",
            "full_name": f"Test Admin {timestamp}",
            "phone": "+27123456789"
        }
        
        success, response = self.run_test(
            "Setup - Create Admin User",
            "POST",
            "/api/register",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_user = response['user']
            print(f"   ✓ Admin user created: {self.admin_user['full_name']}")
        else:
            print("   ❌ Failed to create admin user")
            return False
        
        # Create freelancer user
        freelancer_data = {
            "email": f"freelancer.test{timestamp}@gmail.com",
            "password": "FreelancerPass123!",
            "role": "freelancer",
            "full_name": f"Test Freelancer {timestamp}",
            "phone": "+27987654321"
        }
        
        success, response = self.run_test(
            "Setup - Create Freelancer User",
            "POST",
            "/api/register",
            200,
            data=freelancer_data
        )
        
        if success and 'token' in response:
            self.freelancer_token = response['token']
            self.freelancer_user = response['user']
            print(f"   ✓ Freelancer user created: {self.freelancer_user['full_name']}")
        else:
            print("   ❌ Failed to create freelancer user")
            return False
        
        # Create client user
        client_data = {
            "email": f"client.test{timestamp}@outlook.com",
            "password": "ClientPass123!",
            "role": "client",
            "full_name": f"Test Client {timestamp}",
            "phone": "+27555666777"
        }
        
        success, response = self.run_test(
            "Setup - Create Client User",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in response:
            self.client_token = response['token']
            self.client_user = response['user']
            print(f"   ✓ Client user created: {self.client_user['full_name']}")
        else:
            print("   ❌ Failed to create client user")
            return False
        
        # Create a support ticket for testing
        support_data = {
            "name": "Test Support User",
            "email": "support.test@example.com",
            "message": "This is a test support ticket for admin dashboard testing."
        }
        
        success, response = self.run_test(
            "Setup - Create Support Ticket",
            "POST",
            "/api/support",
            200,
            data=support_data
        )
        
        if success:
            print(f"   ✓ Support ticket created for testing")
        
        return True

    def test_admin_stats_endpoint(self):
        """Test GET /api/admin/stats - Platform statistics endpoint"""
        success, response = self.run_test(
            "Admin Dashboard - Get Platform Statistics",
            "GET",
            "/api/admin/stats",
            200,
            token=self.admin_token
        )
        
        if success:
            # Verify comprehensive stats structure
            required_sections = ['users', 'jobs', 'contracts', 'revenue', 'support']
            for section in required_sections:
                if section not in response:
                    print(f"   ❌ Missing stats section: {section}")
                    return False
            
            # Verify user stats
            user_stats = response['users']
            user_fields = ['total', 'freelancers', 'clients', 'verified_freelancers', 'new_this_month']
            for field in user_fields:
                if field not in user_stats:
                    print(f"   ❌ Missing user stat: {field}")
                    return False
            
            print(f"   ✓ Platform Statistics Retrieved:")
            print(f"     - Total Users: {user_stats['total']}")
            print(f"     - Freelancers: {user_stats['freelancers']}")
            print(f"     - Clients: {user_stats['clients']}")
            print(f"     - Verified Freelancers: {user_stats['verified_freelancers']}")
            print(f"     - Jobs: {response['jobs']['total']} (Active: {response['jobs']['active']})")
            print(f"     - Contracts: {response['contracts']['total']}")
            print(f"     - Revenue: R{response['revenue']['total_platform']}")
            print(f"     - Support Tickets: {response['support']['total_tickets']} (Open: {response['support']['open_tickets']})")
            return True
        return False

    def test_admin_stats_unauthorized(self):
        """Test admin stats endpoint with non-admin user - should return 403"""
        success, response = self.run_test(
            "Admin Stats - Unauthorized Access (Should Fail)",
            "GET",
            "/api/admin/stats",
            403,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from admin stats")
            return True
        return False

    def test_admin_users_search_basic(self):
        """Test GET /api/admin/users/search - Basic user search"""
        success, response = self.run_test(
            "Admin Dashboard - Search Users (Basic)",
            "GET",
            "/api/admin/users/search",
            200,
            token=self.admin_token
        )
        
        if success:
            # Verify response structure
            required_fields = ['users', 'total', 'page', 'pages']
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing response field: {field}")
                    return False
            
            users = response['users']
            if isinstance(users, list):
                # Check user data structure (passwords should be excluded)
                if len(users) > 0:
                    user = users[0]
                    if 'password' in user:
                        print("   ❌ Password field exposed in user search results")
                        return False
                
                print(f"   ✓ User Search Results:")
                print(f"     - Total Users: {response['total']}")
                print(f"     - Page: {response['page']} of {response['pages']}")
                print(f"     - Users on page: {len(users)}")
                return True
            else:
                print("   ❌ Users field is not a list")
                return False
        return False

    def test_admin_users_search_role_filter(self):
        """Test user search with role filtering"""
        success, response = self.run_test(
            "Admin Dashboard - Search Users by Role (Freelancer)",
            "GET",
            "/api/admin/users/search?role=freelancer",
            200,
            token=self.admin_token
        )
        
        if success:
            users = response['users']
            # Verify all returned users are freelancers
            for user in users:
                if user.get('role') != 'freelancer':
                    print(f"   ❌ Non-freelancer user in freelancer filter: {user.get('role')}")
                    return False
            
            print(f"   ✓ Role filter working: {len(users)} freelancers found")
            return True
        return False

    def test_admin_users_search_unauthorized(self):
        """Test user search with non-admin user - should return 403"""
        success, response = self.run_test(
            "Admin User Search - Unauthorized Access (Should Fail)",
            "GET",
            "/api/admin/users/search",
            403,
            token=self.client_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from user search")
            return True
        return False

    def test_admin_suspend_user(self):
        """Test PATCH /api/admin/users/{user_id}/suspend - Suspend user"""
        success, response = self.run_test(
            "Admin Dashboard - Suspend User",
            "PATCH",
            f"/api/admin/users/{self.freelancer_user['id']}/suspend",
            200,
            token=self.admin_token
        )
        
        if success:
            # Verify response structure
            required_fields = ['message', 'user_id', 'is_suspended']
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing response field: {field}")
                    return False
            
            print(f"   ✓ User suspension: {response['message']}")
            print(f"   ✓ User ID: {response['user_id']}")
            print(f"   ✓ Suspended: {response['is_suspended']}")
            return True
        return False

    def test_admin_suspend_unauthorized(self):
        """Test user suspension with non-admin user - should return 403"""
        success, response = self.run_test(
            "Admin Suspend - Unauthorized Access (Should Fail)",
            "PATCH",
            f"/api/admin/users/{self.client_user['id']}/suspend",
            403,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from user suspension")
            return True
        return False

    def test_admin_support_tickets_list(self):
        """Test GET /api/admin/support-tickets - Support ticket management"""
        success, response = self.run_test(
            "Admin Dashboard - Get Support Tickets",
            "GET",
            "/api/admin/support-tickets",
            200,
            token=self.admin_token
        )
        
        if success:
            # Verify response structure
            required_fields = ['tickets', 'total', 'page', 'pages']
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing response field: {field}")
                    return False
            
            tickets = response['tickets']
            print(f"   ✓ Support Tickets Retrieved:")
            print(f"     - Total Tickets: {response['total']}")
            print(f"     - Page: {response['page']} of {response['pages']}")
            print(f"     - Tickets on page: {len(tickets)}")
            
            # Verify ticket data structure if tickets exist
            if len(tickets) > 0:
                ticket = tickets[0]
                ticket_fields = ['name', 'email', 'message', 'created_at']
                for field in ticket_fields:
                    if field not in ticket:
                        print(f"   ❌ Missing ticket field: {field}")
                        return False
                print(f"     - Sample ticket from: {ticket['name']}")
            
            return True
        return False

    def test_admin_support_tickets_unauthorized(self):
        """Test support tickets access with non-admin user - should return 403"""
        success, response = self.run_test(
            "Admin Support Tickets - Unauthorized Access (Should Fail)",
            "GET",
            "/api/admin/support-tickets",
            403,
            token=self.client_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from support tickets access")
            return True
        return False

    def test_admin_activity_log(self):
        """Test GET /api/admin/activity-log - Activity monitoring"""
        success, response = self.run_test(
            "Admin Dashboard - Get Activity Log",
            "GET",
            "/api/admin/activity-log",
            200,
            token=self.admin_token
        )
        
        if success:
            # Verify response structure
            required_fields = ['activities', 'total', 'page', 'pages']
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing response field: {field}")
                    return False
            
            activities = response['activities']
            print(f"   ✓ Activity Log Retrieved:")
            print(f"     - Total Activities: {response['total']}")
            print(f"     - Page: {response['page']} of {response['pages']}")
            print(f"     - Activities on page: {len(activities)}")
            
            # Verify activity data structure if activities exist
            if len(activities) > 0:
                activity = activities[0]
                activity_fields = ['type', 'description', 'timestamp', 'icon']
                for field in activity_fields:
                    if field not in activity:
                        print(f"   ❌ Missing activity field: {field}")
                        return False
                
                print(f"     - Recent activity: {activity['description']}")
                print(f"     - Activity type: {activity['type']}")
                
                # Check for different activity types
                activity_types = set(act['type'] for act in activities)
                print(f"     - Activity types found: {list(activity_types)}")
            
            return True
        return False

    def test_admin_activity_log_unauthorized(self):
        """Test activity log access with non-admin user - should return 403"""
        success, response = self.run_test(
            "Admin Activity Log - Unauthorized Access (Should Fail)",
            "GET",
            "/api/admin/activity-log",
            403,
            token=self.client_token
        )
        
        if success:
            print("   ✓ Non-admin properly blocked from activity log access")
            return True
        return False

    def run_all_tests(self):
        """Run all admin dashboard tests"""
        print("🚀 Starting Admin Dashboard Enhanced Endpoints Tests")
        print("=" * 60)
        
        # Setup test users
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Aborting tests.")
            return False
        
        # Define all admin dashboard tests
        admin_tests = [
            ("Admin Stats Endpoint", self.test_admin_stats_endpoint),
            ("Admin Stats Unauthorized", self.test_admin_stats_unauthorized),
            ("Admin Users Search Basic", self.test_admin_users_search_basic),
            ("Admin Users Search Role Filter", self.test_admin_users_search_role_filter),
            ("Admin Users Search Unauthorized", self.test_admin_users_search_unauthorized),
            ("Admin Suspend User", self.test_admin_suspend_user),
            ("Admin Suspend Unauthorized", self.test_admin_suspend_unauthorized),
            ("Admin Support Tickets List", self.test_admin_support_tickets_list),
            ("Admin Support Tickets Unauthorized", self.test_admin_support_tickets_unauthorized),
            ("Admin Activity Log", self.test_admin_activity_log),
            ("Admin Activity Log Unauthorized", self.test_admin_activity_log_unauthorized),
        ]
        
        print(f"\n🔧 ADMIN DASHBOARD ENHANCED ENDPOINTS TESTS")
        print("=" * 60)
        
        # Run all tests
        for test_name, test_func in admin_tests:
            try:
                if test_func():
                    print(f"✅ {test_name}")
                else:
                    print(f"❌ {test_name}")
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 ADMIN DASHBOARD TEST RESULTS")
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Total Tests Passed: {self.tests_passed}")
        print(f"Total Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = AdminDashboardTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)