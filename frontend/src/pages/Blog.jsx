import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [visiblePosts, setVisiblePosts] = useState(6); // Show 6 posts initially
  const [loading, setLoading] = useState(false);

  // Blog posts data array
  const blogPosts = [
    {
      id: 1,
      image: 'blog-1.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.1s'
    },
    {
      id: 2,
      image: 'blog-2.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.3s'
    },
    {
      id: 3,
      image: 'blog-3.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.5s'
    },
    {
      id: 4,
      image: 'blog-2.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.1s'
    },
    {
      id: 5,
      image: 'blog-3.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.3s'
    },
    {
      id: 6,
      image: 'blog-1.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.5s'
    },
    {
      id: 7,
      image: 'blog-3.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.1s'
    },
    {
      id: 8,
      image: 'blog-1.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
      delay: '0.3s'
    },
    {
      id: 9,
      image: 'blog-2.jpg',
      title: 'How to cultivate organic fruits and vegetables in own firm',
      author: 'Admin',
      date: '01 Jan, 2045',
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

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisiblePosts(prev => prev + 3); // Load 3 more posts each time
      setLoading(false);
    }, 500);
  };

  const visibleBlogs = blogPosts.slice(0, visiblePosts);

  return (
    <>
      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Page Header Start */}
      <div className="container-fluid page-header wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">Blog Grid</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link className="text-body" to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link className="text-body" to="/pages">Pages</Link>
              </li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Blog Grid</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Blog Start */}
      <div className="container-xxl py-6">
        <div className="container">
          <div className="section-header text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
            <h1 className="display-5 mb-3">Latest Blog</h1>
            <p>Tempor ut dolore lorem kasd vero ipsum sit eirmod sit. Ipsum diam justo sed rebum vero dolor duo.</p>
          </div>
          <div className="row g-4">
            {visibleBlogs.map((post) => (
              <div 
                key={post.id} 
                className="col-lg-4 col-md-6 wow fadeInUp" 
                data-wow-delay={post.delay}
              >
                <img className="img-fluid" src={`${post.image}`} alt={`Blog ${post.id}`} />
                <div className="bg-light p-4">
                  <Link className="d-block h5 lh-base mb-4" to={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                  <div className="text-muted border-top pt-4">
                    <small className="me-3">
                      <i className="fa fa-user text-primary me-2"></i>
                      {post.author}
                    </small>
                    <small className="me-3">
                      <i className="fa fa-calendar text-primary me-2"></i>
                      {post.date}
                    </small>
                  </div>
                </div>
              </div>
            ))}
            
            {visiblePosts < blogPosts.length && (
              <div className="col-12 text-center wow fadeInUp" data-wow-delay="0.1s">
                <button 
                  className="btn btn-primary rounded-pill py-3 px-5" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Blog End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Blog;