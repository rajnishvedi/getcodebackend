import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (product) => {
  if (product.images?.length > 0) {
    const img = product.images[0];
    return img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`;
  }
  return '/default-product.png';
};

// ── Toast ────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '32px', left: '50%',
      transform: 'translateX(-50%)',
      background: toast.type === 'error' ? '#7f1d1d' : '#1a2a10',
      color: '#fff', padding: '13px 24px', borderRadius: '50px',
      fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: '600',
      display: 'flex', alignItems: 'center', gap: '8px',
      zIndex: 9999, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
      animation: 'fadeSlideUp 0.3s ease',
    }}>
      <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
        style={{ color: toast.type === 'success' ? '#a8d97f' : '#fca5a5' }}
      />
      {toast.msg}
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateX(-50%) translateY(12px);} to { opacity:1; transform:translateX(-50%) translateY(0);} }`}</style>
    </div>
  );
};

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc',  label: 'Oldest First' },
  { value: 'price-asc',      label: 'Price: Low to High' },
  { value: 'price-desc',     label: 'Price: High to Low' },
  { value: 'name-asc',       label: 'Name: A to Z' },
];

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { toast, show: showToast } = useToast();

  // ── State ──
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingIds, setAddingIds] = useState(new Set());

  // ── Filters from URL params ──
  const [category, setCategory]   = useState(searchParams.get('category') || 'all');
  const [sortVal, setSortVal]     = useState('createdAt-desc');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);

  const LIMIT = 12;

  // ── Fetch ──
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [sort, order] = sortVal.split('-');
      const params = { page: currentPage, limit: LIMIT, sort, order };
      if (category !== 'all') params.category = category;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await productAPI.getAll(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalProducts(res.data.totalProducts);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [category, sortVal, searchQuery, currentPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [category, sortVal, searchQuery]);

  // Sync category to URL
  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params, { replace: true });
  }, [category, searchQuery]);

  useEffect(() => {
    if (window.WOW) new window.WOW({ boxClass: 'wow', animateClass: 'animated', offset: 0, mobile: true, live: true }).init();
    const spinner = document.getElementById('spinner');
    if (spinner) setTimeout(() => spinner.classList.remove('show'), 500);
    window.scrollTo(0, 0);
  }, []);

  // ── Search with debounce ──
  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(val), 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    clearTimeout(searchTimer.current);
    setSearchQuery(searchInput);
  };

  // ── Add to cart ──
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: '/products' } } }); return; }
    if (!product.stock?.inStock) return;

    setAddingIds((prev) => new Set(prev).add(product._id));
    const result = await addToCart(product._id, 1);

    if (result.success) {
      showToast(`${product.name} added to cart!`);
    } else if (result.requiresLogin) {
      navigate('/login', { state: { from: { pathname: '/products' } } });
    } else {
      showToast(result.message || 'Failed to add to cart', 'error');
    }

    setAddingIds((prev) => { const n = new Set(prev); n.delete(product._id); return n; });
  };

  const discount = (p) => {
    if (p.pricing?.oldPrice && p.pricing.oldPrice > p.pricing.price)
      return Math.round(((p.pricing.oldPrice - p.pricing.price) / p.pricing.oldPrice) * 100);
    return null;
  };

  return (
    <>
      <Toast toast={toast} />

      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>

      {/* Page Header */}
      <div className="container-fluid page-header mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container">
          <h1 className="display-3 mb-3 animated slideInDown">Our Products</h1>
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link className="text-body" to="/">Home</Link></li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Products</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Section */}
      <div className="container-xxl py-5">
        <div className="container">

          {/* ── Header row: title + filters ── */}
          <div className="row g-0 gx-5 align-items-end mb-4">
            <div className="col-lg-5">
              <div className="section-header text-start wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '500px' }}>
                <h1 className="display-5 mb-2">
                  {category === 'all' ? 'All Products' : category === 'fruit' ? 'Fresh Fruits' : 'Fresh Vegetables'}
                </h1>
                <p className="mb-0" style={{ color: '#7a8a6a', fontSize: '0.9rem' }}>
                  {loading ? 'Loading…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>

            <div className="col-lg-7 wow slideInRight" data-wow-delay="0.1s">
              <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 mt-lg-0">
                {/* Category tabs */}
                {[
                  { value: 'all',       label: 'All' },
                  { value: 'fruit',     label: '🍎 Fruits' },
                  { value: 'vegetable', label: '🥦 Vegetables' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    className={`btn border-2 rounded-pill ${category === tab.value ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{ fontSize: '0.85rem', padding: '6px 18px' }}
                    onClick={() => setCategory(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}

                {/* Sort */}
                <select
                  value={sortVal}
                  onChange={(e) => setSortVal(e.target.value)}
                  style={{
                    padding: '7px 14px', borderRadius: '50px',
                    border: '2px solid #dee2e6', fontSize: '0.85rem',
                    color: '#495057', background: '#fff', cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Search bar ── */}
          <div className="row mb-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-6">
              <form onSubmit={handleSearchSubmit}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search products by name…"
                    style={{
                      width: '100%', padding: '12px 48px 12px 18px',
                      border: '1.5px solid #e5eedd', borderRadius: '50px',
                      fontSize: '0.9rem', outline: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      background: '#fff',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#cd5091'}
                    onBlur={(e) => e.target.style.borderColor = '#e5eedd'}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute', right: '6px', top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: '#cd5091', border: 'none', color: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <i className="fa fa-search" style={{ fontSize: '13px' }}></i>
                  </button>
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                      style={{
                        position: 'absolute', right: '48px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#aaa',
                        cursor: 'pointer', fontSize: '14px', padding: '4px',
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  )}
                </div>
              </form>
            </div>
            {/* Active filter chips */}
            {(searchQuery || category !== 'all') && (
              <div className="col-lg-6 d-flex align-items-center gap-2 mt-2 mt-lg-0">
                {searchQuery && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#f0f7e8', border: '1px solid #c8e8a8',
                    color: '#2d6318', borderRadius: '50px', padding: '5px 12px',
                    fontSize: '0.8rem', fontWeight: '500',
                  }}>
                    <i className="fa fa-search" style={{ fontSize: '10px' }}></i>
                    "{searchQuery}"
                    <button onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cd5091', padding: 0, lineHeight: 1, marginLeft: '2px' }}>
                      <i className="fa fa-times"></i>
                    </button>
                  </span>
                )}
                {category !== 'all' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#f0f7e8', border: '1px solid #c8e8a8',
                    color: '#2d6318', borderRadius: '50px', padding: '5px 12px',
                    fontSize: '0.8rem', fontWeight: '500',
                  }}>
                    {category === 'fruit' ? '🍎' : '🥦'} {category}
                    <button onClick={() => setCategory('all')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cd5091', padding: 0, lineHeight: 1, marginLeft: '2px' }}>
                      <i className="fa fa-times"></i>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { setCategory('all'); setSearchInput(''); setSearchQuery(''); setSortVal('createdAt-desc'); }}
                  style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Products Grid ── */}
          <div className="row g-4">
            {loading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="product-item" style={{ overflow: 'hidden' }}>
                    <div style={{
                      height: '220px', borderRadius: '4px',
                      background: 'linear-gradient(90deg,#f0f0f0 25%,#f8f8f8 50%,#f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s infinite',
                    }}></div>
                    <div className="text-center p-4">
                      <div style={{ height: '20px', width: '70%', borderRadius: '4px', background: '#f0f0f0', margin: '0 auto 8px' }}></div>
                      <div style={{ height: '16px', width: '40%', borderRadius: '4px', background: '#f0f0f0', margin: '0 auto' }}></div>
                    </div>
                    <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => {
                const isAdding = addingIds.has(product._id);
                const outOfStock = !product.stock?.inStock;
                const off = discount(product);

                return (
                  <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp"
                    data-wow-delay={`${0.1 + (index % 4) * 0.1}s`}>
                    <div className="product-item">
                      <div className="position-relative bg-light overflow-hidden">
                        <img
                          className="img-fluid w-100"
                          src={getProductImage(product)}
                          alt={product.images?.[0]?.alt || product.name}
                          onError={(e) => { e.target.src = '/default-product.png'; }}
                        />
                        {/* Badges */}
                        {product.tags?.includes('new') && (
                          <div className="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">New</div>
                        )}
                        {product.tags?.includes('organic') && (
                          <div className="bg-success rounded text-white position-absolute end-0 top-0 m-4 py-1 px-3" style={{ fontSize: '12px' }}>Organic</div>
                        )}
                        {off && !product.tags?.includes('new') && (
                          <div className="bg-danger rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3" style={{ fontSize: '12px' }}>{off}% OFF</div>
                        )}
                        {outOfStock && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{ background: 'rgba(0,0,0,0.42)' }}>
                            <span className="badge bg-danger fs-6 px-3 py-2">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center p-4">
                        <Link className="d-block h5 mb-2" to={`/products/${product.slug}`}>{product.name}</Link>
                        <div>
                          <span className="text-primary me-1">
                            ₹{product.pricing?.price?.toFixed(2)}
                            <small className="text-muted fw-normal"> /{product.unit}</small>
                          </span>
                          {product.pricing?.oldPrice && (
                            <span className="text-body text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                              ₹{product.pricing.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {/* Stock quantity hint */}
                        {product.stock?.inStock && product.stock?.quantity <= 10 && (
                          <small style={{ color: '#e67e22', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>
                            Only {product.stock.quantity} left!
                          </small>
                        )}
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
                              background: 'none', border: 'none', padding: 0,
                              cursor: outOfStock ? 'not-allowed' : 'pointer',
                              color: outOfStock ? '#aaa' : 'inherit',
                              fontSize: 'inherit', fontFamily: 'inherit',
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
              /* Empty state */
              <div className="col-12 text-center py-5">
                <i className="fa fa-leaf fa-3x mb-3 d-block" style={{ color: '#a8d97f' }}></i>
                <h5 style={{ color: '#1a2a10' }}>No products found</h5>
                <p style={{ color: '#7a8a6a' }}>
                  {searchQuery ? `No results for "${searchQuery}".` : 'No products in this category yet.'}
                </p>
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={() => { setCategory('all'); setSearchInput(''); setSearchQuery(''); }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5 wow fadeInUp" data-wow-delay="0.1s">
              <button
                className="btn btn-outline-primary rounded-pill"
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <i className="fa fa-chevron-left me-1"></i> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#aaa' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      className={`btn rounded-pill ${currentPage === p ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ minWidth: '40px' }}
                      onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="btn btn-outline-primary rounded-pill"
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Next <i className="fa fa-chevron-right ms-1"></i>
              </button>
            </div>
          )}

          {/* Results count */}
          {!loading && products.length > 0 && (
            <p className="text-center mt-3" style={{ color: '#7a8a6a', fontSize: '0.82rem' }}>
              Showing {(currentPage - 1) * LIMIT + 1}–{Math.min(currentPage * LIMIT, totalProducts)} of {totalProducts} products
            </p>
          )}
        </div>
      </div>

      {/* Farm Visit */}
      <div className="container-fluid bg-primary bg-icon mt-5 py-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-md-7 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="display-5 text-white mb-3">Visit Our Fruit Farm</h1>
              <p className="text-white mb-0">
                Experience the freshness firsthand! Visit our orchard to see how we grow our organic fruits
                and meet the farmers who nurture them.
              </p>
            </div>
            <div className="col-md-5 text-md-end wow fadeIn" data-wow-delay="0.5s">
              <Link className="btn btn-lg btn-secondary rounded-pill py-3 px-5" to="/contact">
                Schedule Farm Visit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default Products;