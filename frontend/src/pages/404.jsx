import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
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

  // Fun facts or jokes to display randomly
  const funFacts = [
    "The page you're looking for might be on vacation 🏖️",
    "Looks like this page went to buy some organic vegetables 🥕",
    "404: Page not found. It's probably organic and free-range somewhere else 🌱",
    "This page doesn't exist, but our organic products do! 🍎",
    "Even our best organic farmers couldn't find this page 🧑‍🌾",
    "This page is like a vegetable - it might be out of season 🎃"
  ];

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <>
      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Page Header Start */}
      <div className="container-fluid page-header wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">404 Error</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">404 Error</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* 404 Start */}
      <div className="container-xxl py-6 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              {/* 404 Illustration */}
              <div className="position-relative mb-5">
                <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
                <h1 className="display-1 fw-bold mb-0">404</h1>
              </div>
              
              {/* Error Message */}
              <h1 className="mb-4">Page Not Found</h1>
              
              {/* Description */}
              <p className="lead mb-4">
                We're sorry, the page you have looked for does not exist in our website! 
                Maybe go to our home page or try to use a search?
              </p>

              {/* Fun Fact (optional) */}
              <p className="text-muted mb-4 fst-italic">
                <i className="fa fa-smile-wink text-primary me-2"></i>
                {randomFact}
              </p>

              {/* Search Form (optional) */}
              <div className="row g-3 mb-4">
                <div className="col-md-8 mx-auto">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      placeholder="Search our site..." 
                      aria-label="Search"
                    />
                    <button className="btn btn-primary" type="button">
                      <i className="fa fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-center gap-3">
                <Link className="btn btn-primary rounded-pill py-3 px-5" to="/">
                  <i className="fa fa-home me-2"></i>
                  Go Back To Home
                </Link>
                <Link className="btn btn-outline-primary rounded-pill py-3 px-5" to="/contact">
                  <i className="fa fa-envelope me-2"></i>
                  Contact Us
                </Link>
              </div>

              {/* Helpful Links (optional) */}
              <div className="mt-5 pt-3">
                <h6 className="mb-3">You might also try:</h6>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link to="/products" className="badge bg-light text-dark p-3 text-decoration-none">
                    <i className="fa fa-apple me-1"></i> Products
                  </Link>
                  <Link to="/about" className="badge bg-light text-dark p-3 text-decoration-none">
                    <i className="fa fa-info-circle me-1"></i> About Us
                  </Link>
                  <Link to="/blog" className="badge bg-light text-dark p-3 text-decoration-none">
                    <i className="fa fa-blog me-1"></i> Blog
                  </Link>
                  <Link to="/features" className="badge bg-light text-dark p-3 text-decoration-none">
                    <i className="fa fa-star me-1"></i> Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 404 End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default NotFound;