import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import '../assets/css/bootstrap.min.css';
import '../assets/css/style.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (product) => {
  if (product.images?.length > 0) {
    const img = product.images[0];
    return img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`;
  }
  return '/default-product.png';
};

// ── Mini toast for homepage ──────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
};

const HomeToast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: toast.type === 'error' ? '#7f1d1d' : '#1a2a10',
      color: '#fff',
      padding: '13px 24px',
      borderRadius: '50px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.88rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
      whiteSpace: 'nowrap',
      animation: 'fadeSlideUp 0.3s ease',
    }}>
      <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
        style={{ color: toast.type === 'success' ? '#a8d97f' : '#fca5a5' }}
      ></i>
      {toast.msg}
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
};

const Home = () => {
  const testimonialRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { toast, show: showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [addingIds, setAddingIds] = useState(new Set());

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = { limit: 8 };
        if (activeCategory !== 'all') params.category = activeCategory;
        const response = await productAPI.getAll(params);
        if (response.data.success) setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  useEffect(() => {
    if (window.WOW) {
      new window.WOW({ boxClass: 'wow', animateClass: 'animated', offset: 0, mobile: true, live: true }).init();
    }
    if (window.$ && window.$.fn.owlCarousel && testimonialRef.current) {
      window.$(testimonialRef.current).owlCarousel({
        loop: true, margin: 10, nav: false, dots: true, autoplay: true, smartSpeed: 1000,
        responsive: { 0: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } },
      });
    }
    const spinner = document.getElementById('spinner');
    if (spinner) setTimeout(() => spinner.classList.remove('show'), 1000);
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // Not logged in → redirect to login
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }

    if (!product.stock?.inStock) return;

    setAddingIds((prev) => new Set(prev).add(product._id));
    const result = await addToCart(product._id, 1);

    if (result.success) {
      showToast(`${product.name} added to cart!`);
    } else if (result.requiresLogin) {
      navigate('/login', { state: { from: { pathname: '/' } } });
    } else {
      showToast(result.message || 'Failed to add to cart', 'error');
    }

    setAddingIds((prev) => {
      const next = new Set(prev);
      next.delete(product._id);
      return next;
    });
  };

  return (
    <>
      {/* Toast */}
      <HomeToast toast={toast} />

      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Carousel */}
      <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img className="w-100" src="carousel-1.png" alt="Organic Food" />
              <div className="carousel-caption">
                <div className="container">
                  <div className="row justify-content-start">
                    <div className="col-lg-7">
                      <h1 className="display-2 mb-5 animated slideInDown">Organic Food Is Good For Health</h1>
                      <Link to="/products" className="btn btn-primary rounded-pill py-sm-3 px-sm-5">Products</Link>
                      <Link to="/services" className="btn btn-secondary rounded-pill py-sm-3 px-sm-5 ms-3">Services</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel-item">
              <img className="w-100" src="carousel-2.png" alt="Natural Food" />
              <div className="carousel-caption">
                <div className="container">
                  <div className="row justify-content-start">
                    <div className="col-lg-7">
                      <h1 className="display-2 mb-5 animated slideInDown">Natural Food Is Always Healthy</h1>
                      <Link to="/products" className="btn btn-primary rounded-pill py-sm-3 px-sm-5">Products</Link>
                      <Link to="/services" className="btn btn-secondary rounded-pill py-sm-3 px-sm-5 ms-3">Services</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#header-carousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#header-carousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="about-img position-relative overflow-hidden p-5 pe-0">
                <img className="img-fluid w-100" src="about.png" alt="About" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="display-5 mb-4">Premium Quality Fresh Onions</h1>
              <p className="mb-4">We provide farm-fresh onions sourced from trusted growers, ensuring superior quality, consistent supply, and long-lasting freshness for every order.</p>
              <p><i className="fa fa-check text-primary me-3"></i>Fresh Produce Daily</p>
              <p><i className="fa fa-check text-primary me-3"></i>Organic &amp; Chemical Free</p>
              <p><i className="fa fa-check text-primary me-3"></i>Direct from Farm</p>
              <Link className="btn btn-primary rounded-pill py-3 px-5 mt-3" to="/about">Read More</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container-fluid bg-light bg-icon my-5 py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Our Features</h1>
            <p>We focus on quality, freshness, and reliability at every stage—from sourcing to delivery—ensuring the best produce for our customers.</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'icon-1.png', title: 'Farm Fresh Sourcing', description: 'We source onions directly from trusted farmers, ensuring natural growth, better quality, and consistent supply.' },
              { icon: 'icon-2.png', title: 'Premium Quality', description: 'Each batch is carefully selected and graded to meet high standards of freshness, size, and durability.' },
              { icon: 'icon-3.png', title: 'Safe Handling', description: 'We follow proper handling and packaging practices to ensure safe delivery and long shelf life.' },
            ].map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`}>
                <div className="bg-white text-center h-100 p-4 p-xl-5">
                  <img className="img-fluid mb-4" src={feature.icon} alt={feature.title} />
                  <h4 className="mb-3">{feature.title}</h4>
                  <p className="mb-4">{feature.description}</p>
                  <Link className="btn btn-outline-primary border-2 py-2 px-4 rounded-pill" to="/feature">Read More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== DYNAMIC PRODUCTS SECTION ==================== */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-0 gx-5 align-items-end">
            <div className="col-lg-6">
              <div className="section-header text-start mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
                <h1 className="display-5 mb-3">Our Fresh Produce</h1>
                <p>Discover our wide selection of fresh, organic fruits and vegetables delivered directly from local farms.</p>
              </div>
            </div>
            <div className="col-lg-6 text-start text-lg-end wow slideInRight" data-wow-delay="0.1s">
              <ul className="nav nav-pills d-inline-flex justify-content-end mb-5">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'fruit', label: 'Fruits' },
                  { value: 'vegetable', label: 'Vegetables' },
                ].map((tab) => (
                  <li key={tab.value} className="nav-item me-2">
                    <button
                      className={`btn border-2 ${activeCategory === tab.value ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                      onClick={() => setActiveCategory(tab.value)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="row g-4">
            {loadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="product-item" style={{ opacity: 0.5 }}>
                    <div className="bg-light" style={{ height: '220px', borderRadius: '4px' }}></div>
                    <div className="text-center p-4">
                      <div className="bg-light mb-2 mx-auto" style={{ height: '20px', width: '70%', borderRadius: '4px' }}></div>
                      <div className="bg-light mx-auto" style={{ height: '16px', width: '40%', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => {
                const isAdding = addingIds.has(product._id);
                const outOfStock = !product.stock?.inStock;

                return (
                  <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + (index % 4) * 0.2}s`}>
                    <div className="product-item">
                      <div className="position-relative bg-light overflow-hidden">
                        <img
                          className="img-fluid w-100"
                          src={getProductImage(product)}
                          alt={product.images?.[0]?.alt || product.name}
                          onError={(e) => { e.target.src = '/default-product.png'; }}
                        />
                        {product.tags?.includes('new') && (
                          <div className="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">New</div>
                        )}
                        {product.tags?.includes('organic') && (
                          <div className="bg-success rounded text-white position-absolute end-0 top-0 m-4 py-1 px-3" style={{ fontSize: '12px' }}>Organic</div>
                        )}
                        {outOfStock && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <span className="badge bg-danger fs-6 px-3 py-2">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center p-4">
                        <Link className="d-block h5 mb-2" to={`/products/${product.slug}`}>{product.name}</Link>
                        <div>
                          <span className="text-primary me-1">
                            ₹{product.pricing?.price?.toFixed(2)}
                            <small className="text-muted fw-normal">/{product.unit}</small>
                          </span>
                          {product.pricing?.oldPrice && (
                            <span className="text-body text-decoration-line-through">₹{product.pricing.oldPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex border-top">
                        <small className="w-50 text-center border-end py-2">
                          <Link className="text-body" to={`/products/${product.slug}`}>
                            <i className="fa fa-eye text-primary me-2"></i>View detail
                          </Link>
                        </small>
                        <small className="w-50 text-center py-2">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={outOfStock || isAdding}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: outOfStock ? 'not-allowed' : 'pointer',
                              color: outOfStock ? '#aaa' : 'inherit',
                              padding: 0,
                              fontSize: 'inherit',
                              fontFamily: 'inherit',
                            }}
                          >
                            {isAdding ? (
                              <><i className="fa fa-spinner fa-spin text-primary me-2"></i>Adding…</>
                            ) : !isLoggedIn ? (
                              <><i className="fa fa-sign-in-alt text-primary me-2"></i>Login to add</>
                            ) : outOfStock ? (
                              <><i className="fa fa-times text-muted me-2"></i>Out of stock</>
                            ) : (
                              <><i className="fa fa-shopping-bag text-primary me-2"></i>Add to cart</>
                            )}
                          </button>
                        </small>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fa fa-box-open fa-3x text-muted mb-3 d-block"></i>
                <p className="text-muted">No products found in this category.</p>
              </div>
            )}

            {!loadingProducts && products.length > 0 && (
              <div className="col-12 text-center wow fadeInUp" data-wow-delay="0.1s">
                <Link className="btn btn-primary rounded-pill py-3 px-5" to="/products">Browse All Products</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm Visit */}
      <div className="container-fluid bg-primary bg-icon mt-5 py-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-md-7 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="display-5 text-white mb-3">Visit Our Farm</h1>
              <p className="text-white mb-0">We welcome you to explore our farms and understand how we ensure natural growth, careful selection, and high-quality produce for our customers.</p>
            </div>
            <div className="col-md-5 text-md-end wow fadeIn" data-wow-delay="0.5s">
              <Link className="btn btn-lg btn-secondary rounded-pill py-3 px-5" to="/contact">Visit Now</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="container-fluid bg-light bg-icon py-6 mb-5">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Customer Review</h1>
            <p>Feedback from our valued customers highlights our dedication to freshness, quality, and reliable service in every delivery.</p>
          </div>
          <div className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s" ref={testimonialRef}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="testimonial-item position-relative bg-white p-5 mt-4">
                <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                <p className="mb-4">{item === 1 && 'The quality of the onions is exceptional. They are always fresh and delicious.'}
                  {item === 2 && 'I have been purchasing from TM Onions for over a year now, and the service has been outstanding.'}
                  {item === 3 && 'The team at TM Onions is professional and reliable. They deliver on time and maintain the highest quality standards.'}
                  {item === 4 && 'As a retailer, I appreciate the consistent supply and competitive pricing from TM Onions.'}</p>
                <div className="d-flex align-items-center">
                  <img className="flex-shrink-0 rounded-circle" src={`testimonial-${item}.jpg`} alt="Client" />
                  <div className="ms-3">
                    <h5 className="mb-1">{item === 1 && 'Rohit Kumar'}
                      {item === 2 && 'Priya Singh'}
                      {item === 3 && 'Vikram Patel'}
                      {item === 4 && 'Anita Sharma'}</h5>
                    <span>{item === 1 && 'Retailer'}
                      {item === 2 && 'Wholesaler'}
                      {item === 3 && 'Distributor'}
                      {item === 4 && 'Customer'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Latest Blog</h1>
            <p>Stay updated with the latest news and insights from TM Onions.</p>
          </div>
          <div className="row g-4">
            {[1, 2, 3].map((blog, index) => (
              <div key={blog} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`}>
                <img className="img-fluid" src={`blog-${blog}.jpg`} alt="Blog" />
                <div className="bg-light p-4">
                  <Link className="d-block h5 lh-base mb-4" to="/blog">
                    {blog === 1 && 'The Benefits of Organic Farming'}
                    {blog === 2 && 'How to Choose the Best Onions for Your Kitchen'}
                    {blog === 3 && 'The Future of Sustainable Agriculture'}
                  </Link>
                  <div className="text-muted border-top pt-4">
                    <small className="me-3"><i className="fa fa-user text-primary me-2"></i>{blog === 1 && 'Mohit Verma'}
                      {blog === 2 && 'Sanya Mehta'}
                      {blog === 3 && 'Anita Sharma'}</small>
                    <small className="me-3"><i className="fa fa-calendar text-primary me-2"></i>{blog === 1 && '01 Jan, 2026'}
                      {blog === 2 && '01 Feb, 2026'}
                      {blog === 3 && '01 Mar, 2026'}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Home;