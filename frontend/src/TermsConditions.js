import React from 'react';

const TermsConditions = ({ setCurrentPage }) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Afrilance ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our platform located at afrilance.co.za (the "Service") operated by Afrilance (Pty) Ltd.
              </p>
              <p className="text-gray-700 mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>"Platform"</strong> refers to the Afrilance website and services</li>
                <li><strong>"User"</strong> refers to anyone who accesses or uses our platform</li>
                <li><strong>"Freelancer"</strong> refers to verified service providers on our platform</li>
                <li><strong>"Client"</strong> refers to users who hire freelancers for services</li>
                <li><strong>"Service"</strong> refers to work performed by freelancers for clients</li>
                <li><strong>"Transaction"</strong> refers to the exchange of services for payment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 mb-4">
                To use Afrilance, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Be a resident of South Africa or legally authorized to work in South Africa</li>
                <li>Have the legal capacity to enter into contracts</li>
                <li>Provide accurate, complete, and current information during registration</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Account Registration and Verification</h2>
              <p className="text-gray-700 mb-4">
                <strong>4.1 Registration:</strong> Users must create an account to access platform services. You are responsible for maintaining the confidentiality of your account information.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>4.2 Verification:</strong> Freelancers must complete our verification process, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Providing valid South African ID documentation</li>
                <li>Completing profile information accurately</li>
                <li>Undergoing background verification checks</li>
                <li>Receiving admin approval before accessing full platform features</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>4.3 Account Suspension:</strong> We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Platform Fees and Commission</h2>
              <p className="text-gray-700 mb-4">
                <strong>5.1 Service Fee:</strong> Afrilance charges a 17% commission on all completed transactions. Freelancers receive 83% of the total project value after successful completion and client approval.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>5.2 Fee Calculation:</strong> The 17% commission is calculated on the gross project value including any additional services, modifications, or bonuses agreed upon between client and freelancer. This fee covers platform maintenance, payment processing, dispute resolution, and customer support services.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>5.3 Payment Processing:</strong> All payments are processed through our secure payment system. Fees are automatically deducted from freelancer earnings.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>5.4 Fee Changes:</strong> We reserve the right to modify our fee structure with 30 days' notice to all users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                <strong>6.1 Escrow System:</strong> Payments are held in escrow until work is completed and approved by the client.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>6.2 Payment Release:</strong> Funds are released to freelancers upon:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Client approval of completed work</li>
                <li>Automatic release after 14 days if no disputes are raised</li>
                <li>Dispute resolution in favor of the freelancer</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>6.3 Currency:</strong> All transactions are conducted in South African Rand (ZAR).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                <strong>7.1 Freelancer Responsibilities:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Deliver work as specified in project agreements</li>
                <li>Meet agreed-upon deadlines</li>
                <li>Maintain professional communication</li>
                <li>Provide accurate information about skills and experience</li>
                <li>Comply with South African tax obligations</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>7.2 Client Responsibilities:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide clear project requirements</li>
                <li>Make timely payments</li>
                <li>Communicate changes or feedback promptly</li>
                <li>Treat freelancers with respect and professionalism</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Refund and Return Policy</h2>
              <p className="text-gray-700 mb-4">
                <strong>8.1 Refund Eligibility:</strong> Refunds may be issued in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Freelancer fails to deliver agreed-upon work</li>
                <li>Work delivered does not meet specified requirements</li>
                <li>Freelancer breaches contract terms</li>
                <li>Technical issues prevent service delivery</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>8.2 Refund Process:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Refund requests must be submitted within 30 days of project completion</li>
                <li>All refund requests are subject to investigation</li>
                <li>Partial refunds may be issued for partially completed work</li>
                <li>Refunds are processed within 7-14 business days</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>8.3 Non-Refundable Services:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Completed work that meets project specifications</li>
                <li>Platform service fees (17% commission)</li>
                <li>Work completed but rejected due to change in client requirements</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>8.4 Dispute Resolution:</strong> All refund disputes are handled through our internal mediation process before escalation to external authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">Users are prohibited from:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Circumventing platform payment systems</li>
                <li>Creating false or misleading profiles</li>
                <li>Engaging in fraudulent activities</li>
                <li>Harassing or discriminating against other users</li>
                <li>Violating intellectual property rights</li>
                <li>Posting inappropriate or illegal content</li>
                <li>Attempting to manipulate platform algorithms or ratings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                <strong>10.1 Platform Content:</strong> Afrilance retains all rights to platform design, features, and content.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>10.2 User Content:</strong> Users retain ownership of content they create but grant Afrilance limited rights to display and promote their work on the platform.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>10.3 Work Product:</strong> Rights to completed work are transferred to clients upon full payment, unless otherwise agreed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Afrilance's liability is limited to the maximum extent permitted by South African law. We are not liable for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Actions or omissions of freelancers or clients</li>
                <li>Technical issues beyond our reasonable control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of South Africa. Any disputes will be resolved in the courts of South Africa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. Users will be notified of significant changes via email and platform notifications. Continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Afrilance (Pty) Ltd</strong></p>
                <p className="text-gray-700">Email: legal@afrilance.co.za</p>
                <p className="text-gray-700">Support: support@afrilance.co.za</p>
                <p className="text-gray-700">Phone: +27 (0) 11 123 4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;