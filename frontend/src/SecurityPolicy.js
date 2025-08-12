import React from 'react';

const SecurityPolicy = ({ setCurrentPage }) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Capabilities and Payment Card Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Afrilance is committed to maintaining the highest standards of security for all user data and financial transactions. This Security Policy outlines our comprehensive security measures, payment card handling procedures, and data protection capabilities.
              </p>
              <p className="text-gray-700 mb-4">
                We comply with industry standards including PCI DSS, South African banking regulations, and international cybersecurity best practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Platform Security Architecture</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Infrastructure Security</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Cloud Security:</strong> Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA</li>
                <li><strong>Network Protection:</strong> Advanced firewalls, DDoS protection, and intrusion detection systems</li>
                <li><strong>Load Balancing:</strong> Distributed architecture to prevent single points of failure</li>
                <li><strong>Regular Updates:</strong> Automated security patches and system updates</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Application Security</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Secure Coding:</strong> OWASP Top 10 compliance and secure development practices</li>
                <li><strong>Input Validation:</strong> Comprehensive validation and sanitization of all user inputs</li>
                <li><strong>SQL Injection Protection:</strong> Parameterized queries and prepared statements</li>
                <li><strong>Cross-Site Scripting (XSS) Prevention:</strong> Content Security Policy and output encoding</li>
                <li><strong>CSRF Protection:</strong> Anti-CSRF tokens for all state-changing operations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Encryption and Protection</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Data in Transit</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>TLS 1.3 Encryption:</strong> All data transmission secured with latest TLS protocols</li>
                <li><strong>HTTPS Everywhere:</strong> Mandatory encrypted connections for all platform interactions</li>
                <li><strong>Certificate Pinning:</strong> Protection against man-in-the-middle attacks</li>
                <li><strong>Perfect Forward Secrecy:</strong> Ensures past communications remain secure</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Data at Rest</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>AES-256 Encryption:</strong> Military-grade encryption for stored sensitive data</li>
                <li><strong>Database Encryption:</strong> Encrypted databases with secure key management</li>
                <li><strong>File System Encryption:</strong> Full disk encryption for all storage systems</li>
                <li><strong>Backup Encryption:</strong> Encrypted backups with geographically distributed storage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Payment Card Data Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 PCI DSS Compliance</h3>
              <p className="text-gray-700 mb-4">
                Afrilance maintains Level 1 PCI DSS (Payment Card Industry Data Security Standard) compliance:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Secure Network:</strong> Firewalls and network segmentation protect cardholder data</li>
                <li><strong>Data Protection:</strong> Cardholder data is encrypted using strong cryptography</li>
                <li><strong>Vulnerability Management:</strong> Regular security testing and vulnerability assessments</li>
                <li><strong>Access Control:</strong> Restricted access to cardholder data on need-to-know basis</li>
                <li><strong>Network Monitoring:</strong> Continuous monitoring and testing of security systems</li>
                <li><strong>Information Security:</strong> Comprehensive security policies and procedures</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Card Data Handling</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Tokenization:</strong> Payment card numbers are replaced with secure tokens</li>
                <li><strong>No Storage:</strong> We do not store sensitive authentication data (CVV, PIN)</li>
                <li><strong>Encrypted Transmission:</strong> All card data transmitted via encrypted channels</li>
                <li><strong>Secure Processing:</strong> Payment processing through certified third-party providers</li>
                <li><strong>Data Minimization:</strong> Only essential card data is collected and processed</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Payment Security Features</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>3D Secure:</strong> Additional authentication layer for online card transactions</li>
                <li><strong>Fraud Detection:</strong> Real-time transaction monitoring and risk assessment</li>
                <li><strong>Secure Wallets:</strong> Integration with secure digital wallet services</li>
                <li><strong>Two-Factor Authentication:</strong> Additional security for high-value transactions</li>
                <li><strong>Transaction Limits:</strong> Configurable limits to prevent unauthorized large transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. User Authentication and Access Control</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Multi-Factor Authentication</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Email Verification:</strong> Required for account creation and sensitive operations</li>
                <li><strong>SMS Authentication:</strong> Optional SMS-based two-factor authentication</li>
                <li><strong>Authenticator Apps:</strong> Support for TOTP-based authentication apps</li>
                <li><strong>Biometric Options:</strong> Device-based biometric authentication where supported</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Password Security</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Strong Requirements:</strong> Minimum 8 characters with complexity requirements</li>
                <li><strong>Secure Hashing:</strong> Passwords encrypted using bcrypt with salt</li>
                <li><strong>Breach Protection:</strong> Passwords checked against known breach databases</li>
                <li><strong>Regular Updates:</strong> Periodic password change recommendations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Session Management</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Secure Tokens:</strong> JWT tokens with short expiration periods</li>
                <li><strong>Session Timeout:</strong> Automatic logout after periods of inactivity</li>
                <li><strong>Device Tracking:</strong> Monitoring of login locations and devices</li>
                <li><strong>Concurrent Sessions:</strong> Control over multiple active sessions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Fraud Prevention and Detection</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Real-Time Monitoring</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Behavioral Analysis:</strong> Machine learning algorithms detect unusual patterns</li>
                <li><strong>Transaction Monitoring:</strong> Real-time analysis of payment transactions</li>
                <li><strong>Account Activity:</strong> Monitoring for suspicious account behaviors</li>
                <li><strong>IP Geolocation:</strong> Tracking and analyzing login locations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Risk Assessment</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Risk Scoring:</strong> Dynamic risk scoring for users and transactions</li>
                <li><strong>Device Fingerprinting:</strong> Unique device identification and tracking</li>
                <li><strong>Velocity Checks:</strong> Monitoring transaction frequency and amounts</li>
                <li><strong>Blacklist Management:</strong> Maintaining databases of known fraudulent entities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Incident Response and Security Monitoring</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Security Operations Center (SOC)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>24/7 Monitoring:</strong> Continuous security monitoring and threat detection</li>
                <li><strong>Automated Alerts:</strong> Real-time notifications for security events</li>
                <li><strong>Incident Response:</strong> Rapid response team for security incidents</li>
                <li><strong>Forensic Analysis:</strong> Detailed investigation capabilities for security events</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Incident Response Process</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Detection:</strong> Automated and manual detection of security incidents</li>
                <li><strong>Classification:</strong> Severity assessment and incident categorization</li>
                <li><strong>Containment:</strong> Immediate actions to limit incident impact</li>
                <li><strong>Investigation:</strong> Thorough analysis of incident cause and scope</li>
                <li><strong>Recovery:</strong> System restoration and security enhancement</li>
                <li><strong>Communication:</strong> Timely notification to affected users and authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Compliance and Certifications</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Industry Standards</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>PCI DSS Level 1:</strong> Highest level of payment card industry compliance</li>
                <li><strong>ISO 27001:</strong> Information security management system certification</li>
                <li><strong>SOC 2 Type II:</strong> Service organization controls for security and availability</li>
                <li><strong>GDPR:</strong> General Data Protection Regulation compliance</li>
                <li><strong>POPIA:</strong> Protection of Personal Information Act compliance</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Regular Assessments</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Penetration Testing:</strong> Quarterly external security assessments</li>
                <li><strong>Vulnerability Scanning:</strong> Continuous automated security scanning</li>
                <li><strong>Code Reviews:</strong> Regular security-focused code audits</li>
                <li><strong>Third-Party Audits:</strong> Independent security assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Data Backup and Recovery</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Automated Backups:</strong> Regular automated backups of all critical data</li>
                <li><strong>Geographic Distribution:</strong> Backups stored in multiple geographic locations</li>
                <li><strong>Encryption:</strong> All backups encrypted with strong encryption algorithms</li>
                <li><strong>Recovery Testing:</strong> Regular testing of backup restoration procedures</li>
                <li><strong>RTO/RPO:</strong> Recovery Time Objective of 4 hours, Recovery Point Objective of 1 hour</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Employee Security Training</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Security Awareness:</strong> Regular security training for all employees</li>
                <li><strong>Phishing Prevention:</strong> Simulated phishing attacks and education</li>
                <li><strong>Access Management:</strong> Role-based access control and regular reviews</li>
                <li><strong>Background Checks:</strong> Comprehensive screening for security-sensitive roles</li>
                <li><strong>Confidentiality:</strong> Signed confidentiality and security agreements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. User Security Best Practices</h2>
              <p className="text-gray-700 mb-4">
                We recommend users follow these security practices:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Strong Passwords:</strong> Use unique, complex passwords for your Afrilance account</li>
                <li><strong>Two-Factor Authentication:</strong> Enable 2FA for additional account security</li>
                <li><strong>Secure Connections:</strong> Always access Afrilance from secure, trusted networks</li>
                <li><strong>Regular Updates:</strong> Keep your devices and browsers updated</li>
                <li><strong>Phishing Awareness:</strong> Be cautious of suspicious emails or messages</li>
                <li><strong>Account Monitoring:</strong> Regularly review account activity and transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Security Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For security-related concerns or to report security vulnerabilities:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Security Team</strong></p>
                <p className="text-gray-700"><strong>Afrilance (Pty) Ltd</strong></p>
                <p className="text-gray-700">Email: security@afrilance.co.za</p>
                <p className="text-gray-700">Emergency: security-emergency@afrilance.co.za</p>
                <p className="text-gray-700">Phone: +27 (0) 11 123 4567 (24/7 Security Hotline)</p>
                <p className="text-gray-700 mt-2">
                  <strong>Responsible Disclosure:</strong><br/>
                  We welcome responsible disclosure of security vulnerabilities. Please contact our security team for our vulnerability disclosure policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Policy Updates</h2>
              <p className="text-gray-700 mb-4">
                This Security Policy is reviewed and updated regularly to address new threats and maintain compliance with evolving security standards. Users will be notified of significant changes via email and platform notifications.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;