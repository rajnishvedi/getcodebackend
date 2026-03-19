import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/css/orders.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (imageUrl) => {
  if (!imageUrl) return '/default-product.png';
  return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/uploads/products/${imageUrl}`;
};

// ── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  placed:     { label: 'Order Placed',  color: '#3b82f6', bg: '#eff6ff', icon: 'fa-check-circle',     step: 1 },
  confirmed:  { label: 'Confirmed',     color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-thumbs-up',        step: 2 },
  processing: { label: 'Processing',    color: '#f59e0b', bg: '#fffbeb', icon: 'fa-cog',              step: 3 },
  shipped:    { label: 'Shipped',       color: '#06b6d4', bg: '#ecfeff', icon: 'fa-truck',            step: 4 },
  delivered:  { label: 'Delivered',     color: '#22c55e', bg: '#f0fdf4', icon: 'fa-box-open',         step: 5 },
  cancelled:  { label: 'Cancelled',     color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle',     step: 0 },
};

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
};

const FILTER_TABS = [
  { value: 'all',       label: 'All Orders' },
  { value: 'placed',    label: 'Placed' },
  { value: 'processing',label: 'Processing' },
  { value: 'shipped',   label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span className="order-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <i className={`fa ${cfg.icon}`}></i>
      {cfg.label}
    </span>
  );
};

// ── Progress Tracker ─────────────────────────────────────────
const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return (
    <div className="order-progress order-progress--cancelled">
      <i className="fa fa-times-circle"></i>
      <span>This order was cancelled</span>
    </div>
  );

  const steps = [
    { key: 'placed',     label: 'Placed',     icon: 'fa-check' },
    { key: 'confirmed',  label: 'Confirmed',  icon: 'fa-thumbs-up' },
    { key: 'processing', label: 'Processing', icon: 'fa-cog' },
    { key: 'shipped',    label: 'Shipped',    icon: 'fa-truck' },
    { key: 'delivered',  label: 'Delivered',  icon: 'fa-box-open' },
  ];

  const currentStep = STATUS_CONFIG[status]?.step || 1;

  return (
    <div className="order-progress">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={step.key} className={`progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
            <div className="progress-step__circle">
              <i className={`fa ${done ? 'fa-check' : step.icon}`}></i>
            </div>
            <span className="progress-step__label">{step.label}</span>
            {idx < steps.length - 1 && (
              <div className={`progress-step__line ${done ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Cancel Modal ─────────────────────────────────────────────
const CancelModal = ({ order, onClose, onConfirm, cancelling }) => {
  const [reason, setReason] = useState('');
  const REASONS = [
    'Changed my mind',
    'Ordered by mistake',
    'Found a better price',
    'Delivery time too long',
    'Other',
  ];

  return (
    <div className="orders-backdrop" onClick={onClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal__header">
          <h3><i className="fa fa-exclamation-triangle"></i> Cancel Order</h3>
          <button className="cancel-modal__close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>
        <div className="cancel-modal__body">
          <p>Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?</p>
          <label>Reason for cancellation</label>
          <div className="cancel-reasons">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`cancel-reason-chip ${reason === r ? 'cancel-reason-chip--on' : ''}`}
                onClick={() => setReason(r)}
              >
                {reason === r && <i className="fa fa-check"></i>} {r}
              </button>
            ))}
          </div>
        </div>
        <div className="cancel-modal__footer">
          <button className="cancel-modal__no" onClick={onClose}>Keep Order</button>
          <button
            className="cancel-modal__yes"
            onClick={() => onConfirm(order._id, reason || 'Cancelled by customer')}
            disabled={cancelling}
          >
            {cancelling ? <><i className="fa fa-spinner fa-spin"></i> Cancelling…</> : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Order Detail Modal ───────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onCancel }) => {
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="orders-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-modal__header">
          <div>
            <h3>{order.orderNumber}</h3>
            <span className="detail-modal__date">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="detail-modal__header-right">
            <StatusBadge status={order.status} />
            <button className="detail-modal__close" onClick={onClose}><i className="fa fa-times"></i></button>
          </div>
        </div>

        <div className="detail-modal__body">
          {/* Progress */}
          <OrderProgress status={order.status} />

          {/* Items */}
          <div className="detail-section">
            <h4 className="detail-section__title"><i className="fa fa-shopping-bag"></i> Items Ordered</h4>
            <div className="detail-items">
              {order.items.map((item, i) => (
                <div key={i} className="detail-item">
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />
                  <div className="detail-item__info">
                    <p>{item.name}</p>
                    <small>₹{item.price?.toFixed(2)}{item.unit ? `/${item.unit}` : ''} × {item.quantity}</small>
                  </div>
                  <div className="detail-item__total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-col: address + pricing */}
          <div className="detail-two-col">
            <div className="detail-section">
              <h4 className="detail-section__title"><i className="fa fa-map-marker-alt"></i> Delivery Address</h4>
              <div className="detail-address">
                <p className="detail-address__name">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                <p><i className="fa fa-phone"></i> {order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section__title"><i className="fa fa-receipt"></i> Bill Summary</h4>
              <div className="detail-pricing">
                <div><span>Subtotal</span><span>₹{order.pricing?.subtotal?.toFixed(2)}</span></div>
                <div><span>Shipping</span><span className={order.pricing?.shipping === 0 ? 'free' : ''}>{order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping}`}</span></div>
                <div><span>Tax (5%)</span><span>₹{order.pricing?.tax?.toFixed(2)}</span></div>
                <div className="detail-pricing__total"><span>Total</span><span>₹{order.pricing?.total?.toFixed(2)}</span></div>
              </div>
              <div className="detail-payment">
                <i className="fa fa-credit-card"></i>
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                <span className={`detail-payment-status ${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="detail-section">
              <h4 className="detail-section__title"><i className="fa fa-sticky-note"></i> Order Notes</h4>
              <p className="detail-notes">{order.notes}</p>
            </div>
          )}

          {/* Cancel reason if cancelled */}
          {order.status === 'cancelled' && order.cancelReason && (
            <div className="detail-cancel-reason">
              <i className="fa fa-info-circle"></i>
              Cancellation reason: <strong>{order.cancelReason}</strong>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="detail-modal__footer">
          <Link to="/products" className="detail-action-btn detail-action-btn--shop" onClick={onClose}>
            <i className="fa fa-leaf"></i> Shop Again
          </Link>
          {canCancel && (
            <button className="detail-action-btn detail-action-btn--cancel" onClick={() => onCancel(order)}>
              <i className="fa fa-times-circle"></i> Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Order Card ───────────────────────────────────────────────
const OrderCard = ({ order, onViewDetail, onCancel }) => {
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="order-card">
      {/* Top row */}
      <div className="order-card__top">
        <div className="order-card__meta">
          <span className="order-card__number">{order.orderNumber}</span>
          <span className="order-card__date"><i className="fa fa-calendar-alt"></i> {date}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items preview */}
      <div className="order-card__items">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="order-card__item-thumb" title={item.name}>
            <img
              src={getProductImage(item.image)}
              alt={item.name}
              onError={(e) => { e.target.src = '/default-product.png'; }}
            />
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="order-card__item-more">+{order.items.length - 3}</div>
        )}
        <div className="order-card__item-names">
          {order.items.slice(0, 2).map((item, i) => (
            <span key={i}>{item.name}{i < Math.min(order.items.length, 2) - 1 ? ', ' : ''}</span>
          ))}
          {order.items.length > 2 && <span> & {order.items.length - 2} more</span>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="order-card__bottom">
        <div className="order-card__price-info">
          <span className="order-card__total">₹{order.pricing?.total?.toFixed(2)}</span>
          <span className="order-card__payment">
            <i className="fa fa-credit-card"></i>
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </span>
          <span className="order-card__items-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="order-card__actions">
          <button className="order-btn order-btn--view" onClick={() => onViewDetail(order)}>
            <i className="fa fa-eye"></i> View Details
          </button>
          {canCancel && (
            <button className="order-btn order-btn--cancel" onClick={() => onCancel(order)}>
              <i className="fa fa-times"></i> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const MyOrders = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const LIMIT = 8;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: LIMIT };
      if (activeFilter !== 'all') params.status = activeFilter;
      const res = await orderAPI.getMyOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalOrders(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('fetchOrders error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, currentPage]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: '/orders' } } }); return; }
    fetchOrders();
  }, [authLoading, isLoggedIn, fetchOrders]);

  useEffect(() => { setCurrentPage(1); }, [activeFilter]);

  const handleCancelConfirm = async (orderId, reason) => {
    setCancelling(true);
    try {
      const res = await orderAPI.cancelOrder(orderId, { reason });
      if (res.data.success) {
        showToast('Order cancelled successfully');
        setCancelTarget(null);
        setSelectedOrder(null);
        await fetchOrders();
      } else {
        showToast(res.data.message || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f4' }}>
      <div style={{ width: 44, height: 44, border: '3px solid #e5eedd', borderTopColor: '#4a8c2a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="orders-page">
      {/* Toast */}
      {toast && (
        <div className={`orders-toast orders-toast--${toast.type}`}>
          <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && !cancelTarget && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={(order) => { setSelectedOrder(null); setCancelTarget(order); }}
        />
      )}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
          cancelling={cancelling}
        />
      )}

      {/* Header */}
      <div className="orders-header">
        <div className="container">
          <div className="orders-header__inner">
            <div>
              <h1><i className="fa fa-box"></i> My Orders</h1>
              <p>{totalOrders > 0 ? `${totalOrders} order${totalOrders !== 1 ? 's' : ''} placed` : 'Track all your orders'}</p>
            </div>
            <Link to="/products" className="orders-shop-link">
              <i className="fa fa-leaf"></i> Continue Shopping
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="orders-filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                className={`orders-filter-tab ${activeFilter === tab.value ? 'orders-filter-tab--active' : ''}`}
                onClick={() => setActiveFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container orders-body">
        {loading ? (
          <div className="orders-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="order-skeleton">
                <div className="order-skeleton__top" />
                <div className="order-skeleton__mid" />
                <div className="order-skeleton__bot" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty__icon">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="#f0f7e8"/>
                <rect x="28" y="30" width="44" height="52" rx="4" fill="#4a8c2a" opacity=".15"/>
                <rect x="35" y="42" width="30" height="3" rx="1.5" fill="#4a8c2a" opacity=".4"/>
                <rect x="35" y="50" width="22" height="3" rx="1.5" fill="#4a8c2a" opacity=".4"/>
                <rect x="35" y="58" width="26" height="3" rx="1.5" fill="#4a8c2a" opacity=".4"/>
                <circle cx="50" cy="33" r="6" fill="#4a8c2a" opacity=".6"/>
                <path d="M47 33l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>
              {activeFilter !== 'all'
                ? `No ${activeFilter} orders found.`
                : "Looks like you haven't placed any orders yet."}
            </p>
            <Link to="/products" className="orders-empty__cta">
              <i className="fa fa-leaf"></i> Start Shopping
            </Link>
            {activeFilter !== 'all' && (
              <button className="orders-empty__reset" onClick={() => setActiveFilter('all')}>
                View all orders
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetail={setSelectedOrder}
                  onCancel={setCancelTarget}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="orders-pagination">
                <button
                  className="orders-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <i className="fa fa-chevron-left"></i> Prev
                </button>
                <span className="orders-page-info">Page {currentPage} of {totalPages}</span>
                <button
                  className="orders-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;