import React from 'react';
import '../assets/css/service.css'; // We'll create this CSS file next

const ServicesPage = () => {
  // Sample data for services
  const services = [
    {
      id: 1,
      icon: '🚚',
      title: 'Farm Fresh Delivery',
      description: 'Get freshly harvested fruits and vegetables delivered to your doorstep within 24 hours of picking.',
    },
    {
      id: 2,
      icon: '🌱',
      title: 'Organic Guarantee',
      description: 'We partner with certified organic farms to bring you chemical-free, healthy produce.',
    },
    {
      id: 3,
      icon: '⏱️',
      title: 'Schedule Your Slot',
      description: 'Choose your preferred delivery time. Morning or evening, we deliver when it\'s convenient for you.',
    },
    {
      id: 4,
      icon: '💎',
      title: 'Premium Quality',
      description: 'Every item is handpicked and quality-checked to ensure you get the best produce every time.',
    },
    {
      id: 5,
      icon: '🔄',
      title: 'Easy Returns',
      description: 'Not satisfied with the quality? We offer a no-questions-asked refund or replacement policy.',
    },
    {
      id: 6,
      icon: '📦',
      title: 'Monthly Subscription',
      description: 'Subscribe to our fruit & veggie boxes and enjoy exclusive discounts and surprise gifts.',
    },
  ];

  // How it works steps
  const steps = [
    {
      id: 1,
      icon: '🛒',
      title: 'Choose Items',
      description: 'Browse and select from 100+ fresh fruits & vegetables.',
    },
    {
      id: 2,
      icon: '📅',
      title: 'Pick a Slot',
      description: 'Select your preferred delivery date and time.',
    },
    {
      id: 3,
      icon: '💳',
      title: 'Easy Payment',
      description: 'Pay securely via UPI, card, or cash on delivery.',
    },
    {
      id: 4,
      icon: '🏠',
      title: 'Get Delivery',
      description: 'Fresh produce delivered right to your doorstep.',
    },
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Our Services</h1>
          <p className="hero-subtitle">
            From farm to fork – we bring the freshest fruits and vegetables straight to your table
          </p>
          <button className="hero-cta">Explore Services</button>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="services-main">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What We Offer</h2>
            <p className="section-description">
              We're committed to providing the highest quality produce and exceptional service
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <a href="#" className="service-link">
                  Learn More <span className="arrow">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header light">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Fresh produce in just 4 simple steps
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="step-card">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-number">0{step.id}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Special Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🌿</div>
              <h3>100% Organic Options</h3>
              <p>Choose from a wide range of certified organic fruits and vegetables</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Express Delivery</h3>
              <p>Get your order in as fast as 2 hours in select locations</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎁</div>
              <h3>Gift Boxes</h3>
              <p>Curated fruit baskets perfect for every occasion</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Easy Reordering</h3>
              <p>Save your favorites and reorder with just one tap</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to experience freshness?</h2>
          <p className="cta-text">
            Join thousands of happy customers who get fresh fruits and vegetables delivered daily
          </p>
          <div className="cta-buttons">
            <button className="cta-primary">Shop Now</button>
            <button className="cta-secondary">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;