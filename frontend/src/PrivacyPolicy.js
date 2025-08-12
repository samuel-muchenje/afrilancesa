import React from 'react';

const PrivacyPolicy = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center space-x-3"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
                alt="Afrilance" 
                className="h-8 w-auto"
              />
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Consumer Data Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Afrilance (Pty) Ltd ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform located at afrilance.co.za.
              </p>
              <p className="text-gray-700 mb-4">
                This policy complies with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We collect the following personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Identity Information:</strong> Full name, ID number, date of birth</li>
                <li><strong>Contact Information:</strong> Email address, phone number, postal address</li>
                <li><strong>Account Information:</strong> Username, password, profile information</li>
                <li><strong>Professional Information:</strong> Skills, experience, portfolio, work history</li>
                <li><strong>Financial Information:</strong> Banking details, tax information, payment history</li>
                <li><strong>Verification Documents:</strong> ID documents, proof of address, certifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Technical Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage patterns and interactions</li>
                <li>Cookies and tracking technologies</li>
                <li>Log files and system analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Communication Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Messages between users on the platform</li>
                <li>Customer support communications</li>
                <li>Email communications and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Collect Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Direct Collection:</strong> Information you provide during registration and profile creation</li>
                <li><strong>Automatic Collection:</strong> Technical data collected through your use of our platform</li>
                <li><strong>Third-Party Sources:</strong> Verification services and background check providers</li>
                <li><strong>Communication:</strong> Information from your interactions with us and other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How We Use Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Primary Purposes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Account creation and management</li>
                <li>Identity verification and background checks</li>
                <li>Matching freelancers with clients</li>
                <li>Processing payments and transactions</li>
                <li>Providing customer support</li>
                <li>Platform security and fraud prevention</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Secondary Purposes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Platform improvement and analytics</li>
                <li>Marketing and promotional communications (with consent)</li>
                <li>Legal compliance and regulatory requirements</li>
                <li>Research and development</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Legal Basis for Processing</h2>
              <p className="text-gray-700 mb-4">We process your personal information based on:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Contract:</strong> Performance of our services and terms of use</li>
                <li><strong>Legitimate Interest:</strong> Platform operation, security, and improvement</li>
                <li><strong>Consent:</strong> Marketing communications and optional features</li>
                <li><strong>Legal Obligation:</strong> Compliance with South African laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 With Other Users</h3>
              <p className="text-gray-700 mb-4">
                We share certain profile information with other platform users to facilitate connections:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Public profile information (name, skills, portfolio)</li>
                <li>Work history and ratings</li>
                <li>Professional qualifications and certifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 With Service Providers</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment processors for transaction handling</li>
                <li>Verification services for identity checks</li>
                <li>Cloud hosting and technical infrastructure providers</li>
                <li>Customer support and communication tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose information when required by law or to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Comply with legal processes and government requests</li>
                <li>Protect our rights and property</li>
                <li>Ensure platform safety and security</li>
                <li>Prevent fraud and illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement comprehensive security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
                <li><strong>Access Controls:</strong> Restricted access to personal information</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Employee Training:</strong> Data protection awareness and procedures</li>
                <li><strong>Incident Response:</strong> Procedures for data breach detection and response</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records and analytics</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Specific Retention Periods:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Active accounts: Duration of account plus 7 years</li>
                <li>Inactive accounts: 3 years after last activity</li>
                <li>Financial records: 5 years as required by South African law</li>
                <li>Communication records: 2 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Your Rights Under POPIA</h2>
              <p className="text-gray-700 mb-4">
                Under South Africa's Protection of Personal Information Act, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal information</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Portability:</strong> Receive your information in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for optional processing</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, contact us at privacy@afrilance.co.za
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure platform security</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can manage cookie preferences through your browser settings or our cookie preference center.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your personal information may be transferred to and processed in countries outside South Africa. We ensure adequate protection through:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Other legally approved transfer mechanisms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Changes to Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. Significant changes will be communicated via:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Email notification to registered users</li>
                <li>Platform notifications and banners</li>
                <li>Updated "Last modified" date on this page</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For privacy-related questions or concerns, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700"><strong>Afrilance (Pty) Ltd</strong></p>
                <p className="text-gray-700">Email: privacy@afrilance.co.za</p>
                <p className="text-gray-700">Email: dpo@afrilance.co.za</p>
                <p className="text-gray-700">Phone: +27 (0) 11 123 4567</p>
                <p className="text-gray-700 mt-2">
                  <strong>Information Regulator:</strong><br/>
                  If you are not satisfied with our response, you may lodge a complaint with the Information Regulator of South Africa at inforeg.org.za
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;