import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Testimonial = () => {
  const testimonialRef = useRef(null);

  // Testimonials data array
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      profession: 'Food Blogger',
      image: 'testimonial-1.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      profession: 'Restaurant Owner',
      image: 'testimonial-2.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      profession: 'Nutritionist',
      image: 'testimonial-3.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    },
    {
      id: 4,
      name: 'David Thompson',
      profession: 'Chef',
      image: 'testimonial-4.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    },
    {
      id: 5,
      name: 'Lisa Wang',
      profession: 'Health Coach',
      image: 'testimonial-1.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    },
    {
      id: 6,
      name: 'James Wilson',
      profession: 'Farm Owner',
      image: 'testimonial-2.jpg',
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      rating: 5
    }
  ];

  // Statistics data
  const statistics = [
    { id: 1, value: '10,000+', label: 'Happy Customers', icon: 'fa-smile' },
    { id: 2, value: '500+', label: 'Organic Products', icon: 'fa-leaf' },
    { id: 3, value: '50+', label: 'Farm Partners', icon: 'fa-tractor' },
    { id: 4, value: '15+', label: 'Years Experience', icon: 'fa-calendar' }
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

    // Initialize Owl Carousel for testimonials
    if (window.$ && window.$.fn.owlCarousel && testimonialRef.current) {
      window.$(testimonialRef.current).owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: true,
        autoplay: true,
        autoplayTimeout: 5000,
        smartSpeed: 1000,
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          992: { items: 3 }
        }
      });
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

    // Cleanup
    return () => {
      if (window.$ && window.$.fn.owlCarousel && testimonialRef.current) {
        window.$(testimonialRef.current).owlCarousel('destroy');
      }
    };
  }, []);

  // Function to render star ratings
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i 
        key={index} 
        className={`fa fa-star ${index < rating ? 'text-primary' : 'text-muted'}`}
      ></i>
    ));
  };

  return (
    <>
      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Page Header Start */}
      <div className="container-fluid page-header wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">Testimonial</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Testimonial</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Statistics Section */}
      <div className="container-xxl py-6">
        <div className="container">
          <div className="row g-4">
            {statistics.map((stat, index) => (
              <div 
                key={stat.id} 
                className="col-lg-3 col-md-6 wow fadeInUp" 
                data-wow-delay={`${0.1 + index * 0.1}s`}
              >
                <div className="stat-item text-center p-4">
                  <div className="stat-icon mb-3">
                    <i className={`fa ${stat.icon} fa-3x text-primary`}></i>
                  </div>
                  <h2 className="display-5 fw-bold mb-2">{stat.value}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Statistics End */}

      {/* Testimonial Start */}
      <div className="container-fluid bg-light bg-icon py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Customer Reviews</h1>
            <p>Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed rebum vero dolor duo.</p>
          </div>
          
          {/* Featured Testimonial */}
          <div className="row g-5 mb-5">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="bg-white p-5">
                <div className="d-flex align-items-center mb-4">
                  <img 
                    className="flex-shrink-0 rounded-circle" 
                    src="testimonial-1.jpg" 
                    alt="Featured Client"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div className="ms-4">
                    <h4 className="mb-1">Sarah Johnson</h4>
                    <p className="text-muted mb-2">Food Blogger</p>
                    <div className="text-warning">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </div>
                  </div>
                </div>
                <i className="fa fa-quote-left fa-3x text-primary opacity-25 mb-3"></i>
                <p className="mb-0 fs-5">
                  "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. 
                  Clita erat ipsum et lorem et sit. Tempor erat elitr rebum at clita. Diam dolor diam 
                  ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
                </p>
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="bg-white p-5">
                <div className="d-flex align-items-center mb-4">
                  <img 
                    className="flex-shrink-0 rounded-circle" 
                    src="testimonial-2.jpg" 
                    alt="Featured Client"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div className="ms-4">
                    <h4 className="mb-1">Michael Chen</h4>
                    <p className="text-muted mb-2">Restaurant Owner</p>
                    <div className="text-warning">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </div>
                  </div>
                </div>
                <i className="fa fa-quote-left fa-3x text-primary opacity-25 mb-3"></i>
                <p className="mb-0 fs-5">
                  "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. 
                  Clita erat ipsum et lorem et sit. Tempor erat elitr rebum at clita. Diam dolor diam 
                  ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s" ref={testimonialRef}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-item position-relative bg-white p-5 mt-4">
                <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                
                {/* Rating Stars */}
                <div className="mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="mb-4">{testimonial.text}</p>
                
                <div className="d-flex align-items-center">
                  <img 
                    className="flex-shrink-0 rounded-circle" 
                    src={`${testimonial.image}`} 
                    alt={testimonial.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div className="ms-3">
                    <h5 className="mb-1">{testimonial.name}</h5>
                    <span className="text-muted">{testimonial.profession}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Write a Review Section */}
          <div className="row justify-content-center mt-5 pt-5">
            <div className="col-lg-8 text-center wow fadeInUp" data-wow-delay="0.1s">
              <h2 className="display-6 mb-4">Share Your Experience</h2>
              <p className="mb-4">
                We value your feedback! Share your experience with our organic products and help others 
                make informed choices.
              </p>
              <Link to="/contact" className="btn btn-primary rounded-pill py-3 px-5">
                <i className="fa fa-pencil-alt me-2"></i>Write a Review
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonial End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Testimonial;