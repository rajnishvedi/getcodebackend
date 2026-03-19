import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
  // Features data array
  const featuresData = [
    {
      id: 1,
      icon: 'icon-1.png',
      title: 'Natural Process',
      description: 'Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed vero dolor duo.',
      delay: '0.1s'
    },
    {
      id: 2,
      icon: 'icon-2.png',
      title: 'Organic Products',
      description: 'Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed vero dolor duo.',
      delay: '0.3s'
    },
    {
      id: 3,
      icon: 'icon-3.png',
      title: 'Biologically Safe',
      description: 'Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed vero dolor duo.',
      delay: '0.5s'
    }
  ];

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
      <div className="container-fluid page-header wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">Features</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Features</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Feature Start */}
      <div className="container-fluid bg-light bg-icon py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Our Features</h1>
            <p>Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed rebum vero dolor duo.</p>
          </div>
          <div className="row g-4">
            {featuresData.map((feature) => (
              <div 
                key={feature.id} 
                className="col-lg-4 col-md-6 wow fadeInUp" 
                data-wow-delay={feature.delay}
              >
                <div className="bg-white text-center h-100 p-4 p-xl-5">
                  <img 
                    className="img-fluid mb-4" 
                    src={`${feature.icon}`} 
                    alt={feature.title} 
                  />
                  <h4 className="mb-3">{feature.title}</h4>
                  <p className="mb-4">{feature.description}</p>
                  <Link 
                    className="btn btn-outline-primary border-2 py-2 px-4 rounded-pill" 
                    to={`/feature/${feature.id}`}
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Feature End */}

      {/* Additional Content Section (optional) */}
      <div className="container-xxl py-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="about-img position-relative overflow-hidden p-5 pe-0">
                <img className="img-fluid w-100" src="about.png" alt="About Features" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="display-5 mb-4">Why Choose Our Features?</h1>
              <p className="mb-4">
                Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. 
                Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat amet.
              </p>
              <div className="row g-4">
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-check fa-2x text-primary flex-shrink-0 me-3"></i>
                    <div>
                      <h6 className="mb-1">100% Organic</h6>
                      <small>Certified Products</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-check fa-2x text-primary flex-shrink-0 me-3"></i>
                    <div>
                      <h6 className="mb-1">Natural Process</h6>
                      <small>Eco-friendly methods</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-check fa-2x text-primary flex-shrink-0 me-3"></i>
                    <div>
                      <h6 className="mb-1">Biologically Safe</h6>
                      <small>No harmful chemicals</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-check fa-2x text-primary flex-shrink-0 me-3"></i>
                    <div>
                      <h6 className="mb-1">Farm Fresh</h6>
                      <small>Direct from farm</small>
                    </div>
                  </div>
                </div>
              </div>
              <Link className="btn btn-primary rounded-pill py-3 px-5 mt-4" to="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Additional Content End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Features;