import React from 'react';
import '../assets/css/privacypolicy.css'; // We'll create this CSS file next

const PrivacyPolicy = () => {
  // Data for key highlights/summary cards
  const policyHighlights = [
    {
      id: 1,
      icon: '🔒',
      title: 'Data Protection',
      description: 'Your data is secure with us',
    },
    {
      id: 2,
      icon: '🍪',
      title: 'Cookies Used',
      description: 'To enhance your browsing experience',
    },
    {
      id: 3,
      icon: '🚫',
      title: 'No Data Selling',
      description: 'We never sell your personal information',
    },
    {
      id: 4,
      icon: '⚖️',
      title: 'DPDP Act Compliant',
      description: 'Following Indian data protection laws',
    },
  ];

  // Main policy sections
  const sections = [
    {
      id: 1,
      title: '1. Introduction',
      content:
        'Welcome to tmonion.com. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products (pineapples and onions). This policy complies with the applicable data protection regulations in India, including the Digital Personal Data Protection (DPDP) Act, 2023.',
      highlight: 'We are committed to protecting your privacy and complying with Indian data protection laws.',
    },
    {
      id: 2,
      title: '2. Information We Collect',
      content: (
        <>
          <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise contact us. The personal information we collect may include:</p>
          <ul className="policy-list">
            <li><strong>Contact Information:</strong> Name, email address, phone number, and delivery address.</li>
            <li><strong>Payment Information:</strong> Payment details (processed securely through our third-party payment gateways; we do not store your full credit card or UPI details).</li>
            <li><strong>Account Data:</strong> Username and password if you create an account with us.</li>
            <li><strong>Automatically Collected Data:</strong> IP address, browser type, device characteristics, operating system, and data on how you interact with our website.</li>
          </ul>
        </>
      ),
      highlight: 'We only collect information necessary to provide you with our services.',
    },
    {
      id: 3,
      title: '3. How We Use Your Information',
      content: (
        <>
          <p>We use the personal information we collect for the following purposes:</p>
          <ul className="policy-list">
            <li>To process and fulfill your orders, including delivery of perishable goods.</li>
            <li>To communicate with you regarding your order status, returns, or customer service inquiries.</li>
            <li>To send administrative information, such as updates to our terms, conditions, and policies.</li>
            <li>To improve our website functionality, user experience, and product offerings.</li>
            <li>To comply with our legal obligations and resolve any disputes.</li>
          </ul>
        </>
      ),
      highlight: 'Your data helps us serve you better and fulfill your orders efficiently.',
    },
    {
      id: 4,
      title: '4. Cookies and Tracking Technologies',
      content:
        'We may use cookies, web beacons, and similar tracking technologies to access or store information. Cookies help us understand how you use our site and allow us to remember your preferences (such as items placed in your shopping cart). You can choose to disable cookies through your browser settings, but this may affect your ability to use certain features of our website.',
      highlight: 'Cookies enhance your experience. You can control them through your browser.',
    },
    {
      id: 5,
      title: '5. How We Share Your Information',
      content: (
        <>
          <p>We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following situations:</p>
          <ul className="policy-list">
            <li><strong>Service Providers:</strong> We may share data with third-party vendors, delivery partners, and payment processors who perform services for us or on our behalf.</li>
            <li><strong>Legal Compliance:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable laws, governmental requests, or court orders.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, sale of company assets, or acquisition, your information may be transferred.</li>
          </ul>
        </>
      ),
      highlight: 'We never sell your data. Sharing is limited to essential services and legal requirements.',
    },
    {
      id: 6,
      title: '6. Data Security and Retention',
      content:
        'We implement reasonable and appropriate technical and organizational security measures to protect the security of your personal data. However, please remember that no method of transmission over the internet or electronic storage is 100% secure. We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax or accounting requirements).',
      highlight: 'We retain your data only as long as necessary and protect it with industry-standard security.',
    },
    {
      id: 7,
      title: '7. Your Rights (Data Principal Rights)',
      content: (
        <>
          <p>In accordance with the DPDP Act, you have the following rights regarding your personal data:</p>
          <ul className="policy-list">
            <li>The right to access and know what personal data we have collected about you.</li>
            <li>The right to request the correction of inaccurate or incomplete data.</li>
            <li>The right to request the erasure/deletion of your personal data when it is no longer necessary for the purpose it was collected.</li>
            <li>The right to withdraw your consent for data processing at any time.</li>
          </ul>
        </>
      ),
      highlight: 'You have full control over your personal data. Contact us to exercise your rights.',
    },
    {
      id: 8,
      title: '8. Third-Party Websites',
      content:
        'Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or the content of these third-party sites. We encourage you to read the privacy policies of any linked websites you visit.',
      highlight: 'We\'re not responsible for third-party sites. Please review their policies separately.',
    },
    {
      id: 9,
      title: '9. Changes to This Privacy Policy',
      content:
        'We may update this Privacy Policy from time to time to reflect changes in our practices or relevant laws. The updated version will be indicated by an updated "Last Updated" date at the top of this document. We encourage you to review this Privacy Policy frequently.',
      highlight: 'Check back periodically for updates. We\'ll notify you of material changes.',
    },
    {
      id: 10,
      title: '10. Grievance Officer & Contact Information',
      content: (
        <>
          <p>If you have any questions, concerns, or wish to exercise your data rights, you may contact our Grievance Officer using the details below:</p>
          <div className="contact-details-card">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:info@tmonion.com" className="contact-link">
                  info@tmonion.com
                </a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <strong>Phone:</strong>{' '}
                <a href="tel:+918281149617" className="contact-link">
                  +91 8281149617
                </a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Address:</strong> Room. P1/4, Bypass road, Eec market
              </div>
            </div>
          </div>
        </>
      ),
      highlight: 'Our Grievance Officer is ready to assist you with any privacy concerns.',
    },
  ];

  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Your privacy is important to us. Learn how we protect and manage your personal data.
          </p>
          <div className="hero-meta">
            <span className="last-updated">Last Updated: March 17, 2026</span>
            <span className="badge">DPDP Act Compliant</span>
          </div>
        </div>
      </section>

      {/* Highlights Cards */}
      <section className="highlights-section">
        <div className="container">
          <div className="highlights-grid">
            {policyHighlights.map((item) => (
              <div key={item.id} className="highlight-card">
                <div className="highlight-icon">{item.icon}</div>
                <h3 className="highlight-title">{item.title}</h3>
                <p className="highlight-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Policy Content */}
      <section className="policy-content-section">
        <div className="container">
          <div className="policy-container">
            {/* Sidebar Navigation */}
            <div className="policy-sidebar">
              <div className="sidebar-sticky">
                <h3 className="sidebar-title">📋 Policy Sections</h3>
                <ul className="sidebar-nav">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#section-${section.id}`} className="sidebar-link">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="sidebar-note">
                  <p>
                    <strong>🔒 Your Rights:</strong> Under the DPDP Act, you have the right to access, correct, and delete your personal data.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="policy-main">
              {sections.map((section) => (
                <div key={section.id} id={`section-${section.id}`} className="policy-section">
                  <h2 className="policy-section-title">{section.title}</h2>
                  <div className="policy-section-content">
                    {typeof section.content === 'string' ? <p>{section.content}</p> : section.content}
                  </div>
                  <div className="policy-highlight">
                    <span className="highlight-icon">📌</span>
                    <span className="highlight-text">{section.highlight}</span>
                  </div>
                </div>
              ))}

              {/* Consent Acknowledgement */}
              <div className="consent-box">
                <h3>By using tmonion.com, you consent to our Privacy Policy</h3>
                <p>
                  We're committed to protecting your privacy and being transparent about how we use your data.
                  If you have any questions, please don't hesitate to contact us.
                </p>
                <button className="btn-print" onClick={() => window.print()}>
                  🖨️ Print Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="quick-contact">
        <div className="container">
          <div className="quick-contact-content">
            <span className="quick-contact-text">Have privacy concerns or want to exercise your rights?</span>
            <a href="mailto:info@tmonion.com?subject=Privacy%20Policy%20Inquiry" className="quick-contact-button">
              Contact Grievance Officer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;