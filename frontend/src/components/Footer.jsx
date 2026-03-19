import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="container-fluid bg-dark footer mt-5 pt-5 wow fadeIn" data-wow-delay="0.1s">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-3 col-md-6">
            <h1 className="fw-bold text-primary mb-4">Tm<span className="text-secondary"> Onions</span></h1>
            <p>TM Onions offers premium quality onions with consistent supply and trusted service.</p>
            <div className="d-flex pt-2">
              <a className="btn btn-square btn-outline-light rounded-circle me-1" href="/"><i className="fab fa-twitter"></i></a>
              <a className="btn btn-square btn-outline-light rounded-circle me-1" href="/"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-square btn-outline-light rounded-circle me-1" href="/"><i className="fab fa-youtube"></i></a>
              <a className="btn btn-square btn-outline-light rounded-circle me-0" href="/"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="text-light mb-4">Address</h4>
            <p><i className="fa fa-map-marker-alt me-3"></i>Room. P1/4, Bypass road, Eec market </p>
            <p><i className="fa fa-phone-alt me-3"></i>+91 8281149617</p>
            <p><i className="fa fa-envelope me-3"></i>info@tmonion.com</p>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="text-light mb-4">Quick Links</h4>
            <Link className="btn btn-link" to="/about">About Us</Link>
            <Link className="btn btn-link" to="/contact">Contact Us</Link>
            <Link className="btn btn-link" to="/services">Our Services</Link>
            <Link className="btn btn-link" to="/terms-and-conditions">Terms & Condition</Link>
            <Link className="btn btn-link" to="/privacy-policy">Privacy Policy</Link>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="text-light mb-4">Newsletter</h4>
            <p>Get the latest updates on fresh stock, pricing, and offers from TM Onions.</p>
            <div className="position-relative mx-auto" style={{ maxWidth: '400px' }}>
              <input className="form-control bg-transparent w-100 py-3 ps-4 pe-5" type="text" placeholder="Your email" />
              <button type="button" className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">SignUp</button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid copyright">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <a href="#">Tm Onions</a>, All Right Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;