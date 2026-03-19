import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import '../../styles/admin/AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    parentCategory: '',
    order: 0,
    isActive: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, filterActive]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      const response = await fetch(`${apiUrl}/categories?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('icon', formData.icon);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('isFeatured', formData.isFeatured);

      if (formData.parentCategory) {
        formDataToSend.append('parentCategory', formData.parentCategory);
      }

      const seo = {
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };
      formDataToSend.append('seo', JSON.stringify(seo));

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingCategory
        ? `${apiUrl}/categories/${editingCategory._id}`
        : `${apiUrl}/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setShowModal(false);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      parentCategory: category.parentCategory?._id || '',
      order: category.order || 0,
      isActive: category.isActive,
      isFeatured: category.isFeatured || false,
      metaTitle: category.seo?.metaTitle || '',
      metaDescription: category.seo?.metaDescription || '',
      keywords: category.seo?.keywords?.join(', ') || '',
    });

    if (category.image) {
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      setImagePreview(`${apiUrl}/uploads/categories/${category.image}`);
    }

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${apiUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${apiUrl}/categories/${id}/toggle-active`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${apiUrl}/categories/${id}/toggle-featured`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to toggle featured');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      parentCategory: '',
      order: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${apiUrl}/uploads/categories/${filename}`;
  };

  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading categories...</p>
        </div>
      </AdminLayout>
    );
  }

  const mainCategories = categories.filter(cat => !cat.parentCategory);

  return (
    <AdminLayout>
      <div className="admin-categories">
        <div className="page-header">
          <div>
            <h1>Categories Management</h1>
            <p>Manage product categories ({categories.length} total)</p>
          </div>
          <button
            className="btn-primary-a"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus"></i>
            Add Category
          </button>
        </div>

        {/* Filters */}
        <div className="categories-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Categories Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                {/* <th>Products</th> */}
                <th>Order</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    <i className="fas fa-tags"></i>
                    <p>No categories found</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      {category.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="category-thumbnail"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                          }}
                        />
                      ) : category.icon ? (
                        <div className="category-icon">
                          <i className={category.icon}></i>
                        </div>
                      ) : (
                        <div className="category-icon">
                          <i className="fas fa-tag"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{category.name}</strong>
                      {category.parentCategory && (
                        <small style={{ display: 'block', color: '#666' }}>
                          Parent: {category.parentCategory.name}
                        </small>
                      )}
                    </td>
                    <td><code>{category.slug}</code></td>
                    {/* <td>{category.productCount || 0}</td> */}
                    <td>{category.order}</td>
                    <td>
                      <button
                        className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(category._id)}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`featured-badge ${category.isFeatured ? 'featured' : ''}`}
                        onClick={() => handleToggleFeatured(category._id)}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action-c btn-edit"
                          onClick={() => handleEdit(category)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action-c btn-delete"
                          onClick={() => handleDelete(category._id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Image Upload */}
              <div className="form-group">
                <label>Category Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="categoryImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="categoryImage" className="upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Incinerator Machines"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Category description..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icon (Font Awesome)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="e.g., fas fa-fire"
                  />
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Parent Category</label>
                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO meta title"
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO meta description"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="form-row checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-a" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-a">
                  <i className="fas fa-save"></i>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;