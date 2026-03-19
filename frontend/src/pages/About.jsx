import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    // Initialize WOW.js if available globally
    if (window.WOW) {
      const wow = new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: true,
        live: true
      });
      wow.init();
    }

    // Remove spinner after page load
    const spinner = document.getElementById('spinner');
    if (spinner) {
      setTimeout(() => {
        spinner.classList.remove('show');
      }, 1000);
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Page Header Start */}
      <div className="container-fluid page-header mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">About Us</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">About Us</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="about-img position-relative overflow-hidden p-5 pe-0">
                <img className="img-fluid w-100" src="about.png" alt="About" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="display-5 mb-4">Premium Quality Fresh Onions You Can Trust</h1>
              <p className="mb-4">At TM Onions, we deliver farm-fresh, high-quality onions sourced directly from trusted growers. Our focus is on freshness, consistent quality, and reliable supply to meet the demands of wholesalers, retailers, and export markets.</p>
              <p><i className="fa fa-check text-primary me-3"></i>Carefully selected and graded for superior quality</p>
              <p><i className="fa fa-check text-primary me-3"></i>Long shelf life with rich taste and freshness</p>
              <p><i className="fa fa-check text-primary me-3"></i>Reliable bulk supply with timely delivery</p>
              <Link className="btn btn-primary rounded-pill py-3 px-5 mt-3" to="/our-products">Explore Products</Link>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Firm Visit Start */}
      <div className="container-fluid bg-primary bg-icon mt-5 py-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-md-7 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="display-5 text-white mb-3">Visit Our Firm</h1>
              <p className="text-white mb-0">We welcome you to experience TM Onions firsthand. Visit our facility to see how we source, sort, and pack high-quality onions with care and precision. Our team ensures every batch meets the highest standards of freshness and quality before reaching our customers.</p>
            </div>
            <div className="col-md-5 text-md-end wow fadeIn" data-wow-delay="0.5s">
              <Link className="btn btn-lg btn-secondary rounded-pill py-3 px-5" to="/contact">Visit Now</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Firm Visit End */}

      {/* Feature Start */}
      <div className="container-fluid bg-light bg-icon py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Our Features</h1>
            <p>Delivering quality, freshness, and reliability through every stage—from farm sourcing to final delivery.</p>
          </div>
          <div className="row g-4">
            {[1, 2, 3].map((item, index) => (
              <div key={index} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`}>
                <div className="bg-white text-center h-100 p-4 p-xl-5">
                  <img className="img-fluid mb-4" src={`icon-${item}.png`} alt="Feature" />
                  <h4 className="mb-3">
                    {item === 1 && 'Farm Fresh Sourcing'}
                    {item === 2 && 'Premium Quality Produce'}
                    {item === 3 && 'Safe & Reliable Supply'}
                  </h4>
                  <p className="mb-4">
                    {item === 1 && 'We source onions directly from trusted farmers, ensuring natural growth, better quality, and consistent supply.'}
                    {item === 2 && 'Each batch is carefully selected and graded to meet high standards of freshness, size, and durability.'}
                    {item === 3 && 'We follow proper handling and packaging practices to ensure safe delivery and long shelf life.'}
                  </p>
                  <Link className="btn btn-outline-primary border-2 py-2 px-4 rounded-pill" to="/feature">Read More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Feature End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default About;