#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MessagingSystemTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.freelancer_token = None
        self.client_token = None
        self.admin_token = None
        self.freelancer_user = None
        self.client_user = None
        self.admin_user = None
        self.test_conversation_id = None
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

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
        """Create test users for messaging tests"""
        print("\n🔧 Setting up test users...")
        
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Create freelancer
        freelancer_data = {
            "email": f"freelancer.msg{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "freelancer",
            "full_name": f"Thabo Mthembu {timestamp}",
            "phone": f"+27823456{timestamp[-3:]}"
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
            print(f"   ✓ Freelancer created: {self.freelancer_user['full_name']}")
        else:
            print("❌ Failed to create freelancer")
            return False
        
        # Create client
        client_data = {
            "email": f"client.msg{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "client",
            "full_name": f"Nomsa Dlamini {timestamp}",
            "phone": f"+27719876{timestamp[-3:]}"
        }
        
        success, response = self.run_test(
            "Setup - Create Client",
            "POST",
            "/api/register",
            200,
            data=client_data
        )
        
        if success and 'token' in response:
            self.client_token = response['token']
            self.client_user = response['user']
            print(f"   ✓ Client created: {self.client_user['full_name']}")
        else:
            print("❌ Failed to create client")
            return False
        
        # Create admin
        admin_data = {
            "email": f"admin.msg{timestamp}@afrilance.co.za",
            "password": "TestPass123!",
            "role": "admin",
            "full_name": f"Admin User {timestamp}",
            "phone": f"+27123456{timestamp[-3:]}"
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
            print(f"   ✓ Admin created: {self.admin_user['full_name']}")
            return True
        else:
            print("❌ Failed to create admin")
            return False

    def test_direct_message_send(self):
        """Test sending direct messages between users"""
        if not self.freelancer_token or not self.client_user:
            print("❌ Missing freelancer token or client user for direct message test")
            return False
            
        message_data = {
            "receiver_id": self.client_user['id'],
            "content": "Hello! I'm interested in discussing potential collaboration opportunities. I specialize in full-stack development with React and Python, and I've noticed you post interesting projects. Would you be open to a brief conversation about your upcoming development needs?"
        }
        
        success, response = self.run_test(
            "Direct Message - Send Message",
            "POST",
            "/api/direct-messages",
            200,
            data=message_data,
            token=self.freelancer_token
        )
        
        if success and 'conversation_id' in response:
            print(f"   ✓ Direct message sent successfully")
            print(f"   ✓ Conversation ID: {response['conversation_id']}")
            self.test_conversation_id = response['conversation_id']
            return True
        return False

    def test_direct_message_to_self(self):
        """Test sending direct message to self - should fail"""
        if not self.freelancer_token or not self.freelancer_user:
            print("❌ Missing freelancer token or user for self-message test")
            return False
            
        message_data = {
            "receiver_id": self.freelancer_user['id'],
            "content": "This should fail - messaging yourself"
        }
        
        success, response = self.run_test(
            "Direct Message - Send to Self (Should Fail)",
            "POST",
            "/api/direct-messages",
            400,
            data=message_data,
            token=self.freelancer_token
        )
        
        if success:
            print("   ✓ Self-messaging properly blocked")
            return True
        return False

    def test_get_conversations(self):
        """Test getting all conversations for current user"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for conversations test")
            return False
            
        success, response = self.run_test(
            "Conversations - Get All Conversations",
            "GET",
            "/api/conversations",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Retrieved {len(response)} conversations")
            
            if len(response) > 0:
                conversation = response[0]
                required_fields = ['conversation_id', 'participants', 'last_message_at', 'last_message_content', 'other_participant', 'unread_count']
                
                missing_fields = []
                for field in required_fields:
                    if field not in conversation:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing conversation fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Conversation with: {conversation['other_participant']['full_name']}")
                print(f"   ✓ Unread messages: {conversation['unread_count']}")
                print(f"   ✓ Last message preview: {conversation['last_message_content'][:50]}...")
                
            return True
        return False

    def test_get_conversation_messages(self):
        """Test getting messages in a specific conversation"""
        if not self.freelancer_token or not self.test_conversation_id:
            print("❌ Missing freelancer token or conversation ID for messages test")
            return False
            
        success, response = self.run_test(
            "Conversations - Get Messages",
            "GET",
            f"/api/conversations/{self.test_conversation_id}/messages",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Retrieved {len(response)} messages in conversation")
            
            if len(response) > 0:
                message = response[0]
                required_fields = ['id', 'conversation_id', 'sender_id', 'receiver_id', 'content', 'created_at', 'read', 'sender_name', 'sender_role']
                
                missing_fields = []
                for field in required_fields:
                    if field not in message:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing message fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Message from: {message['sender_name']} ({message['sender_role']})")
                print(f"   ✓ Message content: {message['content'][:100]}...")
                print(f"   ✓ Message read status: {message['read']}")
                
            return True
        return False

    def test_mark_conversation_read(self):
        """Test marking all messages in a conversation as read"""
        if not self.client_token or not self.test_conversation_id:
            print("❌ Missing client token or conversation ID for mark read test")
            return False
            
        success, response = self.run_test(
            "Conversations - Mark as Read",
            "POST",
            f"/api/conversations/{self.test_conversation_id}/mark-read",
            200,
            token=self.client_token
        )
        
        if success and 'message' in response:
            print(f"   ✓ Mark as read successful: {response['message']}")
            return True
        return False

    def test_search_users_for_messaging(self):
        """Test searching users to start new conversations"""
        if not self.freelancer_token:
            print("❌ Missing freelancer token for user search test")
            return False
            
        success, response = self.run_test(
            "Conversations - Search Users",
            "GET",
            "/api/conversations/search?query=client",
            200,
            token=self.freelancer_token
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} users matching 'client'")
            
            if len(response) > 0:
                user = response[0]
                required_fields = ['id', 'full_name', 'email', 'role', 'is_verified']
                
                missing_fields = []
                for field in required_fields:
                    if field not in user:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing user search fields: {missing_fields}")
                    return False
                
                print(f"   ✓ Found user: {user['full_name']} ({user['role']})")
                print(f"   ✓ User verified: {user['is_verified']}")
                
            return True
        return False

    def test_bidirectional_messaging(self):
        """Test bidirectional messaging in a conversation"""
        if not self.client_token or not self.freelancer_user or not self.test_conversation_id:
            print("❌ Missing client token, freelancer user, or conversation ID for bidirectional test")
            return False
            
        # Client sends reply to freelancer
        reply_data = {
            "receiver_id": self.freelancer_user['id'],
            "content": "Hello! Thank you for reaching out. I'm always interested in connecting with talented developers. I have several upcoming projects that might be a good fit for your skills. Could you tell me more about your experience with e-commerce platforms and payment integrations?"
        }
        
        success, response = self.run_test(
            "Direct Message - Client Reply",
            "POST",
            "/api/direct-messages",
            200,
            data=reply_data,
            token=self.client_token
        )
        
        if not success:
            return False
        
        # Verify both users can see the conversation
        success, response = self.run_test(
            "Conversations - Client View",
            "GET",
            "/api/conversations",
            200,
            token=self.client_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   ✓ Client can see {len(response)} conversations")
            
            # Find our test conversation
            found_conversation = False
            for conv in response:
                if conv['conversation_id'] == self.test_conversation_id:
                    found_conversation = True
                    print(f"   ✓ Client found conversation with: {conv['other_participant']['full_name']}")
                    break
            
            if not found_conversation:
                print("   ❌ Client cannot find the conversation")
                return False
            
            return True
        return False

    def run_messaging_tests(self):
        """Run all messaging system tests"""
        print("🚀 COMPREHENSIVE IN-APP MESSAGING SYSTEM TESTS")
        print("=" * 60)
        
        # Setup test users
        if not self.setup_test_users():
            print("❌ Failed to setup test users")
            return False
        
        # Define test cases
        test_cases = [
            ("Direct Message Send", self.test_direct_message_send),
            ("Direct Message to Self (Should Fail)", self.test_direct_message_to_self),
            ("Get All Conversations", self.test_get_conversations),
            ("Get Conversation Messages", self.test_get_conversation_messages),
            ("Mark Conversation as Read", self.test_mark_conversation_read),
            ("Search Users for Messaging", self.test_search_users_for_messaging),
            ("Bidirectional Messaging", self.test_bidirectional_messaging),
        ]
        
        # Run tests
        passed = 0
        for test_name, test_func in test_cases:
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name}")
                else:
                    print(f"❌ {test_name}")
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 MESSAGING SYSTEM TEST RESULTS")
        print("=" * 60)
        print(f"Tests Passed: {passed}/{len(test_cases)} ({passed/len(test_cases)*100:.1f}%)")
        print(f"Total API Calls: {self.tests_run}")
        print(f"Successful API Calls: {self.tests_passed}")
        
        if passed == len(test_cases):
            print("🎉 ALL MESSAGING SYSTEM TESTS PASSED!")
            return True
        else:
            print("⚠️  Some messaging system tests failed")
            return False

if __name__ == "__main__":
    tester = MessagingSystemTester()
    success = tester.run_messaging_tests()
    sys.exit(0 if success else 1)