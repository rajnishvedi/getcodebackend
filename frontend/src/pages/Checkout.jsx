import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addressAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/css/checkout.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
  'Chandigarh','Puducherry',
];

const PAYMENT_METHODS = [
  { id: 'cod',        icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives at your door.' },
  { id: 'upi',        icon: '📱', label: 'UPI',              desc: 'Pay instantly using any UPI app.' },
  { id: 'card',       icon: '💳', label: 'Credit / Debit Card', desc: 'All major cards accepted securely.' },
  { id: 'netbanking', icon: '🏦', label: 'Net Banking',      desc: 'Transfer directly from your bank account.' },
];

const LABEL_OPTIONS = ['Home', 'Work', 'Other'];

const emptyForm = {
  label: 'Home', fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', country: 'India', isDefault: false,
};

const getProductImage = (item) => {
  if (!item.product.images || !item.product.images[0]) return '/default-product.png';
  
  const image = item.product.images[0];
  // If image is an object with a url property, use that
  if (image.url) {
    return image.url.startsWith('http') ? image.url : `${BASE_URL}/uploads/products/${image.url}`;
  }
  // If image is directly the string (like in your console output)
  return image.startsWith('http') ? image : `${BASE_URL}/uploads/products/${image}`;
};

// ─── Address Card ───────────────────────────────────────────
const AddressCard = ({ address, selected, onSelect, onEdit, onDelete, onSetDefault }) => (
  <div
    className={`addr-card ${selected ? 'addr-card--selected' : ''}`}
    onClick={() => onSelect(address)}
  >
    <div className="addr-card__radio">
      <div className={`addr-radio ${selected ? 'addr-radio--on' : ''}`} />
    </div>
    <div className="addr-card__body">
      <div className="addr-card__top">
        <span className="addr-label addr-label--{address.label.toLowerCase()}">{address.label}</span>
        {address.isDefault && <span className="addr-default-badge">Default</span>}
      </div>
      <p className="addr-name">{address.fullName} &nbsp;<span className="addr-phone">{address.phone}</span></p>
      <p className="addr-text">
        {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} — {address.pincode}
      </p>
    </div>
    <div className="addr-card__actions" onClick={(e) => e.stopPropagation()}>
      {!address.isDefault && (
        <button className="addr-action-btn" onClick={() => onSetDefault(address._id)} title="Set as default">
          <i className="fa fa-star"></i>
        </button>
      )}
      <button className="addr-action-btn" onClick={() => onEdit(address)} title="Edit">
        <i className="fa fa-pen"></i>
      </button>
      <button className="addr-action-btn addr-action-btn--del" onClick={() => onDelete(address._id)} title="Delete">
        <i className="fa fa-trash"></i>
      </button>
    </div>
  </div>
);

// ─── Address Form Modal ─────────────────────────────────────
const AddressModal = ({ editing, onClose, onSave }) => {
  const [form, setForm] = useState(editing || emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm(editing || emptyForm); }, [editing]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Valid 10-digit phone required';
    if (!form.line1.trim()) e.line1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state) e.state = 'Required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editing?._id) {
        await addressAPI.update(editing._id, form);
      } else {
        await addressAPI.create(form);
      }
      onSave();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to save address' });
    } finally {
      setSaving(false);
    }
  };

  const f = (name) => ({
    value: form[name],
    onChange: (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((p) => ({ ...p, [name]: val }));
      if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    },
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>{editing?._id ? 'Edit Address' : 'Add New Address'}</h3>
          <button className="addr-modal__close" onClick={onClose}><i className="fa fa-times"></i></button>
        </div>

        {errors.general && (
          <div className="addr-modal__error"><i className="fa fa-exclamation-circle"></i> {errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="addr-form" noValidate>
          {/* Label */}
          <div className="addr-form__label-row">
            {LABEL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`addr-label-chip ${form.label === opt ? 'addr-label-chip--on' : ''}`}
                onClick={() => setForm((p) => ({ ...p, label: opt }))}
              >
                {opt === 'Home' ? '🏠' : opt === 'Work' ? '💼' : '📍'} {opt}
              </button>
            ))}
          </div>

          <div className="addr-form__row">
            <div className={`addr-form__field ${errors.fullName ? 'addr-form__field--err' : ''}`}>
              <label>Full Name *</label>
              <input type="text" placeholder="John Doe" {...f('fullName')} />
              {errors.fullName && <span>{errors.fullName}</span>}
            </div>
            <div className={`addr-form__field ${errors.phone ? 'addr-form__field--err' : ''}`}>
              <label>Phone *</label>
              <input type="tel" placeholder="9876543210" maxLength={10} {...f('phone')} />
              {errors.phone && <span>{errors.phone}</span>}
            </div>
          </div>

          <div className={`addr-form__field ${errors.line1 ? 'addr-form__field--err' : ''}`}>
            <label>Address Line 1 *</label>
            <input type="text" placeholder="House No., Street, Area" {...f('line1')} />
            {errors.line1 && <span>{errors.line1}</span>}
          </div>

          <div className="addr-form__field">
            <label>Address Line 2 <small>(optional)</small></label>
            <input type="text" placeholder="Landmark, Colony" {...f('line2')} />
          </div>

          <div className="addr-form__row">
            <div className={`addr-form__field ${errors.city ? 'addr-form__field--err' : ''}`}>
              <label>City *</label>
              <input type="text" placeholder="Jaipur" {...f('city')} />
              {errors.city && <span>{errors.city}</span>}
            </div>
            <div className={`addr-form__field ${errors.pincode ? 'addr-form__field--err' : ''}`}>
              <label>Pincode *</label>
              <input type="text" placeholder="302001" maxLength={6} {...f('pincode')} />
              {errors.pincode && <span>{errors.pincode}</span>}
            </div>
          </div>

          <div className={`addr-form__field ${errors.state ? 'addr-form__field--err' : ''}`}>
            <label>State *</label>
            <select {...f('state')}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <span>{errors.state}</span>}
          </div>

          <label className="addr-form__default-check">
            <input type="checkbox" checked={form.isDefault} onChange={f('isDefault').onChange} />
            <span>Set as default address</span>
          </label>

          <div className="addr-form__actions">
            <button type="button" className="addr-form__cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="addr-form__submit" disabled={saving}>
              {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-check"></i> Save Address</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Order Success Modal ────────────────────────────────────
const SuccessModal = ({ order, onClose }) => (
  <div className="modal-backdrop">
    <div className="success-modal">
      <div className="success-modal__icon">
        <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="#f0f7e8"/><path d="M24 40l12 12 20-22" stroke="#4a8c2a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h2>Order Placed! 🎉</h2>
      <p>Your order <strong>{order.orderNumber}</strong> has been placed successfully.</p>
      <div className="success-modal__detail">
        <div><span>Total</span><span>₹{order.pricing?.total?.toFixed(2)}</span></div>
        <div><span>Payment</span><span style={{ textTransform: 'capitalize' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</span></div>
        <div><span>Status</span><span className="success-status">Placed</span></div>
      </div>
      <Link to="/orders" className="success-modal__btn" onClick={onClose}>View My Orders</Link>
      <Link to="/products" className="success-modal__link" onClick={onClose}>Continue Shopping →</Link>
    </div>
  </div>
);

// ─── Main Checkout Page ─────────────────────────────────────
const CheckoutPage = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { cartItems, cartSubtotal, cartCount, fetchCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const SHIPPING_THRESHOLD = 500;
  const shipping = cartSubtotal >= SHIPPING_THRESHOLD ? 0 : 49;
  const tax = parseFloat((cartSubtotal * 0.05).toFixed(2));
  const total = parseFloat((cartSubtotal + shipping + tax).toFixed(2));

  useEffect(() => {
    if (authLoading || cartLoading) return; // wait for both auth and cart to resolve
    if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
    if (cartCount === 0) { navigate('/cart'); return; }
    loadAddresses();
  }, [authLoading, cartLoading, isLoggedIn, cartCount]);

  const loadAddresses = async () => {
    try {
      setLoadingAddr(true);
      const res = await addressAPI.getAll();
      const list = res.data.addresses || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setSelectedAddress(def);
    } catch { } finally {
      setLoadingAddr(false);
    }
  };

  const handleSaveAddress = async () => {
    setShowModal(false);
    setEditingAddr(null);
    await loadAddresses();
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressAPI.delete(id);
      await loadAddresses();
    } catch { }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefault(id);
      await loadAddresses();
    } catch { }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setPlaceError('Please select a delivery address.'); return; }
    setPlaceError('');
    setPlacing(true);
    try {
      const res = await orderAPI.createOrder({
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          line1: selectedAddress.line1,
          line2: selectedAddress.line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country,
        },
        paymentMethod,
        notes,
      });
      if (res.data.success) {
        await fetchCart();
        setSuccessOrder(res.data.order);
      } else {
        setPlaceError(res.data.message || 'Failed to place order.');
      }
    } catch (err) {
      setPlaceError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading || cartLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f4' }}>
      <div style={{ width: 44, height: 44, border: '3px solid #e5eedd', borderTopColor: '#4a8c2a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isLoggedIn || cartCount === 0) return null;

  return (
    <div className="checkout-page">
      {/* Success modal */}
      {successOrder && <SuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />}

      {/* Address modal */}
      {showModal && (
        <AddressModal
          editing={editingAddr}
          onClose={() => { setShowModal(false); setEditingAddr(null); }}
          onSave={handleSaveAddress}
        />
      )}

      {/* ── Header ── */}
      <div className="checkout-header">
        <div className="container">
          <div className="checkout-header__inner">
            <div>
              <h1><i className="fa fa-lock"></i> Secure Checkout</h1>
              <p>{cartCount} item{cartCount > 1 ? 's' : ''} · ₹{total.toFixed(2)} total</p>
            </div>
            <Link to="/cart" className="checkout-back-link">
              <i className="fa fa-arrow-left"></i> Back to Cart
            </Link>
          </div>
          {/* Steps */}
          <div className="checkout-steps">
            {['Address', 'Payment', 'Review'].map((s, i) => (
              <div key={s} className={`checkout-step ${i <= 1 ? 'checkout-step--done' : ''}`}>
                <div className="checkout-step__dot">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container checkout-body">
        <div className="checkout-layout">

          {/* ══ LEFT COLUMN ══ */}
          <div className="checkout-left">

            {/* ── Section 1: Delivery Address ── */}
            <div className="checkout-section">
              <div className="checkout-section__head">
                <div className="checkout-section__num">1</div>
                <h2>Delivery Address</h2>
                <button
                  className="checkout-add-addr-btn"
                  onClick={() => { setEditingAddr(null); setShowModal(true); }}
                >
                  <i className="fa fa-plus"></i> Add New
                </button>
              </div>

              {loadingAddr ? (
                <div className="checkout-addr-loading">
                  {[1,2].map((i) => <div key={i} className="checkout-addr-skeleton" />)}
                </div>
              ) : addresses.length === 0 ? (
                <div className="checkout-no-addr">
                  <i className="fa fa-map-marker-alt"></i>
                  <p>No saved addresses yet.</p>
                  <button onClick={() => { setEditingAddr(null); setShowModal(true); }}>
                    <i className="fa fa-plus"></i> Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addr-list">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      address={addr}
                      selected={selectedAddress?._id === addr._id}
                      onSelect={setSelectedAddress}
                      onEdit={(a) => { setEditingAddr(a); setShowModal(true); }}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefault}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Section 2: Payment Method ── */}
            <div className="checkout-section">
              <div className="checkout-section__head">
                <div className="checkout-section__num">2</div>
                <h2>Payment Method</h2>
              </div>

              <div className="payment-grid">
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.id}
                    className={`payment-card ${paymentMethod === pm.id ? 'payment-card--selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <div className="payment-card__radio">
                      <div className={`pay-radio ${paymentMethod === pm.id ? 'pay-radio--on' : ''}`} />
                    </div>
                    <div className="payment-card__icon">{pm.icon}</div>
                    <div className="payment-card__info">
                      <strong>{pm.label}</strong>
                      <span>{pm.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* COD note */}
              {paymentMethod === 'cod' && (
                <div className="payment-note payment-note--cod">
                  <i className="fa fa-info-circle"></i>
                  <span>Cash on delivery available. Please keep exact change ready.</span>
                </div>
              )}

              {/* UPI / Card / NetBanking coming soon note */}
              {paymentMethod !== 'cod' && (
                <div className="payment-note payment-note--info">
                  <i className="fa fa-tools"></i>
                  <span>Online payment integration coming soon. For now please use Cash on Delivery.</span>
                </div>
              )}
            </div>

            {/* ── Section 3: Order Notes ── */}
            <div className="checkout-section">
              <div className="checkout-section__head">
                <div className="checkout-section__num">3</div>
                <h2>Order Notes <small>(optional)</small></h2>
              </div>
              <textarea
                className="checkout-notes"
                placeholder="Any special instructions for delivery, packaging, etc."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
              />
              <small className="checkout-notes-count">{notes.length}/300</small>
            </div>
          </div>

          {/* ══ RIGHT COLUMN: Order Summary ══ */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <h3 className="checkout-summary__title">Order Summary</h3>

              {/* Items */}
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="checkout-item">
                    <div className="checkout-item__img">
                      <img
                        src={getProductImage(item)}
                        alt={item.product.name}
                        onError={(e) => { e.target.src = '/default-product.png'; }}
                      />
                      <span className="checkout-item__qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-item__info">
                      <p>{item.product.name}</p>
                      <small>₹{item.product.pricing.price.toFixed(2)}/{item.product.unit}</small>
                    </div>
                    <div className="checkout-item__total">
                      ₹{(item.product.pricing.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="checkout-pricing">
                <div className="checkout-pricing__line">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="checkout-pricing__line">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'free-tag' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="checkout-pricing__line">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Selected address preview */}
              {selectedAddress && (
                <div className="checkout-addr-preview">
                  <div className="checkout-addr-preview__head">
                    <i className="fa fa-map-marker-alt"></i>
                    <span>Delivering to</span>
                  </div>
                  <p className="checkout-addr-preview__name">{selectedAddress.fullName}</p>
                  <p className="checkout-addr-preview__text">
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}
                  </p>
                </div>
              )}

              {placeError && (
                <div className="checkout-error">
                  <i className="fa fa-exclamation-circle"></i> {placeError}
                </div>
              )}

              <button
                className="checkout-place-btn"
                onClick={handlePlaceOrder}
                disabled={placing || addresses.length === 0 || !selectedAddress}
              >
                {placing ? (
                  <><i className="fa fa-spinner fa-spin"></i> Placing Order…</>
                ) : (
                  <><i className="fa fa-check-circle"></i> Place Order · ₹{total.toFixed(2)}</>
                )}
              </button>

              <div className="checkout-trust">
                <i className="fa fa-shield-alt"></i>
                <span>100% secure & encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;