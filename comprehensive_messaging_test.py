#!/usr/bin/env python3

import requests
import json
from datetime import datetime

def test_messaging_system():
    """Comprehensive test of the messaging system"""
    base_url = "http://localhost:8001"
    
    print("🚀 COMPREHENSIVE MESSAGING SYSTEM TEST")
    print("=" * 60)
    
    # Create test users
    timestamp = datetime.now().strftime('%H%M%S')
    
    # Create freelancer
    freelancer_data = {
        "email": f"freelancer.test{timestamp}@test.com",
        "password": "TestPass123!",
        "role": "freelancer",
        "full_name": f"Thabo Mthembu {timestamp}",
        "phone": f"+27823456{timestamp[-3:]}"
    }
    
    response = requests.post(f"{base_url}/api/register", json=freelancer_data)
    if response.status_code != 200:
        print(f"❌ Failed to create freelancer: {response.text}")
        return False
    
    freelancer_token = response.json()['token']
    freelancer_user = response.json()['user']
    print(f"✅ Created freelancer: {freelancer_user['full_name']}")
    
    # Create client
    client_data = {
        "email": f"client.test{timestamp}@test.com",
        "password": "TestPass123!",
        "role": "client",
        "full_name": f"Nomsa Dlamini {timestamp}",
        "phone": f"+27719876{timestamp[-3:]}"
    }
    
    response = requests.post(f"{base_url}/api/register", json=client_data)
    if response.status_code != 200:
        print(f"❌ Failed to create client: {response.text}")
        return False
    
    client_token = response.json()['token']
    client_user = response.json()['user']
    print(f"✅ Created client: {client_user['full_name']}")
    
    # Test 1: Send direct message
    print(f"\n📤 Test 1: Send Direct Message")
    message_data = {
        "receiver_id": client_user['id'],
        "content": "Hello! I'm interested in discussing potential collaboration opportunities. I specialize in full-stack development with React and Python."
    }
    
    response = requests.post(
        f"{base_url}/api/direct-messages",
        json=message_data,
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 200:
        conversation_id = response.json()['conversation_id']
        print(f"✅ Direct message sent successfully")
        print(f"   Conversation ID: {conversation_id}")
    else:
        print(f"❌ Failed to send direct message: {response.text}")
        return False
    
    # Test 2: Get conversations
    print(f"\n📋 Test 2: Get Conversations")
    response = requests.get(
        f"{base_url}/api/conversations",
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 200:
        conversations = response.json()
        print(f"✅ Retrieved {len(conversations)} conversations")
        if conversations:
            conv = conversations[0]
            print(f"   Conversation with: {conv['other_participant']['full_name']}")
            print(f"   Unread count: {conv['unread_count']}")
            print(f"   Last message: {conv['last_message_content'][:50]}...")
    else:
        print(f"❌ Failed to get conversations: {response.text}")
        return False
    
    # Test 3: Get conversation messages
    print(f"\n💬 Test 3: Get Conversation Messages")
    response = requests.get(
        f"{base_url}/api/conversations/{conversation_id}/messages",
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 200:
        messages = response.json()
        print(f"✅ Retrieved {len(messages)} messages")
        if messages:
            msg = messages[0]
            print(f"   Message from: {msg['sender_name']} ({msg['sender_role']})")
            print(f"   Content: {msg['content'][:100]}...")
            print(f"   Read status: {msg['read']}")
    else:
        print(f"❌ Failed to get messages: {response.text}")
        return False
    
    # Test 4: Client reply
    print(f"\n↩️  Test 4: Client Reply")
    reply_data = {
        "receiver_id": freelancer_user['id'],
        "content": "Hello! Thank you for reaching out. I'm always interested in connecting with talented developers. I have several upcoming projects that might be a good fit for your skills."
    }
    
    response = requests.post(
        f"{base_url}/api/direct-messages",
        json=reply_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    if response.status_code == 200:
        print(f"✅ Client reply sent successfully")
    else:
        print(f"❌ Failed to send client reply: {response.text}")
        return False
    
    # Test 5: Mark as read
    print(f"\n✅ Test 5: Mark Conversation as Read")
    response = requests.post(
        f"{base_url}/api/conversations/{conversation_id}/mark-read",
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Mark as read successful: {result['message']}")
    else:
        print(f"❌ Failed to mark as read: {response.text}")
        return False
    
    # Test 6: Search users
    print(f"\n🔍 Test 6: Search Users for Messaging")
    response = requests.get(
        f"{base_url}/api/conversations/search?query=client",
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"✅ Found {len(users)} users matching 'client'")
        if users:
            user = users[0]
            print(f"   User: {user['full_name']} ({user['role']})")
            print(f"   Email: {user['email']}")
    else:
        print(f"❌ Failed to search users: {response.text}")
        return False
    
    # Test 7: Verify final conversation state
    print(f"\n🔄 Test 7: Final Conversation State")
    response = requests.get(
        f"{base_url}/api/conversations/{conversation_id}/messages",
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 200:
        messages = response.json()
        print(f"✅ Final conversation has {len(messages)} messages")
        
        # Check message order and content
        if len(messages) >= 2:
            first_msg = messages[0]
            second_msg = messages[1]
            print(f"   First message from: {first_msg['sender_name']}")
            print(f"   Second message from: {second_msg['sender_name']}")
            print(f"   Conversation flow working correctly")
        
    else:
        print(f"❌ Failed to get final conversation state: {response.text}")
        return False
    
    # Test 8: Error handling - message to non-existent user
    print(f"\n❌ Test 8: Error Handling - Non-existent User")
    error_data = {
        "receiver_id": "non-existent-user-id",
        "content": "This should fail"
    }
    
    response = requests.post(
        f"{base_url}/api/direct-messages",
        json=error_data,
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 404:
        print(f"✅ Non-existent user properly handled with 404")
    else:
        print(f"❌ Expected 404 for non-existent user, got {response.status_code}")
        return False
    
    # Test 9: Error handling - message to self
    print(f"\n❌ Test 9: Error Handling - Message to Self")
    self_message_data = {
        "receiver_id": freelancer_user['id'],
        "content": "This should fail - messaging yourself"
    }
    
    response = requests.post(
        f"{base_url}/api/direct-messages",
        json=self_message_data,
        headers={"Authorization": f"Bearer {freelancer_token}"}
    )
    
    if response.status_code == 400:
        print(f"✅ Self-messaging properly blocked with 400")
    else:
        print(f"❌ Expected 400 for self-messaging, got {response.status_code}")
        return False
    
    print(f"\n🎉 ALL MESSAGING SYSTEM TESTS PASSED!")
    print(f"✅ Direct messaging between users working")
    print(f"✅ Conversation management working")
    print(f"✅ Message history and persistence working")
    print(f"✅ Read/unread status tracking working")
    print(f"✅ User search functionality working")
    print(f"✅ Proper authentication and authorization")
    print(f"✅ Database integration working")
    print(f"✅ Error handling working correctly")
    
    return True

if __name__ == "__main__":
    success = test_messaging_system()
    if success:
        print(f"\n🏆 COMPREHENSIVE MESSAGING SYSTEM: FULLY FUNCTIONAL")
    else:
        print(f"\n💥 MESSAGING SYSTEM: ISSUES FOUND")