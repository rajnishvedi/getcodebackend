import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/css/productdetails.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#7f1d1d' : '#1a2a10',
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
      <i className={`fa ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
        style={{ color: type === 'success' ? '#a8d97f' : '#fca5a5' }}
      ></i>
      {message}
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Get product image URL
  const getProductImage = (product, imageIndex = 0) => {
    if (product.images?.length > 0 && product.images[imageIndex]) {
      const img = product.images[imageIndex];
      return img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`;
    }
    return '/default-product.png';
  };

  // Fetch product data based on slug
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productAPI.getBySlug(slug);
        
        if (response.data.success) {
          setProduct(response.data.product);
          // Fetch related products from same category
          fetchRelatedProducts(response.data.product.category, response.data.product._id);
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Fetch related products
  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      setLoadingRelated(true);
      const response = await productAPI.getByCategory(category, { limit: 4 });
      if (response.data.success) {
        // Filter out current product
        const related = response.data.products.filter(p => p._id !== currentProductId);
        setRelatedProducts(related.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < (product?.stock?.quantity || 10)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
      return;
    }

    if (!product?.stock?.inStock) {
      showToast('Product is out of stock', 'error');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    
    if (result.success) {
      showToast(`${product.name} added to cart!`, 'success');
    } else if (result.requiresLogin) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
    } else {
      showToast(result.message || 'Failed to add to cart', 'error');
    }
    
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
      return;
    }

    if (!product?.stock?.inStock) {
      showToast('Product is out of stock', 'error');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    
    if (result.success) {
      navigate('/checkout');
    } else if (result.requiresLogin) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
    } else {
      showToast(result.message || 'Failed to add to cart', 'error');
      setAddingToCart(false);
    }
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get tag color based on tag type
  const getTagColor = (tag) => {
    const colors = {
      new: '#10b981',
      organic: '#2e7d32',
      seasonal: '#f59e0b',
      popular: '#ef4444',
      discount: '#8b5cf6'
    };
    return colors[tag] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <div className="container text-center py-5">
          <i className="fa fa-exclamation-circle fa-4x text-muted mb-4"></i>
          <h2 className="mb-3">Product Not Found</h2>
          <p className="text-muted mb-4">{error || 'The product you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link to="/products" className="btn btn-primary rounded-pill py-3 px-5">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={hideToast} />}

      <div className="container py-5">
        {/* Breadcrumb */}
        <nav className="breadcrumb mb-5">
          <Link to="/" className="text-muted">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="text-muted">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${product.category}`} className="text-muted">
            {product.category === 'fruit' ? 'Fruits' : 'Vegetables'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="row g-5 mb-5">
          {/* Image Gallery */}
          <div className="col-lg-6">
            <div className="product-gallery">
              <div className="main-image mb-3 position-relative">
                <img 
                  className="img-fluid w-100 rounded"
                  src={getProductImage(product, selectedImage)} 
                  alt={product.images[selectedImage]?.alt || product.name}
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
                {product.pricing?.oldPrice && (
                  <span className="position-absolute top-0 end-0 bg-danger text-white px-3 py-2 rounded m-3">
                    {Math.round(((product.pricing.oldPrice - product.pricing.price) / product.pricing.oldPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              {product.images?.length > 1 && (
                <div className="row g-2">
                  {product.images.map((image, index) => (
                    <div key={index} className="col-3">
                      <button
                        className={`w-100 p-0 border-2 rounded overflow-hidden ${
                          selectedImage === index ? 'border-primary' : 'border-muted'
                        }`}
                        onClick={() => setSelectedImage(index)}
                        style={{ cursor: 'pointer', background: 'none' }}
                      >
                        <img 
                          src={getProductImage(product, index)} 
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          className="img-fluid w-100"
                          style={{ height: '100px', objectFit: 'cover' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-6">
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-3">
                {product.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="badge me-2 py-2 px-3"
                    style={{ backgroundColor: getTagColor(tag), color: 'white' }}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            )}

            <h1 className="display-6 mb-3">{product.name}</h1>
            
            {/* Pricing */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="h2 text-primary mb-0">{formatPrice(product.pricing?.price)}</span>
              {product.pricing?.oldPrice && (
                <>
                  <span className="h5 text-muted text-decoration-line-through mb-0">
                    {formatPrice(product.pricing.oldPrice)}
                  </span>
                  <span className="badge bg-success py-2 px-3">
                    Save {formatPrice(product.pricing.oldPrice - product.pricing.price)}
                  </span>
                </>
              )}
            </div>

            {/* Unit & Stock */}
            <div className="mb-3">
              <p className="mb-2">
                <span className="text-muted">Sold by:</span>
                <span className="ms-2 fw-medium">{product.unit}</span>
              </p>
              <p className="mb-2">
                <span className="text-muted">Availability:</span>
                <span className={`ms-2 fw-medium ${product.stock?.inStock ? 'text-success' : 'text-danger'}`}>
                  {product.stock?.inStock ? `In Stock (${product.stock.quantity} available)` : 'Out of Stock'}
                </span>
              </p>
            </div>

            {/* Description */}
            <p className="mb-4">{product.description}</p>

            {/* Quantity Selector */}
            {product.stock?.inStock && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <label className="fw-medium">Quantity:</label>
                <div className="d-flex align-items-center border rounded-pill overflow-hidden">
                  <button 
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                    className="btn btn-sm btn-outline-secondary border-0 px-3 py-2"
                    style={{ fontSize: '1.2rem' }}
                  >
                    −
                  </button>
                  <span className="px-3 py-2 fw-medium">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('increment')}
                    disabled={quantity >= product.stock.quantity}
                    className="btn btn-sm btn-outline-secondary border-0 px-3 py-2"
                    style={{ fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                </div>
                <span className="text-muted">Max: {product.stock.quantity}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-3 mb-4">
              <button 
                className="btn btn-primary rounded-pill py-3 px-5 flex-grow-1"
                onClick={handleAddToCart}
                disabled={!product.stock?.inStock || addingToCart}
              >
                {addingToCart ? (
                  <><i className="fa fa-spinner fa-spin me-2"></i>Adding...</>
                ) : !isLoggedIn ? (
                  <><i className="fa fa-sign-in-alt me-2"></i>Login to Add</>
                ) : (
                  <><i className="fa fa-shopping-cart me-2"></i>Add to Cart</>
                )}
              </button>
              <button 
                className="btn btn-secondary rounded-pill py-3 px-5"
                onClick={handleBuyNow}
                disabled={!product.stock?.inStock || addingToCart}
              >
                Buy Now
              </button>
            </div>

            {/* Delivery Info */}
            <div className="row g-3 bg-light p-4 rounded">
              <div className="col-sm-4">
                <div className="d-flex align-items-center gap-3">
                  <i className="fa fa-truck fa-2x text-primary"></i>
                  <div>
                    <h6 className="mb-0">Free Delivery</h6>
                    <small className="text-muted">On orders ₹499+</small>
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="d-flex align-items-center gap-3">
                  <i className="fa fa-clock-o fa-2x text-primary"></i>
                  <div>
                    <h6 className="mb-0">Fresh Guarantee</h6>
                    <small className="text-muted">24-48 hour delivery</small>
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="d-flex align-items-center gap-3">
                  <i className="fa fa-refresh fa-2x text-primary"></i>
                  <div>
                    <h6 className="mb-0">Easy Returns</h6>
                    <small className="text-muted">Within 24 hours</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-tabs bg-light rounded p-4 mb-5">
          <ul className="nav nav-pills mb-4" id="productTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping Info
              </button>
            </li>
          </ul>

          <div className="tab-content p-3">
            {activeTab === 'description' && (
              <div className="tab-pane active">
                <h4 className="mb-3">Product Description</h4>
                <p>{product.description}</p>
                
                <div className="mt-4">
                  <h5 className="mb-3">Key Features:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fa fa-check text-primary me-2"></i>
                      Freshly harvested from local farms
                    </li>
                    <li className="mb-2">
                      <i className="fa fa-check text-primary me-2"></i>
                      No preservatives or chemicals
                    </li>
                    <li className="mb-2">
                      <i className="fa fa-check text-primary me-2"></i>
                      Hand-picked for quality
                    </li>
                    <li className="mb-2">
                      <i className="fa fa-check text-primary me-2"></i>
                      Direct from farm to your doorstep
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-pane active">
                <h4 className="mb-3">Product Specifications</h4>
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: '200px' }}>Category</th>
                      <td>{product.category === 'fruit' ? 'Fruit' : 'Vegetable'}</td>
                    </tr>
                    <tr>
                      <th>Unit</th>
                      <td>{product.unit}</td>
                    </tr>
                    <tr>
                      <th>Stock Quantity</th>
                      <td>{product.stock?.quantity} units</td>
                    </tr>
                    <tr>
                      <th>Tags</th>
                      <td>{product.tags?.join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                      <th>Product ID</th>
                      <td><code>{product.slug}</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-pane active">
                <h4 className="mb-3">Shipping Information</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="bg-white p-4 rounded">
                      <i className="fa fa-truck fa-2x text-primary mb-3"></i>
                      <h5>📦 Delivery Time</h5>
                      <p className="text-muted mb-0">Orders are delivered within 24-48 hours to ensure freshness.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-white p-4 rounded">
                      <i className="fa fa-thermometer-half fa-2x text-primary mb-3"></i>
                      <h5>🌡️ Storage</h5>
                      <p className="text-muted mb-0">Keep refrigerated upon arrival for maximum freshness.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-white p-4 rounded">
                      <i className="fa fa-map-marker fa-2x text-primary mb-3"></i>
                      <h5>📍 Coverage</h5>
                      <p className="text-muted mb-0">Currently delivering in select areas. Check pincode for availability.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-white p-4 rounded">
                      <i className="fa fa-undo fa-2x text-primary mb-3"></i>
                      <h5>🔄 Returns</h5>
                      <p className="text-muted mb-0">Report any issues within 24 hours of delivery for refund/replacement.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <section className="related-products">
          <h2 className="display-6 mb-4">You Might Also Like</h2>
          
          {loadingRelated ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-lg-3 col-md-6">
                  <div className="bg-light rounded" style={{ height: '300px' }}>
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="row g-4">
              {relatedProducts.map((related) => (
                <div key={related._id} className="col-lg-3 col-md-6">
                  <div className="product-item border rounded overflow-hidden">
                    <div className="position-relative bg-light overflow-hidden">
                      <img
                        className="img-fluid w-100 h-100"
                        src={getProductImage(related)}
                        alt={related.name}
                        style={{ objectFit: 'cover' }}
                      />
                      {!related.stock?.inStock && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                          <span className="badge bg-danger fs-6 px-3 py-2">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <Link to={`/products/${related.slug}`} className="h6 text-decoration-none">
                        {related.name}
                      </Link>
                      <div className="mt-2">
                        <span className="text-primary fw-bold">
                          {formatPrice(related.pricing?.price)}
                        </span>
                        <span className="text-muted ms-2">/{related.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">No related products found.</p>
          )}
        </section>
      </div>

      {/* Back to Top Button */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </div>
  );
};

export default ProductDetails;