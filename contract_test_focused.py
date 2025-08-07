import requests
import json
from datetime import datetime

class ContractTester:
    def __init__(self):
        self.base_url = "https://e1488ef0-488b-4f1e-9158-db786f616a3a.preview.emergentagent.com"
        self.freelancer_token = None
        self.client_token = None
        self.admin_token = None
        self.freelancer_user = None
        self.client_user = None
        self.admin_user = None
        self.test_job_id = None
        self.test_contract_id = None

    def setup_users(self):
        """Setup test users"""
        print("🔧 Setting up test users...")
        
        # Register freelancer
        timestamp = datetime.now().strftime('%H%M%S')
        freelancer_data = {
            "email": f"contract_freelancer_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "freelancer",
            "full_name": f"Contract Freelancer {timestamp}",
            "phone": f"+27123456{timestamp[-3:]}"
        }
        
        response = requests.post(f"{self.base_url}/api/register", json=freelancer_data)
        if response.status_code == 200:
            data = response.json()
            self.freelancer_token = data['token']
            self.freelancer_user = data['user']
            print(f"✅ Freelancer registered: {self.freelancer_user['id']}")
        else:
            print(f"❌ Freelancer registration failed: {response.status_code}")
            return False
        
        # Register client
        client_data = {
            "email": f"contract_client_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "client",
            "full_name": f"Contract Client {timestamp}",
            "phone": f"+27987654{timestamp[-3:]}"
        }
        
        response = requests.post(f"{self.base_url}/api/register", json=client_data)
        if response.status_code == 200:
            data = response.json()
            self.client_token = data['token']
            self.client_user = data['user']
            print(f"✅ Client registered: {self.client_user['id']}")
        else:
            print(f"❌ Client registration failed: {response.status_code}")
            return False
        
        # Register admin
        admin_data = {
            "email": f"contract_admin_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "admin",
            "full_name": f"Contract Admin {timestamp}",
            "phone": f"+27111222{timestamp[-3:]}"
        }
        
        response = requests.post(f"{self.base_url}/api/register", json=admin_data)
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data['token']
            self.admin_user = data['user']
            print(f"✅ Admin registered: {self.admin_user['id']}")
        else:
            print(f"❌ Admin registration failed: {response.status_code}")
            return False
        
        # Verify freelancer so they can bid
        verification_data = {
            "user_id": self.freelancer_user['id'],
            "verification_status": True
        }
        
        response = requests.post(
            f"{self.base_url}/api/admin/verify-user",
            json=verification_data,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if response.status_code == 200:
            print("✅ Freelancer verified")
        else:
            print(f"❌ Freelancer verification failed: {response.status_code}")
            return False
        
        return True

    def test_contract_creation_flow(self):
        """Test the complete contract creation flow"""
        print("\n🔄 Testing Contract Creation Flow...")
        
        # Step 1: Create job
        job_data = {
            "title": "Contract Test Job",
            "description": "Test job for contract creation",
            "category": "Web Development",
            "budget": 5000.0,
            "budget_type": "fixed",
            "requirements": ["Testing"]
        }
        
        response = requests.post(
            f"{self.base_url}/api/jobs",
            json=job_data,
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        if response.status_code != 200:
            print(f"❌ Job creation failed: {response.status_code}")
            return False
        
        self.test_job_id = response.json()['job_id']
        print(f"✅ Job created: {self.test_job_id}")
        
        # Step 2: Apply to job
        application_data = {
            "job_id": self.test_job_id,
            "proposal": "Test proposal for contract creation",
            "bid_amount": 4500.0
        }
        
        response = requests.post(
            f"{self.base_url}/api/jobs/{self.test_job_id}/apply",
            json=application_data,
            headers={'Authorization': f'Bearer {self.freelancer_token}'}
        )
        
        if response.status_code != 200:
            print(f"❌ Job application failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print("✅ Application submitted")
        
        # Step 3: Get applications
        response = requests.get(
            f"{self.base_url}/api/jobs/{self.test_job_id}/applications",
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        if response.status_code != 200:
            print(f"❌ Get applications failed: {response.status_code}")
            return False
        
        applications = response.json()
        if not applications:
            print("❌ No applications found")
            return False
        
        proposal_id = applications[0]['id']
        print(f"✅ Found application: {proposal_id}")
        
        # Step 4: Accept proposal
        acceptance_data = {
            "job_id": self.test_job_id,
            "freelancer_id": self.freelancer_user['id'],
            "proposal_id": proposal_id,
            "bid_amount": 4500.0
        }
        
        response = requests.post(
            f"{self.base_url}/api/jobs/{self.test_job_id}/accept-proposal",
            json=acceptance_data,
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        if response.status_code != 200:
            print(f"❌ Proposal acceptance failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        contract_data = response.json()
        self.test_contract_id = contract_data['contract_id']
        print(f"✅ Contract created: {self.test_contract_id}")
        
        return True

    def test_contract_details(self):
        """Test getting contract details"""
        print("\n📋 Testing Contract Details...")
        
        if not self.test_contract_id:
            print("❌ No contract ID available")
            return False
        
        response = requests.get(
            f"{self.base_url}/api/contracts/{self.test_contract_id}",
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            contract = response.json()
            print(f"✅ Contract details retrieved")
            print(f"   Contract ID: {contract.get('id')}")
            print(f"   Job ID: {contract.get('job_id')}")
            print(f"   Amount: {contract.get('amount')}")
            print(f"   Status: {contract.get('status')}")
            
            # Check for enriched data
            if 'job_details' in contract:
                print("   ✅ Job details included")
            else:
                print("   ❌ Job details missing")
            
            if 'freelancer_details' in contract:
                print("   ✅ Freelancer details included")
            else:
                print("   ❌ Freelancer details missing")
            
            if 'client_details' in contract:
                print("   ✅ Client details included")
            else:
                print("   ❌ Client details missing")
            
            return True
        else:
            print(f"❌ Contract details failed: {response.status_code}")
            return False

    def test_contract_stats(self):
        """Test contract stats endpoint"""
        print("\n📊 Testing Contract Stats...")
        
        # Test freelancer stats
        response = requests.get(
            f"{self.base_url}/api/contracts/stats",
            headers={'Authorization': f'Bearer {self.freelancer_token}'}
        )
        
        print(f"Freelancer Stats - Status Code: {response.status_code}")
        print(f"Freelancer Stats - Response: {response.text}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Freelancer stats retrieved")
            print(f"   Total contracts: {stats.get('total_contracts')}")
            print(f"   Total amount: {stats.get('total_amount')}")
        else:
            print(f"❌ Freelancer stats failed")
            return False
        
        # Test client stats
        response = requests.get(
            f"{self.base_url}/api/contracts/stats",
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        print(f"Client Stats - Status Code: {response.status_code}")
        print(f"Client Stats - Response: {response.text}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Client stats retrieved")
            print(f"   Total contracts: {stats.get('total_contracts')}")
            print(f"   Total amount: {stats.get('total_amount')}")
        else:
            print(f"❌ Client stats failed")
            return False
        
        return True

    def test_contract_status_update(self):
        """Test contract status update"""
        print("\n🔄 Testing Contract Status Update...")
        
        if not self.test_contract_id:
            print("❌ No contract ID available")
            return False
        
        # Update status to Completed
        status_data = {"status": "Completed"}
        
        response = requests.patch(
            f"{self.base_url}/api/contracts/{self.test_contract_id}/status",
            json=status_data,
            headers={'Authorization': f'Bearer {self.client_token}'}
        )
        
        print(f"Status Update - Status Code: {response.status_code}")
        print(f"Status Update - Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Contract status updated")
            
            # Verify the update
            response = requests.get(
                f"{self.base_url}/api/contracts/{self.test_contract_id}",
                headers={'Authorization': f'Bearer {self.client_token}'}
            )
            
            if response.status_code == 200:
                contract = response.json()
                if contract.get('status') == 'Completed':
                    print("✅ Status update verified")
                    return True
                else:
                    print(f"❌ Status not updated: {contract.get('status')}")
                    return False
            else:
                print("❌ Could not verify status update")
                return False
        else:
            print(f"❌ Status update failed")
            return False

    def run_all_tests(self):
        """Run all contract tests"""
        print("🚀 Starting Focused Contract System Tests")
        print("=" * 50)
        
        if not self.setup_users():
            print("❌ User setup failed, aborting tests")
            return
        
        tests = [
            ("Contract Creation Flow", self.test_contract_creation_flow),
            ("Contract Details", self.test_contract_details),
            ("Contract Stats", self.test_contract_stats),
            ("Contract Status Update", self.test_contract_status_update),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"❌ {test_name} - EXCEPTION: {str(e)}")
        
        print("\n" + "=" * 50)
        print(f"📊 RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")

if __name__ == "__main__":
    tester = ContractTester()
    tester.run_all_tests()