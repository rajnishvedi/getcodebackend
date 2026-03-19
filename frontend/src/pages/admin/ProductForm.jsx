import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminProductAPI } from '../../services/api';
import '../../styles/admin/ProductForm.css';

const CATEGORY_OPTIONS = ['vegetable', 'fruit'];
const TAG_OPTIONS = ['new', 'organic', 'seasonal', 'popular', 'discount'];
const UNIT_OPTIONS = ['kg', 'gram', 'piece', 'dozen'];
const MAX_IMAGES = 4;
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetable',
    description: '',
    price: '',
    oldPrice: '',
    currency: 'INR',
    unit: 'kg',
    stockQuantity: '',
    inStock: true,
    tags: [],
    isActive: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEditMode) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminProductAPI.getById(id);
      if (response.data.success) {
        const p = response.data.product;
        setFormData({
          name: p.name || '',
          category: p.category || 'vegetable',
          description: p.description || '',
          price: p.pricing?.price ?? '',
          oldPrice: p.pricing?.oldPrice ?? '',
          currency: p.pricing?.currency || 'INR',
          unit: p.unit || 'kg',
          stockQuantity: p.stock?.quantity ?? '',
          inStock: p.stock?.inStock ?? true,
          tags: p.tags || [],
          isActive: p.isActive ?? true,
        });
        setExistingImages(p.images || []);
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = existingImages.length + imageFiles.length;
    const allowedCount = MAX_IMAGES - currentCount;

    if (allowedCount <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed. Remove existing ones first.`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) { alert(`${file.name} is not an image`); return false; }
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} exceeds 5MB limit`); return false; }
      return true;
    }).slice(0, allowedCount);

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (filename) => {
    if (!isEditMode) return;
    try {
      const response = await adminProductAPI.deleteImage(id, filename);
      if (response.data.success) {
        setExistingImages((prev) => prev.filter((img) => img.url !== filename));
      }
    } catch {
      alert('Failed to delete image');
    }
  };

  const getDiscount = () => {
    const p = parseFloat(formData.price);
    const op = parseFloat(formData.oldPrice);
    if (p && op && op > p) return `${Math.round(((op - p) / op) * 100)}%`;
    return '—';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      if (formData.oldPrice) fd.append('oldPrice', formData.oldPrice);
      fd.append('currency', formData.currency);
      fd.append('unit', formData.unit);
      fd.append('stockQuantity', formData.stockQuantity || 0);
      fd.append('inStock', formData.inStock);
      fd.append('tags', JSON.stringify(formData.tags));
      fd.append('isActive', formData.isActive);
      if (isEditMode) fd.append('keepExistingImages', 'true');

      imageFiles.forEach((file) => fd.append('images', file));

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');
      const url = isEditMode
        ? `${apiUrl}/admin/products/${id}`
        : `${apiUrl}/admin/products`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();
      if (data.success) {
        navigate('/admin/products');
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-form">
        {/* Header */}
        <div className="form-header">
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <p>Fill in the product information below</p>
          </div>
          <button className="btn-secondary-a" onClick={() => navigate('/admin/products')}>
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>

        {error && (
          <div className="error-message" style={{
            background: '#fee', border: '1px solid #fcc',
            borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#c53030',
          }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>

            {/* Name */}
            <div className="form-group full-width">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fresh Tomatoes"
                required
              />
            </div>

            {/* Category & Unit */}
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit *</label>
                <select name="unit" value={formData.unit} onChange={handleChange}>
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description..."
                rows="4"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h2>Pricing</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Old Price (₹)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Discount</label>
                <input
                  type="text"
                  value={getDiscount()}
                  disabled
                  className="calculated-field"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="INR"
                  maxLength="5"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="form-section">
            <h2>Stock</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="100"
                  required
                  min="0"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                  />
                  <span>In Stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h2>Tags</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {TAG_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500',
                    border: '2px solid',
                    borderColor: formData.tags.includes(tag) ? '#667eea' : '#ddd',
                    background: formData.tags.includes(tag) ? '#eef0ff' : '#fff',
                    color: formData.tags.includes(tag) ? '#667eea' : '#666',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  {formData.tags.includes(tag) && <i className="fas fa-check" style={{ fontSize: '11px' }}></i>}
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Product Images</h2>

            <div style={{
              background: '#e3f2fd', border: '1px solid #2196f3',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
            }}>
              <i className="fas fa-info-circle" style={{ color: '#2196f3' }}></i>
              <strong style={{ marginLeft: '8px' }}>Image Requirements:</strong>
              <span style={{ marginLeft: '8px', color: '#555', fontSize: '14px' }}>
                Max {MAX_IMAGES} images · First image = thumbnail · Max 5MB each (JPG, PNG, WEBP)
                · Current: {existingImages.length + imageFiles.length}/{MAX_IMAGES}
              </span>
            </div>

            <div className="image-upload-container">
              {(existingImages.length + imageFiles.length) < MAX_IMAGES && (
                <div className="upload-area">
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imageUpload" className="upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload images</p>
                    <small>
                      {MAX_IMAGES - existingImages.length - imageFiles.length} more image(s) allowed
                    </small>
                  </label>
                </div>
              )}

              {/* Existing images */}
              {isEditMode && existingImages.length > 0 && (
                <div>
                  <h3 style={{ margin: '20px 0 12px' }}>Current Images ({existingImages.length}/{MAX_IMAGES})</h3>
                  <div className="image-preview-grid">
                    {existingImages.map((img, index) => {
                      const src = img.url?.startsWith('http')
                        ? img.url
                        : `${BASE_URL}/uploads/products/${img.url}`;
                      return (
                        <div key={`existing-${index}`} className="preview-item">
                          <img src={src} alt={img.alt || `Product ${index + 1}`} />
                          <button type="button" className="remove-image-btn" onClick={() => removeExistingImage(img.url)}>
                            <i className="fas fa-times"></i>
                          </button>
                          {index === 0 && (
                            <span className="primary-badge"><i className="fas fa-star"></i> Thumbnail</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New images */}
              {imagePreviews.length > 0 && (
                <div>
                  <h3 style={{ margin: '20px 0 12px' }}>New Images to Upload ({imagePreviews.length})</h3>
                  <div className="image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="preview-item">
                        <img src={preview} alt={`New ${index + 1}`} />
                        <button type="button" className="remove-image-btn" onClick={() => removeNewImage(index)}>
                          <i className="fas fa-times"></i>
                        </button>
                        {existingImages.length === 0 && index === 0 && (
                          <span className="primary-badge"><i className="fas fa-star"></i> Thumbnail</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="form-section">
            <h2>Status</h2>
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Active (visible to customers)</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary-a" onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-a" disabled={saving}>
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> {isEditMode ? 'Update Product' : 'Create Product'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;