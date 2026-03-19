import React from 'react';
import '../assets/css/termsandconditions.css'; // We'll create this CSS file next

const TermsAndConditions = () => {
  // Data for quick summary cards
  const summaryCards = [
    {
      id: 1,
      icon: '📜',
      title: 'Acceptance',
      description: 'By using our site, you agree to these terms',
    },
    {
      id: 2,
      icon: '🍍',
      title: 'Fresh Products',
      description: 'Natural variations in produce are expected',
    },
    {
      id: 3,
      icon: '💰',
      title: 'Payments',
      description: 'Full payment required before dispatch',
    },
    {
      id: 4,
      icon: '🚚',
      title: '24h Report',
      description: 'Report issues within 24 hours of delivery',
    },
  ];

  // Sections content organized for easy maintenance
  const sections = [
    {
      id: 1,
      title: '1. Introduction and Acceptance of Terms',
      content:
        'Welcome to tmonion.com. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing tmonion.com or placing an order, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our website.',
      highlight: 'By using this site, you accept these terms.',
    },
    {
      id: 2,
      title: '2. Product Descriptions and Quality',
      content:
        'We specialize in providing fresh agricultural products, specifically pineapples and onions. Because these are natural, perishable goods, slight variations in size, weight, color, and appearance are normal and expected. While we strive to display our products as accurately as possible, images on the website are for illustrative purposes only. All products are subject to availability, and we reserve the right to limit quantities or discontinue products without prior notice.',
      highlight: 'Natural variations in size, weight, and color are normal.',
    },
    {
      id: 3,
      title: '3. Pricing and Payments',
      content:
        'All prices listed on tmonion.com are subject to change without notice. The price charged will be the price in effect at the time your order is placed. We accept standard payment methods including UPI, Credit/Debit Cards, and Net Banking. Full payment must be received and verified before your order is processed and dispatched for delivery.',
      highlight: 'Prices subject to change. Full payment required before dispatch.',
    },
    {
      id: 4,
      title: '4. Shipping and Delivery',
      content:
        "We aim to deliver your fresh produce as efficiently as possible to maintain its quality. Because our products are highly perishable, it is your responsibility to ensure that someone is available to receive the package at the provided delivery address. We are not liable for any spoilage, degradation of quality, or theft that occurs if a delivery is missed, if the address provided is incorrect, or if the package is left outside for an extended period.",
      highlight: 'Ensure someone is available to receive the delivery.',
    },
    {
      id: 5,
      title: '5. Returns, Refunds, and Replacements',
      content:
        'Due to health, safety, and the perishable nature of fresh pineapples and onions, we do not accept physical returns of our products.\n\n• Damaged or Spoiled Goods: If your produce arrives damaged, spoiled, or in an unacceptable condition, you must contact our customer service team within 24 hours of delivery. You must provide clear photographic evidence of the damaged goods and your order number.\n\n• Resolution: Upon verifying your claim, we will provide a full refund, store credit, or a replacement at our discretion.\n\n• Cancellations: Orders may only be canceled before they have been dispatched. Once an order has left our facility, it cannot be canceled or refunded.',
      highlight: 'Report issues within 24 hours with photo evidence.',
    },
    {
      id: 6,
      title: '6. User Accounts',
      content:
        'If you create an account on tmonion.com, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the registration and checkout process.',
      highlight: 'You are responsible for your account security.',
    },
    {
      id: 7,
      title: '7. Intellectual Property',
      content:
        'All content on tmonion.com, including text, graphics, logos, images, and software, is the property of tmonion.com or its content suppliers and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or use our content for commercial purposes without our express written consent.',
      highlight: 'Content may not be reproduced without consent.',
    },
    {
      id: 8,
      title: '8. Limitation of Liability',
      content:
        'To the maximum extent permitted by law, tmonion.com and its owners, employees, or affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or the consumption of our products. In any event, our total liability to you for any claim arising out of your purchase shall not exceed the total amount you paid for the specific order in question.',
      highlight: 'Liability limited to order amount.',
    },
    {
      id: 9,
      title: '9. Governing Law and Dispute Resolution',
      content:
        'These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Jaipur, Rajasthan.',
      highlight: 'Disputes subject to Jaipur jurisdiction.',
    },
    {
      id: 10,
      title: '10. Contact Information',
      content: (
        <>
          If you have any questions, concerns, or need to report an issue with your order, please contact us at:
          <br />
          <br />
          <strong>Email:</strong>{' '}
          <a href="mailto:info@tmonion.com" className="contact-link">
            info@tmonion.com
          </a>
          <br />
          <strong>Phone:</strong>{' '}
          <a href="tel:+918281149617" className="contact-link">
            +91 8281149617
          </a>
          <br />
          <strong>Address:</strong> Room. P1/4, Bypass road, Eec market
        </>
      ),
      highlight: "We're here to help! Reach out anytime.",
    },
  ];

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <section className="terms-hero">
        <div className="hero-content">
          <h1 className="hero-title">Terms & Conditions</h1>
          <p className="hero-subtitle">
            Please read these terms carefully before using tmonion.com or placing an order
          </p>
          <div className="hero-meta">
            <span className="last-updated">Last Updated: March 2026</span>
            <span className="read-time">⏱️ 5 min read</span>
          </div>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section className="summary-section">
        <div className="container">
          <div className="summary-grid">
            {summaryCards.map((card) => (
              <div key={card.id} className="summary-card">
                <div className="summary-icon">{card.icon}</div>
                <h3 className="summary-title">{card.title}</h3>
                <p className="summary-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Terms Content */}
      <section className="terms-content-section">
        <div className="container">
          <div className="terms-container">
            <div className="terms-sidebar">
              <div className="sidebar-sticky">
                <h3 className="sidebar-title">Quick Navigation</h3>
                <ul className="sidebar-nav">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#section-${section.id}`} className="sidebar-link">
                        {section.title.split('. ')[1] || section.title}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="sidebar-note">
                  <p>
                    <strong>📌 Important:</strong> By using tmonion.com, you agree to these terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="terms-main">
              {sections.map((section) => (
                <div key={section.id} id={`section-${section.id}`} className="terms-section">
                  <h2 className="terms-section-title">{section.title}</h2>
                  <div className="terms-section-content">
                    <p>{section.content}</p>
                  </div>
                  <div className="terms-highlight">
                    <span className="highlight-icon">📌</span>
                    <span className="highlight-text">{section.highlight}</span>
                  </div>
                </div>
              ))}

              {/* Acknowledgement Box */}
              <div className="terms-acknowledgement">
                <div className="acknowledgement-content">
                  <h3>By using tmonion.com, you acknowledge that:</h3>
                  <ul>
                    <li>You have read and understood these Terms and Conditions</li>
                    <li>You agree to be bound by these terms</li>
                    <li>You are responsible for providing accurate delivery information</li>
                    <li>You understand the perishable nature of our products</li>
                  </ul>
                  <div className="acknowledgement-buttons">
                    <button className="btn-agree">I Agree to Terms</button>
                    <button className="btn-print" onClick={() => window.print()}>
                      🖨️ Print Terms
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section className="contact-bar">
        <div className="container">
          <div className="contact-bar-content">
            <span className="contact-bar-text">Have questions about our terms?</span>
            <div className="contact-bar-actions">
              <a href="mailto:info@tmonion.com" className="contact-bar-link">
                📧 info@tmonion.com
              </a>
              <a href="tel:+918281149617" className="contact-bar-link">
                📞 +91 8281149617
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;