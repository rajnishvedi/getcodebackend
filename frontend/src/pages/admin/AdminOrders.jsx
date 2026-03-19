import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderAPI } from '../../services/api';
import '../../styles/admin/AdminOrders.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (imageUrl) => {
  if (!imageUrl) return '/default-product.png';
  return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/uploads/products/${imageUrl}`;
};

const formatPrice = (price) => `₹${(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── Schema-aligned status config ────────────────────────────
const ORDER_STATUS_CONFIG = {
  placed:     { color: '#3b82f6', bg: '#eff6ff', label: 'Placed' },
  confirmed:  { color: '#8b5cf6', bg: '#f5f3ff', label: 'Confirmed' },
  processing: { color: '#f59e0b', bg: '#fffbeb', label: 'Processing' },
  shipped:    { color: '#06b6d4', bg: '#ecfeff', label: 'Shipped' },
  delivered:  { color: '#22c55e', bg: '#f0fdf4', label: 'Delivered' },
  cancelled:  { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
};

const PAYMENT_STATUS_CONFIG = {
  pending:  { color: '#f59e0b', bg: '#fffbeb', label: 'Pending' },
  paid:     { color: '#22c55e', bg: '#f0fdf4', label: 'Paid' },
  failed:   { color: '#ef4444', bg: '#fef2f2', label: 'Failed' },
  refunded: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Refunded' },
};

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
};

// Valid status transitions (only forward + cancel)
const NEXT_STATUSES = {
  placed:     ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const StatusBadge = ({ status, config }) => {
  const cfg = config[status];
  if (!cfg) return <span>{status}</span>;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
      fontWeight: '700', color: cfg.color, background: cfg.bg,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

// ── Status Update Modal ──────────────────────────────────────
const StatusModal = ({ order, onClose, onSave }) => {
  const allowed = NEXT_STATUSES[order.status] || [];
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await orderAPI.updateOrderStatus(order._id, { status, paymentStatus });
      if (res.data.success) { onSave(); }
      else setError(res.data.message || 'Failed to update');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ao-backdrop" onClick={onClose}>
      <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ao-modal__header">
          <h3><i className="fas fa-edit"></i> Update Order</h3>
          <button onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="ao-modal__sub">
          <strong>{order.orderNumber}</strong> &nbsp;·&nbsp;
          {order.shippingAddress?.fullName}
        </div>

        {error && (
          <div className="ao-modal__error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ao-modal__form">
          <div className="ao-form-group">
            <label>Order Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {/* Current status always selectable */}
              <option value={order.status}>{ORDER_STATUS_CONFIG[order.status]?.label} (current)</option>
              {allowed.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_CONFIG[s]?.label}</option>
              ))}
            </select>
            {allowed.length === 0 && (
              <small style={{ color: '#aaa' }}>No further status changes allowed.</small>
            )}
          </div>

          <div className="ao-form-group">
            <label>Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="ao-modal__footer">
            <button type="button" className="ao-btn ao-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ao-btn ao-btn--primary" disabled={saving || allowed.length === 0}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Order Details Modal ──────────────────────────────────────
const DetailsModal = ({ order, onClose, onUpdateStatus }) => (
  <div className="ao-backdrop" onClick={onClose}>
    <div className="ao-modal ao-modal--large" onClick={(e) => e.stopPropagation()}>
      <div className="ao-modal__header">
        <h3><i className="fas fa-receipt"></i> {order.orderNumber}</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <StatusBadge status={order.status} config={ORDER_STATUS_CONFIG} />
          <button onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
      </div>

      <div className="ao-detail-body">
        {/* Meta row */}
        <div className="ao-detail-meta">
          <div><i className="fas fa-calendar-alt"></i> {formatDate(order.createdAt)}</div>
          <div>
            <i className="fas fa-credit-card"></i>
            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            &nbsp;&nbsp;
            <StatusBadge status={order.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
          </div>
          {order.notes && (
            <div><i className="fas fa-sticky-note"></i> {order.notes}</div>
          )}
        </div>

        <div className="ao-detail-grid">
          {/* Items */}
          <div className="ao-detail-section ao-detail-section--full">
            <h4><i className="fas fa-shopping-bag"></i> Items ({order.items.length})</h4>
            <div className="ao-detail-items">
              {order.items.map((item, i) => (
                <div key={i} className="ao-detail-item">
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />
                  <div className="ao-detail-item__info">
                    <strong>{item.name}</strong>
                    <small>₹{item.price?.toFixed(2)}{item.unit ? `/${item.unit}` : ''} × {item.quantity}</small>
                  </div>
                  <div className="ao-detail-item__subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="ao-detail-section">
            <h4><i className="fas fa-map-marker-alt"></i> Delivery Address</h4>
            <div className="ao-addr">
              <p className="ao-addr__name">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
              <p><i className="fas fa-phone"></i> {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="ao-detail-section">
            <h4><i className="fas fa-rupee-sign"></i> Bill Summary</h4>
            <div className="ao-bill">
              <div><span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span></div>
              <div><span>Shipping</span><span>{order.pricing?.shipping === 0 ? <span className="ao-free">FREE</span> : formatPrice(order.pricing?.shipping)}</span></div>
              <div><span>Tax (5%)</span><span>{formatPrice(order.pricing?.tax)}</span></div>
              <div className="ao-bill__total"><span>Total</span><strong>{formatPrice(order.pricing?.total)}</strong></div>
            </div>
          </div>
        </div>

        {/* Cancel reason */}
        {order.status === 'cancelled' && order.cancelReason && (
          <div className="ao-cancel-note">
            <i className="fas fa-info-circle"></i>
            Cancelled by customer — <strong>{order.cancelReason}</strong>
          </div>
        )}
      </div>

      <div className="ao-modal__footer ao-detail-footer">
        <button className="ao-btn ao-btn--ghost" onClick={onClose}>Close</button>
        {NEXT_STATUSES[order.status]?.length > 0 && (
          <button className="ao-btn ao-btn--primary" onClick={() => { onClose(); onUpdateStatus(order); }}>
            <i className="fas fa-edit"></i> Update Status
          </button>
        )}
      </div>
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState(null);

  const searchTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment, currentPage]);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  useEffect(() => { fetchStats(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPayment !== 'all') params.paymentStatus = filterPayment;

      const res = await orderAPI.getAllOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.total || 0);
      }
    } catch (err) {
      console.error('fetchOrders error:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await orderAPI.getOrderStats();
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  };

  const handleStatusSaved = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    showToast('Order updated successfully');
    fetchOrders();
    fetchStats();
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading orders…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`ao-toast ao-toast--${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {showStatusModal && selectedOrder && (
        <StatusModal
          order={selectedOrder}
          onClose={() => { setShowStatusModal(false); setSelectedOrder(null); }}
          onSave={handleStatusSaved}
        />
      )}
      {showDetailsModal && selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          onClose={() => { setShowDetailsModal(false); setSelectedOrder(null); }}
          onUpdateStatus={(order) => { setSelectedOrder(order); setShowStatusModal(true); }}
        />
      )}

      <div className="admin-orders">
        {/* Page header */}
        <div className="page-header-a">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track all customer orders ({totalOrders} total)</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="ao-stats">
            {[
              { label: 'Total Orders',   value: stats.total,      icon: 'fa-shopping-cart', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'New / Placed',   value: stats.placed,     icon: 'fa-check-circle',  color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'In Progress',    value: stats.processing, icon: 'fa-cog',           color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Delivered',      value: stats.delivered,  icon: 'fa-box-open',      color: '#22c55e', bg: '#f0fdf4' },
              { label: 'Cancelled',      value: stats.cancelled,  icon: 'fa-times-circle',  color: '#ef4444', bg: '#fef2f2' },
              { label: 'Total Revenue',  value: formatPrice(stats.revenue), icon: 'fa-rupee-sign', color: '#2d6318', bg: '#f0f7e8' },
            ].map((s, i) => (
              <div key={i} className="ao-stat-card" style={{ '--card-color': s.color }}>
                <div className="ao-stat-card__icon" style={{ background: s.bg, color: s.color }}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <div className="ao-stat-card__info">
                  <strong>{s.value ?? 0}</strong>
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="orders-controls">
          <div className="search-bar" style={{ position: 'relative' }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by order number or customer name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && searchTerm && (
              <i className="fas fa-spinner fa-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterPayment}
            onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="all">All Payment</option>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    <i className="fas fa-shopping-cart"></i>
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    {/* Order number */}
                    <td>
                      <strong style={{ fontSize: '13px', color: '#1a2a10' }}>{order.orderNumber}</strong>
                    </td>

                    {/* Customer */}
                    <td>
                      <div>
                        <strong style={{ fontSize: '13px' }}>{order.shippingAddress?.fullName || '—'}</strong>
                        <br />
                        <small style={{ color: '#888' }}>{order.shippingAddress?.phone || ''}</small>
                      </div>
                    </td>

                    {/* Items count */}
                    <td>
                      <span style={{
                        background: '#f0f7e8', color: '#2d6318',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600',
                      }}>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Total */}
                    <td>
                      <strong>{formatPrice(order.pricing?.total)}</strong>
                      <br />
                      <small style={{ color: '#aaa', fontSize: '11px' }}>
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </small>
                    </td>

                    {/* Payment status */}
                    <td>
                      <StatusBadge status={order.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
                    </td>

                    {/* Order status */}
                    <td>
                      <StatusBadge status={order.status} config={ORDER_STATUS_CONFIG} />
                    </td>

                    {/* Date */}
                    <td>
                      <small style={{ color: '#666' }}>{formatDate(order.createdAt)}</small>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          title="View Details"
                          onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          title="Update Status"
                          onClick={() => { setSelectedOrder(order); setShowStatusModal(true); }}
                          disabled={NEXT_STATUSES[order.status]?.length === 0}
                          style={{ opacity: NEXT_STATUSES[order.status]?.length === 0 ? 0.4 : 1 }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </AdminLayout>
  );
};

export default AdminOrders;