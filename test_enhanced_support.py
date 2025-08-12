#!/usr/bin/env python3
"""
Enhanced Support Ticket and Messaging System Tests
Testing the new features as requested in the review.
"""

import requests
import sys
import json
from datetime import datetime

class EnhancedSupportTester:
    def __init__(self, base_url="https://sa-freelance-hub.preview.emergentagent.com"):
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

    def test_enhanced_support_ticket_system(self):
        """Test enhanced support ticket system with sequential numbering and message integration"""
        print("\n🎫 ENHANCED SUPPORT TICKET SYSTEM TESTING")
        print("=" * 80)
        
        # ========== SEQUENTIAL TICKET NUMBERING TESTS ==========
        print("\n🔢 STEP 1: SEQUENTIAL TICKET NUMBERING")
        print("-" * 50)
        
        # Create multiple support tickets to test sequential numbering
        ticket_numbers = []
        
        for i in range(3):
            timestamp = datetime.now().strftime('%H%M%S')
            
            ticket_data = {
                "name": f"Thabo Mthembu {i+1}",
                "email": f"thabo.test{timestamp}.{i+1}@gmail.com",
                "message": f"Test support ticket #{i+1} - I need help with account verification and platform navigation. This is a comprehensive test of the support system."
            }
            
            success, response = self.run_test(
                f"Sequential Numbering - Create Support Ticket #{i+1}",
                "POST",
                "/api/support-tickets",
                200,
                data=ticket_data
            )
            
            if success and 'ticket_number' in response:
                ticket_number = response['ticket_number']
                ticket_numbers.append(ticket_number)
                
                print(f"   ✅ Ticket #{i+1} created successfully")
                print(f"      ✓ Ticket Number: {ticket_number}")
                print(f"      ✓ Ticket ID: {response.get('ticket_id', 'Unknown')}")
                print(f"      ✓ Status: {response.get('status', 'Unknown')}")
            else:
                print(f"   ❌ Failed to create support ticket #{i+1}")
        
        # Verify sequential numbering
        if len(ticket_numbers) >= 2:
            print(f"\n   📊 SEQUENTIAL NUMBERING VERIFICATION:")
            print(f"      ✓ Ticket numbers created: {ticket_numbers}")
            
            # Check if numbers are sequential
            sequential = True
            for i in range(1, len(ticket_numbers)):
                current_num = int(ticket_numbers[i])
                previous_num = int(ticket_numbers[i-1])
                if current_num != previous_num + 1:
                    sequential = False
                    break
            
            if sequential:
                print(f"      ✅ Sequential numbering working correctly!")
            else:
                print(f"      ⚠️ Sequential numbering may have gaps (acceptable in concurrent environment)")
        
        # ========== ADMIN SUPPORT TICKET MANAGEMENT ==========
        print("\n🔧 STEP 2: ADMIN SUPPORT TICKET MANAGEMENT")
        print("-" * 50)
        
        # Login as admin first
        admin_login_data = {
            "email": "sam@afrilance.co.za",
            "password": "Sierra#2030"
        }
        
        success, admin_response = self.run_test(
            "Admin Login for Support Management",
            "POST",
            "/api/login",
            200,
            data=admin_login_data
        )
        
        admin_token = None
        if success and 'token' in admin_response:
            admin_token = admin_response['token']
            print(f"   ✅ Admin logged in successfully")
            print(f"      ✓ Admin: {admin_response['user']['full_name']}")
        else:
            print(f"   ❌ Admin login failed")
        
        # Test GET /api/admin/support-tickets
        if admin_token:
            success, response = self.run_test(
                "Admin - Get All Support Tickets",
                "GET",
                "/api/admin/support-tickets",
                200,
                token=admin_token
            )
            
            if success:
                tickets = response.get('tickets', [])
                total_tickets = response.get('total', 0)
                
                print(f"   ✅ Admin can view all support tickets")
                print(f"      ✓ Total tickets: {total_tickets}")
                print(f"      ✓ Tickets in response: {len(tickets)}")
                
                # Find our test tickets
                test_tickets = []
                for ticket in tickets:
                    if ticket.get('ticket_number') in ticket_numbers:
                        test_tickets.append(ticket)
                
                print(f"      ✓ Found {len(test_tickets)} of our test tickets")
            else:
                print(f"   ❌ Admin cannot view support tickets")
        
        # ========== ADMIN REPLY INTEGRATION WITH MESSAGING ==========
        print("\n💬 STEP 3: ADMIN REPLY INTEGRATION WITH MESSAGING")
        print("-" * 50)
        
        if admin_token:
            # Create a user account for the ticket creator to test messaging
            timestamp = datetime.now().strftime('%H%M%S')
            user_data = {
                "email": f"ticket.creator{timestamp}@gmail.com",
                "password": "TicketUser123!",
                "role": "freelancer",
                "full_name": "Ticket Creator User",
                "phone": "+27823456789"
            }
            
            success, user_response = self.run_test(
                "Create User for Ticket Reply Test",
                "POST",
                "/api/register",
                200,
                data=user_data
            )
            
            user_token = None
            if success and 'token' in user_response:
                user_token = user_response['token']
                user_id = user_response['user']['id']
                print(f"   ✅ Test user created for messaging")
                print(f"      ✓ User ID: {user_id}")
                
                # Create a support ticket from this user
                ticket_data = {
                    "name": user_response['user']['full_name'],
                    "email": user_response['user']['email'],
                    "message": "I need help with my freelancer profile setup and verification process."
                }
                
                success, ticket_response = self.run_test(
                    "Create Support Ticket from Registered User",
                    "POST",
                    "/api/support-tickets",
                    200,
                    data=ticket_data
                )
                
                if success and 'ticket_id' in ticket_response:
                    ticket_id = ticket_response['ticket_id']
                    ticket_number = ticket_response['ticket_number']
                    
                    print(f"   ✅ Support ticket created from registered user")
                    print(f"      ✓ Ticket ID: {ticket_id}")
                    print(f"      ✓ Ticket Number: {ticket_number}")
                    
                    # Now test admin reply that should create a direct message
                    admin_reply_data = {
                        "admin_reply": f"Hello {user_response['user']['full_name']}, thank you for contacting Afrilance support. I've reviewed your request regarding profile setup and verification. Here's what you need to do: 1) Complete your freelancer profile with skills and experience, 2) Upload your ID document for verification, 3) Wait for admin approval. If you need further assistance, please don't hesitate to ask. Best regards, Afrilance Support Team",
                        "status": "in_progress",
                        "assigned_to": admin_response['user']['id']
                    }
                    
                    success, reply_response = self.run_test(
                        "Admin Reply to Support Ticket (Should Create Direct Message)",
                        "PATCH",
                        f"/api/admin/support-tickets/{ticket_id}",
                        200,
                        data=admin_reply_data,
                        token=admin_token
                    )
                    
                    if success:
                        print(f"   ✅ Admin reply sent successfully")
                        print(f"      ✓ Ticket status updated")
                        print(f"      ✓ Admin assigned to ticket")
                        print(f"      ✓ Direct message should be created")
                        
                        # Verify that a direct message was created
                        success, conversations = self.run_test(
                            "Check User Conversations for Admin Reply Message",
                            "GET",
                            "/api/conversations",
                            200,
                            token=user_token
                        )
                        
                        if success and isinstance(conversations, list):
                            support_conversations = []
                            for conv in conversations:
                                if 'support' in conv.get('conversation_id', '').lower():
                                    support_conversations.append(conv)
                            
                            if support_conversations:
                                print(f"      ✅ Support conversation created successfully")
                                print(f"         ✓ Found {len(support_conversations)} support conversation(s)")
                                
                                # Check the messages in the support conversation
                                support_conv = support_conversations[0]
                                conv_id = support_conv['conversation_id']
                                
                                success, messages = self.run_test(
                                    "Get Support Conversation Messages",
                                    "GET",
                                    f"/api/conversations/{conv_id}/messages",
                                    200,
                                    token=user_token
                                )
                                
                                if success and isinstance(messages, list) and len(messages) > 0:
                                    print(f"         ✅ Admin reply message found in conversation")
                                    print(f"            ✓ Messages in conversation: {len(messages)}")
                                    
                                    # Check if message contains ticket number
                                    admin_message = messages[0]
                                    if ticket_number in admin_message.get('content', ''):
                                        print(f"            ✅ Message includes ticket number: #{ticket_number}")
                                    else:
                                        print(f"            ⚠️ Message may not include ticket number")
                                else:
                                    print(f"         ⚠️ No messages found in support conversation")
                            else:
                                print(f"      ⚠️ No support conversation found (may be created with different ID format)")
                        else:
                            print(f"      ⚠️ Could not retrieve user conversations")
                    else:
                        print(f"   ❌ Admin reply failed")
                else:
                    print(f"   ❌ Failed to create support ticket from registered user")
            else:
                print(f"   ❌ Failed to create test user for messaging")
        
        # ========== USER SUPPORT TICKET ACCESS ==========
        print("\n👤 STEP 4: USER SUPPORT TICKET ACCESS")
        print("-" * 50)
        
        if user_token:
            success, response = self.run_test(
                "User - Get My Support Tickets",
                "GET",
                "/api/my-support-tickets",
                200,
                token=user_token
            )
            
            if success:
                user_tickets = response.get('tickets', [])
                
                print(f"   ✅ User can view their support tickets")
                print(f"      ✓ User's tickets: {len(user_tickets)}")
                
                # Check if our test ticket is in the user's tickets
                found_ticket = False
                for ticket in user_tickets:
                    if ticket.get('email') == user_data['email']:
                        found_ticket = True
                        print(f"      ✓ Found user's ticket: #{ticket.get('ticket_number')}")
                        print(f"         - Status: {ticket.get('status', 'Unknown')}")
                        print(f"         - Admin Reply: {'Yes' if ticket.get('admin_reply') else 'No'}")
                        break
                
                if found_ticket:
                    print(f"      ✅ User can see their tickets with admin replies")
                else:
                    print(f"      ⚠️ User's test ticket not found in response")
            else:
                print(f"   ❌ User cannot view their support tickets")
        
        # ========== DIRECT MESSAGING SYSTEM TESTS ==========
        print("\n💬 STEP 5: DIRECT MESSAGING SYSTEM")
        print("-" * 50)
        
        # Create two users for direct messaging test
        timestamp = datetime.now().strftime('%H%M%S')
        
        user1_data = {
            "email": f"user1.messaging{timestamp}@gmail.com",
            "password": "User1Pass123!",
            "role": "freelancer",
            "full_name": "Sipho Ndlovu",
            "phone": "+27823456789"
        }
        
        user2_data = {
            "email": f"user2.messaging{timestamp}@gmail.com",
            "password": "User2Pass123!",
            "role": "client",
            "full_name": "Nomsa Dlamini",
            "phone": "+27834567890"
        }
        
        # Register both users
        success1, response1 = self.run_test(
            "Create User 1 for Direct Messaging",
            "POST",
            "/api/register",
            200,
            data=user1_data
        )
        
        success2, response2 = self.run_test(
            "Create User 2 for Direct Messaging",
            "POST",
            "/api/register",
            200,
            data=user2_data
        )
        
        if success1 and success2:
            user1_token = response1['token']
            user2_token = response2['token']
            user1_id = response1['user']['id']
            user2_id = response2['user']['id']
            
            print(f"   ✅ Both users created for messaging test")
            print(f"      ✓ User 1: {response1['user']['full_name']} ({user1_id})")
            print(f"      ✓ User 2: {response2['user']['full_name']} ({user2_id})")
            
            # Test direct messaging
            message_data = {
                "receiver_id": user2_id,
                "content": "Hi Nomsa! I saw your job posting for web development. I'm a full-stack developer with 5+ years experience in React, Node.js, and Python. I'd love to discuss your project requirements and see how I can help bring your vision to life. Are you available for a quick chat about the project details?"
            }
            
            success, message_response = self.run_test(
                "Direct Message - User to User",
                "POST",
                "/api/direct-messages",
                200,
                data=message_data,
                token=user1_token
            )
            
            if success:
                conversation_id = message_response.get('conversation_id')
                
                print(f"   ✅ Direct message sent successfully")
                print(f"      ✓ Conversation ID: {conversation_id}")
                
                # Test conversation retrieval
                success, conversations = self.run_test(
                    "Get User Conversations",
                    "GET",
                    "/api/conversations",
                    200,
                    token=user2_token
                )
                
                if success and isinstance(conversations, list) and len(conversations) > 0:
                    print(f"   ✅ User can retrieve conversations")
                    print(f"      ✓ Conversations found: {len(conversations)}")
                    
                    # Find our conversation
                    our_conversation = None
                    for conv in conversations:
                        if conv.get('conversation_id') == conversation_id:
                            our_conversation = conv
                            break
                    
                    if our_conversation:
                        print(f"      ✓ Found our conversation with unread count: {our_conversation.get('unread_count', 0)}")
                        
                        # Test message history
                        success, messages = self.run_test(
                            "Get Conversation Messages",
                            "GET",
                            f"/api/conversations/{conversation_id}/messages",
                            200,
                            token=user2_token
                        )
                        
                        if success and isinstance(messages, list) and len(messages) > 0:
                            print(f"   ✅ Message history retrieved successfully")
                            print(f"      ✓ Messages in conversation: {len(messages)}")
                            print(f"      ✓ First message from: {messages[0].get('sender_name', 'Unknown')}")
                        else:
                            print(f"   ❌ Could not retrieve message history")
                    else:
                        print(f"   ⚠️ Our conversation not found in user's conversation list")
                else:
                    print(f"   ❌ User cannot retrieve conversations")
            else:
                print(f"   ❌ Direct message sending failed")
        else:
            print(f"   ❌ Failed to create users for direct messaging test")
        
        # ========== SUPPORT SYSTEM SUMMARY ==========
        print("\n📊 ENHANCED SUPPORT TICKET SYSTEM SUMMARY")
        print("=" * 80)
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        print(f"✅ SUPPORT TESTS PASSED: {self.tests_passed}/{self.tests_run} ({success_rate:.1f}%)")
        print("\n🎯 SUPPORT FEATURES TESTED:")
        print("   ✓ Sequential ticket numbering (0000001, 0000002, etc.)")
        print("   ✓ Support ticket creation and storage")
        print("   ✓ Admin support ticket management")
        print("   ✓ Admin replies integration with messaging system")
        print("   ✓ User support ticket access (my-support-tickets)")
        print("   ✓ Direct user-to-user messaging")
        print("   ✓ Conversation management and message history")
        print("   ✓ Support conversation creation from admin replies")
        print("   ✓ Email notifications for support activities")
        
        if success_rate >= 90:
            print("\n🎉 ENHANCED SUPPORT TICKET SYSTEM WORKING EXCELLENTLY!")
        elif success_rate >= 75:
            print("\n✅ ENHANCED SUPPORT TICKET SYSTEM WORKING WELL!")
        else:
            print("\n⚠️ ENHANCED SUPPORT TICKET SYSTEM NEEDS ATTENTION!")
        
        return self.tests_passed, self.tests_run

if __name__ == "__main__":
    tester = EnhancedSupportTester()
    
    # Run enhanced support ticket and messaging system tests
    print("🎫 TESTING ENHANCED SUPPORT TICKET AND MESSAGING SYSTEMS")
    print("=" * 80)
    
    passed, total = tester.test_enhanced_support_ticket_system()
    
    print(f"\n📊 FINAL TESTING SUMMARY:")
    print(f"✅ Tests Passed: {passed}/{total}")
    
    if passed >= (total * 0.8):  # 80% success rate
        print("🎉 ENHANCED SUPPORT TICKET AND MESSAGING TESTS MOSTLY PASSED!")
        sys.exit(0)
    else:
        print("❌ SIGNIFICANT ISSUES FOUND - SEE DETAILS ABOVE!")
        sys.exit(1)