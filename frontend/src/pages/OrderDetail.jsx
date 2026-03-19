import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/css/order-detail.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (imageUrl) => {
  if (!imageUrl) return '/default-product.png';
  return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/uploads/products/${imageUrl}`;
};

const STATUS_CONFIG = {
  placed:     { label: 'Order Placed',  color: '#3b82f6', bg: '#eff6ff', icon: 'fa-check-circle',   step: 1 },
  confirmed:  { label: 'Confirmed',     color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-thumbs-up',      step: 2 },
  processing: { label: 'Processing',    color: '#f59e0b', bg: '#fffbeb', icon: 'fa-cog',            step: 3 },
  shipped:    { label: 'Shipped',       color: '#06b6d4', bg: '#ecfeff', icon: 'fa-truck',          step: 4 },
  delivered:  { label: 'Delivered',     color: '#22c55e', bg: '#f0fdf4', icon: 'fa-box-open',       step: 5 },
  cancelled:  { label: 'Cancelled',     color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle',   step: 0 },
};

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
};

const CANCEL_REASONS = [
  'Changed my mind', 'Ordered by mistake',
  'Found a better price', 'Delivery time too long', 'Other',
];

// ── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span className="od-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <i className={`fa ${cfg.icon}`}></i> {cfg.label}
    </span>
  );
};

// ── Progress Stepper ─────────────────────────────────────────
const OrderProgress = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="od-progress-cancelled">
        <i className="fa fa-times-circle"></i>
        <div>
          <strong>Order Cancelled</strong>
          <p>This order has been cancelled and stock has been restored.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'placed',     label: 'Order Placed',  icon: 'fa-check',    desc: 'We received your order' },
    { key: 'confirmed',  label: 'Confirmed',     icon: 'fa-thumbs-up',desc: 'Order is confirmed' },
    { key: 'processing', label: 'Processing',    icon: 'fa-cog',      desc: 'Being prepared' },
    { key: 'shipped',    label: 'Shipped',       icon: 'fa-truck',    desc: 'Out for delivery' },
    { key: 'delivered',  label: 'Delivered',     icon: 'fa-box-open', desc: 'Delivered successfully' },
  ];

  const current = STATUS_CONFIG[status]?.step || 1;

  return (
    <div className="od-progress">
      {steps.map((step, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={step.key} className={`od-step ${done ? 'od-step--done' : ''} ${active ? 'od-step--active' : ''}`}>
            {idx < steps.length - 1 && (
              <div className={`od-step__connector ${done ? 'od-step__connector--done' : ''}`} />
            )}
            <div className="od-step__circle">
              <i className={`fa ${done ? 'fa-check' : step.icon}`}></i>
            </div>
            <div className="od-step__info">
              <strong>{step.label}</strong>
              <span>{step.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Cancel Modal ─────────────────────────────────────────────
const CancelModal = ({ orderNumber, onClose, onConfirm, cancelling }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="od-backdrop" onClick={onClose}>
      <div className="od-cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="od-cancel-modal__header">
          <h3><i className="fa fa-exclamation-triangle"></i> Cancel Order</h3>
          <button onClick={onClose}><i className="fa fa-times"></i></button>
        </div>
        <div className="od-cancel-modal__body">
          <p>Are you sure you want to cancel <strong>{orderNumber}</strong>?</p>
          <label>Reason <small>(optional)</small></label>
          <div className="od-cancel-reasons">
            {CANCEL_REASONS.map((r) => (
              <button
                key={r} type="button"
                className={`od-reason-chip ${reason === r ? 'od-reason-chip--on' : ''}`}
                onClick={() => setReason(r)}
              >
                {reason === r && <i className="fa fa-check"></i>} {r}
              </button>
            ))}
          </div>
        </div>
        <div className="od-cancel-modal__footer">
          <button className="od-btn od-btn--ghost" onClick={onClose}>Keep Order</button>
          <button
            className="od-btn od-btn--danger"
            onClick={() => onConfirm(reason || 'Cancelled by customer')}
            disabled={cancelling}
          >
            {cancelling ? <><i className="fa fa-spinner fa-spin"></i> Cancelling…</> : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: `/orders/${id}` } } }); return; }
    fetchOrder();
  }, [authLoading, isLoggedIn, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderAPI.getOrderById(id);
      if (res.data.success) setOrder(res.data.order);
      else setError('Order not found.');
    } catch {
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      const res = await orderAPI.cancelOrder(id, { reason });
      if (res.data.success) {
        showToast('Order cancelled successfully');
        setShowCancel(false);
        await fetchOrder();
      } else {
        showToast(res.data.message || 'Failed to cancel', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ──
  if (authLoading || loading) return (
    <div className="od-page">
      <div className="od-header">
        <div className="container">
          <div className="od-header__skeleton" />
          <div className="od-header__skeleton od-header__skeleton--sm" />
        </div>
      </div>
      <div className="container od-body">
        <div className="od-skeleton-grid">
          {[1,2,3].map(i => <div key={i} className="od-skeleton-block" />)}
        </div>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="od-page">
      <div className="od-header"><div className="container"><h1><i className="fa fa-box"></i> Order Detail</h1></div></div>
      <div className="container od-body">
        <div className="od-error-state">
          <i className="fa fa-exclamation-circle"></i>
          <h3>{error}</h3>
          <Link to="/orders" className="od-btn od-btn--primary">Back to My Orders</Link>
        </div>
      </div>
    </div>
  );

  if (!order) return null;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="od-page">
      {/* Toast */}
      {toast && (
        <div className={`od-toast od-toast--${toast.type}`}>
          <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <CancelModal
          orderNumber={order.orderNumber}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
          cancelling={cancelling}
        />
      )}

      {/* ── Header ── */}
      <div className="od-header">
        <div className="container">
          <Link to="/orders" className="od-back-link">
            <i className="fa fa-arrow-left"></i> My Orders
          </Link>
          <div className="od-header__inner">
            <div className="od-header__left">
              <h1>{order.orderNumber}</h1>
              <p className="od-header__date"><i className="fa fa-calendar-alt"></i> {date}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container od-body">
        <div className="od-layout">

          {/* ── LEFT COLUMN ── */}
          <div className="od-left">

            {/* Progress */}
            <div className="od-card">
              <div className="od-card__title">
                <i className="fa fa-route"></i> Order Status
              </div>
              <OrderProgress status={order.status} />
              {order.status === 'cancelled' && order.cancelReason && (
                <div className="od-cancel-reason-note">
                  <i className="fa fa-info-circle"></i>
                  Reason: <strong>{order.cancelReason}</strong>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="od-card">
              <div className="od-card__title">
                <i className="fa fa-shopping-bag"></i> Items Ordered
                <span className="od-card__count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="od-items">
                {order.items.map((item, i) => (
                  <div key={i} className="od-item">
                    <div className="od-item__img">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        onError={(e) => { e.target.src = '/default-product.png'; }}
                      />
                    </div>
                    <div className="od-item__info">
                      <p className="od-item__name">{item.name}</p>
                      <p className="od-item__meta">
                        ₹{item.price?.toFixed(2)}{item.unit ? `/${item.unit}` : ''} × {item.quantity}
                      </p>
                    </div>
                    <div className="od-item__subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="od-card">
              <div className="od-card__title">
                <i className="fa fa-map-marker-alt"></i> Delivery Address
              </div>
              <div className="od-address">
                <div className="od-address__name">{order.shippingAddress?.fullName}</div>
                <p>
                  {order.shippingAddress?.line1}
                  {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}
                </p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <div className="od-address__phone">
                  <i className="fa fa-phone"></i> {order.shippingAddress?.phone}
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="od-card">
                <div className="od-card__title"><i className="fa fa-sticky-note"></i> Order Notes</div>
                <p className="od-notes">{order.notes}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="od-right">

            {/* Bill summary */}
            <div className="od-card od-card--sticky">
              <div className="od-card__title"><i className="fa fa-receipt"></i> Bill Summary</div>

              <div className="od-bill">
                <div className="od-bill__line">
                  <span>Subtotal ({order.items.length} items)</span>
                  <span>₹{order.pricing?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="od-bill__line">
                  <span>Shipping</span>
                  <span className={order.pricing?.shipping === 0 ? 'od-free' : ''}>
                    {order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping}`}
                  </span>
                </div>
                <div className="od-bill__line">
                  <span>Tax (5%)</span>
                  <span>₹{order.pricing?.tax?.toFixed(2)}</span>
                </div>
                <div className="od-bill__total">
                  <span>Total Paid</span>
                  <span>₹{order.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment info */}
              <div className="od-payment-box">
                <div className="od-payment-box__row">
                  <span><i className="fa fa-credit-card"></i> Payment Method</span>
                  <strong>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</strong>
                </div>
                <div className="od-payment-box__row">
                  <span><i className="fa fa-circle" style={{ color: order.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b', fontSize: '8px' }}></i> Payment Status</span>
                  <span className={`od-pay-status od-pay-status--${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="od-actions">
                {canCancel && (
                  <button className="od-btn od-btn--cancel-full" onClick={() => setShowCancel(true)}>
                    <i className="fa fa-times-circle"></i> Cancel Order
                  </button>
                )}
                <Link to="/products" className="od-btn od-btn--shop-full">
                  <i className="fa fa-leaf"></i> Continue Shopping
                </Link>
                <Link to="/orders" className="od-btn od-btn--orders-full">
                  <i className="fa fa-list"></i> All Orders
                </Link>
              </div>
            </div>

            {/* Order meta card */}
            <div className="od-card od-meta-card">
              <div className="od-meta-row">
                <span>Order ID</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="od-meta-row">
                <span>Placed On</span>
                <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
              <div className="od-meta-row">
                <span>Last Updated</span>
                <strong>{new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;