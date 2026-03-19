// frontend/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN AUTH ====================
export const adminAuth = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/me'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/change-password', data),
};

// ==================== USER AUTH ====================
export const userAuth = {
  register: (data) => api.post('/users/register', data),
  loginUser: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    return fetch(`${apiUrl}/users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json());
  },
  changePassword: (data) => api.put('/users/change-password', data),
  deleteProfileImage: () => api.delete('/users/profile-image'),
};

// ==================== USER MANAGEMENT (ADMIN) ====================
export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  toggleStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/users/stats'),
};

// ==================== PUBLIC PRODUCT API ====================
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getByCategory: (category, params = {}) => api.get(`/products/category/${category}`, { params }),
  search: (query, params = {}) => api.get('/products/search', { params: { q: query, ...params } }),
};

// ==================== ADMIN PRODUCT API ====================
export const adminProductAPI = {
  // Listings & stats
  getAll: (params) => api.get('/admin/products', { params }),
  getById: (id) => api.get(`/admin/products/${id}`),
  getStats: () => api.get('/admin/products/stats'),

  // Create (multipart FormData)
  create: (formData) =>
    api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update (multipart FormData)
  update: (id, formData) =>
    api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete product
  delete: (id) => api.delete(`/admin/products/${id}`),

  // Delete a single image
  deleteImage: (id, filename) => api.delete(`/admin/products/${id}/images/${filename}`),

  // Toggle active/inactive
  toggleActive: (id) => api.put(`/admin/products/${id}/toggle-active`),

  // Toggle in-stock / out-of-stock
  toggleInStock: (id) => api.put(`/admin/products/${id}/toggle-instock`),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [userStats, productStats] = await Promise.all([
        userAPI.getStats(),
        adminProductAPI.getStats(),
      ]);
      return {
        data: {
          success: true,
          stats: { ...userStats.data.stats, ...productStats.data.stats },
        },
      };
    } catch {
      return { data: { success: false, message: 'Failed to fetch dashboard stats' } };
    }
  },
};

// ==================== CART ====================
export const cartAPI = {
  getCart: () => api.get('/cart'),
  getCartCount: () => api.get('/cart/count'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// ==================== WISHLIST ====================
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
  addToWishlist: (productId) => api.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
};

// ==================== ORDERS ====================
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params = {}) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  // Admin
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getOrderStats: () => api.get('/admin/orders/stats'),
};

// ==================== ADDRESSES ====================
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getOne: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

export default api;