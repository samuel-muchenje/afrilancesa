import React from 'react';

const DeliveryPolicy = ({ setCurrentPage }) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Service Delivery Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                This Service Delivery Policy outlines how services purchased through Afrilance are made available to clients, delivery timelines, service availability, and the processes that govern the delivery of freelance services on our platform.
              </p>
              <p className="text-gray-700 mb-4">
                Unlike traditional e-commerce platforms that deliver physical products, Afrilance facilitates the delivery of digital services, consultations, and project-based work performed by verified South African freelancers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Types of Services and Delivery Methods</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Digital Services</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Web Development:</strong> Websites, applications, and digital solutions</li>
                <li><strong>Graphic Design:</strong> Logos, branding materials, marketing collateral</li>
                <li><strong>Content Creation:</strong> Articles, blog posts, social media content</li>
                <li><strong>Digital Marketing:</strong> SEO, social media management, advertising campaigns</li>
                <li><strong>Software Development:</strong> Custom applications, scripts, and software solutions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Consultation Services</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Professional Consulting:</strong> Business, legal, financial, and technical advice</li>
                <li><strong>Coaching and Training:</strong> Skills development and professional coaching</li>
                <li><strong>Strategy Sessions:</strong> Business planning and strategic consulting</li>
                <li><strong>Technical Support:</strong> IT support and technical troubleshooting</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Project-Based Work</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Research Projects:</strong> Market research, data analysis, academic research</li>
                <li><strong>Creative Projects:</strong> Video production, photography, creative writing</li>
                <li><strong>Translation Services:</strong> Document translation and localization</li>
                <li><strong>Administrative Tasks:</strong> Virtual assistance, data entry, project management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Service Availability and Access</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Immediate Access Services</h3>
              <p className="text-gray-700 mb-4">
                The following services are available immediately upon payment confirmation:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Platform Access:</strong> Full access to platform features and freelancer profiles</li>
                <li><strong>Communication Tools:</strong> Messaging system and project management tools</li>
                <li><strong>Support Services:</strong> Customer support and platform assistance</li>
                <li><strong>Account Features:</strong> Dashboard, payment history, and account management</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Scheduled Services</h3>
              <p className="text-gray-700 mb-4">
                Services requiring freelancer scheduling:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Consultation Calls:</strong> Available within freelancer's business hours</li>
                <li><strong>Live Sessions:</strong> Scheduled based on mutual availability</li>
                <li><strong>Training Sessions:</strong> Coordinated between client and freelancer</li>
                <li><strong>Technical Support:</strong> Available during specified support hours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Delivery Timelines</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Standard Delivery Times</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 font-semibold">Service Category Delivery Guidelines:</p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Simple Logo Design:</strong> 2-5 business days</li>
                <li><strong>Website Development (5 pages):</strong> 7-14 business days</li>
                <li><strong>Content Writing (1000 words):</strong> 1-3 business days</li>
                <li><strong>Social Media Management (monthly):</strong> Ongoing with daily deliverables</li>
                <li><strong>Mobile App Development:</strong> 30-90 business days (depending on complexity)</li>
                <li><strong>Consultation Services:</strong> Scheduled within 1-7 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Expedited Delivery Options</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Rush Orders:</strong> 24-48 hour delivery (additional 50% fee applies)</li>
                <li><strong>Priority Support:</strong> Same-day response guarantee</li>
                <li><strong>Express Consultation:</strong> Within 24 hours of booking</li>
                <li><strong>Emergency Services:</strong> Available for critical business needs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Factors Affecting Delivery Time</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Project Complexity:</strong> More complex projects require additional time</li>
                <li><strong>Client Feedback:</strong> Revision cycles may extend delivery timelines</li>
                <li><strong>Freelancer Availability:</strong> Popular freelancers may have longer lead times</li>
                <li><strong>Public Holidays:</strong> South African public holidays may affect delivery</li>
                <li><strong>Technical Requirements:</strong> Specialized skills may require longer preparation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Service Delivery Process</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Pre-Delivery Phase</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Project Briefing:</strong> Client provides detailed requirements and expectations</li>
                <li><strong>Scope Confirmation:</strong> Freelancer confirms understanding and deliverables</li>
                <li><strong>Timeline Agreement:</strong> Mutual agreement on delivery milestones</li>
                <li><strong>Payment Processing:</strong> Escrow payment setup and confirmation</li>
                <li><strong>Project Initiation:</strong> Official project start notification</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 During Delivery</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Progress Updates:</strong> Regular updates on project progress</li>
                <li><strong>Milestone Reviews:</strong> Client review and approval of key milestones</li>
                <li><strong>Communication:</strong> Ongoing communication through platform messaging</li>
                <li><strong>Quality Assurance:</strong> Freelancer quality checks and testing</li>
                <li><strong>Client Feedback:</strong> Incorporation of client feedback and revisions</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Final Delivery</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Delivery Submission:</strong> Freelancer submits completed work</li>
                <li><strong>Client Review:</strong> 7-day review period for client evaluation</li>
                <li><strong>Revision Requests:</strong> Client can request reasonable revisions</li>
                <li><strong>Final Approval:</strong> Client approves completed work</li>
                <li><strong>Payment Release:</strong> Automatic payment release to freelancer</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Digital Delivery Methods</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Platform-Based Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>File Upload System:</strong> Secure file sharing through platform</li>
                <li><strong>Project Gallery:</strong> Visual portfolio of completed work</li>
                <li><strong>Version Control:</strong> Track different versions and revisions</li>
                <li><strong>Download Links:</strong> Secure download links for large files</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 External Delivery Methods</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Email Delivery:</strong> Final deliverables sent via secure email</li>
                <li><strong>Cloud Storage:</strong> Google Drive, Dropbox, or similar platforms</li>
                <li><strong>Live Websites:</strong> Direct deployment to client's hosting</li>
                <li><strong>Software Installation:</strong> Direct installation on client systems (where applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Consultation Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Video Calls:</strong> Zoom, Teams, or Google Meet sessions</li>
                <li><strong>Phone Consultations:</strong> Traditional phone or VoIP calls</li>
                <li><strong>In-Person Meetings:</strong> Face-to-face consultations (where applicable)</li>
                <li><strong>Written Reports:</strong> Detailed consultation reports and recommendations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Service Availability Hours</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Platform Availability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Website Access:</strong> 24/7 platform availability</li>
                <li><strong>Messaging System:</strong> Always available for asynchronous communication</li>
                <li><strong>File Downloads:</strong> 24/7 access to delivered files</li>
                <li><strong>Account Management:</strong> Always accessible self-service features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Freelancer Availability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Business Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM SAST</li>
                <li><strong>Extended Hours:</strong> Some freelancers offer evening and weekend availability</li>
                <li><strong>Time Zone Considerations:</strong> All times referenced in South African Standard Time</li>
                <li><strong>Holiday Schedule:</strong> Reduced availability during South African public holidays</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.3 Customer Support</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Live Support:</strong> Monday to Friday, 8:00 AM - 6:00 PM SAST</li>
                <li><strong>Email Support:</strong> 24/7 email support with 24-hour response guarantee</li>
                <li><strong>Emergency Support:</strong> Available for critical issues</li>
                <li><strong>Self-Service:</strong> 24/7 access to help documentation and FAQs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Quality Assurance and Delivery Standards</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Quality Standards</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Professional Quality:</strong> All deliverables meet professional industry standards</li>
                <li><strong>Client Requirements:</strong> Work must match agreed-upon specifications</li>
                <li><strong>Original Content:</strong> All work is original and free from plagiarism</li>
                <li><strong>Technical Standards:</strong> Deliverables meet technical requirements and best practices</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Revision Policy</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Included Revisions:</strong> Most projects include 2-3 rounds of revisions</li>
                <li><strong>Scope Limitations:</strong> Revisions must stay within original project scope</li>
                <li><strong>Additional Revisions:</strong> Extra revisions may incur additional charges</li>
                <li><strong>Revision Timeline:</strong> Clients have 7 days to request revisions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Delivery Delays and Issues</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Potential Causes of Delays</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Client Delays:</strong> Late feedback or approval from clients</li>
                <li><strong>Scope Changes:</strong> Modifications to original project requirements</li>
                <li><strong>Technical Issues:</strong> Unforeseen technical complications</li>
                <li><strong>Freelancer Availability:</strong> Illness or emergency situations</li>
                <li><strong>Force Majeure:</strong> Events beyond reasonable control</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 Delay Management</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Early Communication:</strong> Immediate notification of potential delays</li>
                <li><strong>Revised Timeline:</strong> Updated delivery schedule with new deadlines</li>
                <li><strong>Compensation Options:</strong> Possible discounts or additional services</li>
                <li><strong>Alternative Solutions:</strong> Backup freelancers or modified deliverables</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.3 Escalation Process</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Direct Communication:</strong> Client and freelancer attempt resolution</li>
                <li><strong>Platform Mediation:</strong> Afrilance customer support intervenes</li>
                <li><strong>Formal Dispute:</strong> Official dispute resolution process</li>
                <li><strong>Refund Consideration:</strong> Potential refund if resolution impossible</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Intellectual Property and File Ownership</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Work Product Ownership</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Client Ownership:</strong> Completed work belongs to client upon full payment</li>
                <li><strong>Source Files:</strong> Clients receive all source files and working documents</li>
                <li><strong>Usage Rights:</strong> Unlimited usage rights for business purposes</li>
                <li><strong>Portfolio Rights:</strong> Freelancers may showcase work in portfolios (with client permission)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.2 Delivery Format</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Multiple Formats:</strong> Deliverables provided in commonly used formats</li>
                <li><strong>Editable Files:</strong> Source files in editable formats when applicable</li>
                <li><strong>Web-Ready Files:</strong> Optimized files for web and digital use</li>
                <li><strong>Print-Ready Files:</strong> High-resolution files for printing when relevant</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Post-Delivery Support</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Warranty Period</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>30-Day Support:</strong> Free support for technical issues within 30 days</li>
                <li><strong>Bug Fixes:</strong> Free correction of any bugs or errors in delivered work</li>
                <li><strong>Minor Updates:</strong> Small updates and modifications included</li>
                <li><strong>Extended Support:</strong> Additional support packages available for purchase</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.2 Ongoing Services</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Maintenance Contracts:</strong> Ongoing maintenance and updates</li>
                <li><strong>Hosting Services:</strong> Web hosting and management services</li>
                <li><strong>Content Updates:</strong> Regular content updates and management</li>
                <li><strong>Training Services:</strong> Client training on delivered solutions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about service delivery or to report delivery issues:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Service Delivery Team</strong></p>
                <p className="text-gray-700"><strong>Afrilance (Pty) Ltd</strong></p>
                <p className="text-gray-700">Email: delivery@afrilance.co.za</p>
                <p className="text-gray-700">Support: support@afrilance.co.za</p>
                <p className="text-gray-700">Phone: +27 (0) 11 123 4567</p>
                <p className="text-gray-700">Business Hours: Monday to Friday, 8:00 AM - 6:00 PM SAST</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPolicy;