import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminProductAPI } from '../../services/api';
import '../../styles/admin/AdminProducts.css';

const CATEGORY_OPTIONS = ['vegetable', 'fruit'];
const TAG_OPTIONS = ['new', 'organic', 'seasonal', 'popular', 'discount'];

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchProducts, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, filterCategory, filterStatus, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminProductAPI.getAll({
        page: currentPage,
        limit: 20,
        search: searchTerm.trim(),
        category: filterCategory,
        status: filterStatus,
      });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const response = await adminProductAPI.delete(selectedProduct._id);
      if (response.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
        setTotalProducts((t) => t - 1);
        setShowDeleteModal(false);
        setSelectedProduct(null);
        if (products.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      const response = await adminProductAPI.toggleActive(productId);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, isActive: response.data.isActive } : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleToggleInStock = async (productId) => {
    try {
      const response = await adminProductAPI.toggleInStock(productId);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? { ...p, stock: { ...p.stock, inStock: response.data.inStock } }
              : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle stock status');
    }
  };

  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      const img = product.images[0];
      return img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`;
    }
    return '/default-product.png';
  };

  const getDiscount = (product) => {
    const { price, oldPrice } = product.pricing || {};
    if (price && oldPrice && oldPrice > price) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return null;
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-products">
        {/* Header */}
        <div className="page-header-p">
          <div>
            <h1>Products Management</h1>
            <p>Manage your product catalog ({totalProducts} total)</p>
          </div>
          <Link to="/admin/products/new" className="btn-primary-a">
            <i className="fas fa-plus"></i> Add New Product
          </Link>
        </div>

        {error && (
          <div className="error-message" style={{
            background: '#fee', border: '1px solid #fcc',
            borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#c53030',
          }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Filters */}
        <div className="products-controls">
          <div className="search-bar" style={{ position: 'relative' }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {loading && searchTerm && (
              <i className="fas fa-spinner fa-spin" style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', color: '#999',
              }} />
            )}
          </div>

          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => {
            const discount = getDiscount(product);
            return (
              <div key={product._id} className="product-card-admin">
                <div className="product-image">
                  <img
                    src={getProductImage(product)}
                    alt={product.images?.[0]?.alt || product.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />

                  {/* Active badge */}
                  <span className={`stock-badge ${product.isActive ? 'in-stock' : 'out-of-stock'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {/* In Stock badge */}
                  {!product.stock?.inStock && (
                    <span className="featured-badge" style={{ background: '#e74c3c', top: '40px' }}>
                      Out of Stock
                    </span>
                  )}

                  {/* Tags */}
                  {product.tags?.length > 0 && (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '8px',
                      display: 'flex', gap: '4px', flexWrap: 'wrap',
                    }}>
                      {product.tags.slice(0, 2).map((tag) => (
                        <span key={tag} style={{
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          textTransform: 'capitalize',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">
                    <i className="fas fa-tag"></i>
                    {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                    {product.unit && <span style={{ marginLeft: '6px', color: '#999' }}>/ {product.unit}</span>}
                  </p>

                  <div className="product-pricing">
                    <span className="selling-price">
                      ₹{product.pricing?.price?.toLocaleString()}
                    </span>
                    {product.pricing?.oldPrice && (
                      <span className="mrp-price">
                        ₹{product.pricing.oldPrice.toLocaleString()}
                      </span>
                    )}
                    {discount && (
                      <span className="discount">{discount}% OFF</span>
                    )}
                  </div>

                  <div className="product-meta">
                    <div className="meta-item">
                      <i className="fas fa-boxes"></i>
                      <span>{product.stock?.quantity ?? 0} in stock</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-circle" style={{ color: product.stock?.inStock ? '#27ae60' : '#e74c3c', fontSize: '8px' }}></i>
                      <span>{product.stock?.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <Link to={`/admin/products/edit/${product._id}`} className="btn-action btn-edit">
                      <i className="fas fa-edit"></i> Edit
                    </Link>
                    <button
                      className="btn-action btn-view"
                      onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button
                      className={`btn-action ${product.isActive ? 'btn-featured' : 'btn-secondary-a'}`}
                      onClick={() => handleToggleActive(product._id)}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`fas ${product.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                    </button>
                    <button
                      className={`btn-action ${product.stock?.inStock ? 'btn-secondary-a' : 'btn-featured'}`}
                      onClick={() => handleToggleInStock(product._id)}
                      title={product.stock?.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    >
                      <i className="fas fa-warehouse"></i>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !loading && !error && (
          <div className="no-data">
            <i className="fas fa-box-open"></i>
            <p>No products found</p>
            <Link to="/admin/products/new" className="btn-primary-a">Add Your First Product</Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-a" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash"></i> Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;