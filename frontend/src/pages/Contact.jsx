import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add your form submission logic here
    alert('Message sent successfully!');
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
          <h1 className="display-3 mb-3 animated slideInDown">Contact Us</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Contact Us</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Contact Start */}
      <div className="container-xxl py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Contact Us</h1>
            <p>Premium Onions. Trusted Supply. Delivered Fresh.</p>
          </div>
          <div className="row g-5 justify-content-center">
            <div className="col-lg-5 col-md-12 wow fadeInUp" data-wow-delay="0.1s">
              <div className="bg-primary text-white d-flex flex-column justify-content-center h-100 p-5">
                <h5 className="text-white">Call Us</h5>
                <p className="mb-5"><i className="fa fa-phone-alt me-3"></i>+91 8281149617</p>
                <h5 className="text-white">Email Us</h5>
                <p className="mb-5"><i className="fa fa-envelope me-3"></i>info@tmonion.com</p>
                <h5 className="text-white">Office Address</h5>
                <p className="mb-5"><i className="fa fa-map-marker-alt me-3"></i>Room. P1/4, Bypass road, Eec market</p>
                <h5 className="text-white">Follow Us</h5>
                <div className="d-flex pt-2">
                  <a className="btn btn-square btn-outline-light rounded-circle me-1" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a className="btn btn-square btn-outline-light rounded-circle me-1" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="btn btn-square btn-outline-light rounded-circle me-1" href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a className="btn btn-square btn-outline-light rounded-circle me-0" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-md-12 wow fadeInUp" data-wow-delay="0.5s">
              {/* <p className="mb-4">
                The contact form is currently inactive. Get a functional and working contact form with Ajax & PHP in a few minutes. 
                Just copy and paste the files, add a little code and you're done.{" "}
                <a href="https://htmlcodex.com/contact-form" target="_blank" rel="noopener noreferrer">Download Now</a>.
              </p> */}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="name">Your Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">Your Email</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="subject" 
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="subject">Subject</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea 
                        className="form-control" 
                        placeholder="Leave a message here" 
                        id="message" 
                        style={{ height: '200px' }}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                      <label htmlFor="message">Message</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary rounded-pill py-3 px-5" type="submit">
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}

      {/* Google Map Start */}
      <div className="container-xxl px-0 wow fadeIn" data-wow-delay="0.1s" style={{ marginBottom: '-6px' }}>
        <iframe 
          className="w-100" 
          style={{ height: '450px' }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
          frameBorder="0" 
          allowFullScreen 
          aria-hidden="false" 
          tabIndex="0"
          title="Google Map - New York"
        ></iframe>
      </div>
      {/* Google Map End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Contact;