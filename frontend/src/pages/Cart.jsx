import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/css/cart.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getProductImage = (product) => {
  if (product?.images?.length > 0) {
    const img = product.images[0];
    return img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`;
  }
  return '/default-product.png';
};

// ── Login Gate ──────────────────────────────────────────────
const LoginGate = () => (
  <div className="cart-login-gate">
    <div className="cart-login-gate__inner">
      <div className="cart-login-gate__icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#f0f7e8"/>
          <path d="M54 56H26c-1.1 0-2-.9-2-2v-1c0-5.5 4.5-10 10-10h12c5.5 0 10 4.5 10 10v1c0 1.1-.9 2-2 2z" fill="#4a8c2a" opacity=".3"/>
          <circle cx="40" cy="30" r="9" fill="#4a8c2a" opacity=".6"/>
          <path d="M34 42l4 14 4-14" fill="#4a8c2a" opacity=".2"/>
        </svg>
      </div>
      <h2>Sign in to view your cart</h2>
      <p>Your cart items are saved to your account. Sign in to continue shopping or checkout.</p>
      <div className="cart-login-gate__actions">
        <Link to="/login" state={{ from: { pathname: '/cart' } }} className="cart-gate-btn cart-gate-btn--primary">
          <i className="fa fa-sign-in-alt"></i>
          Sign In
        </Link>
        <Link to="/register" className="cart-gate-btn cart-gate-btn--outline">
          Create Account
        </Link>
      </div>
      <Link to="/products" className="cart-gate-continue">
        <i className="fa fa-arrow-left"></i> Continue shopping
      </Link>
    </div>
  </div>
);

// ── Empty Cart ───────────────────────────────────────────────
const EmptyCart = () => (
  <div className="cart-empty">
    <div className="cart-empty__illustration">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#f0f7e8"/>
        <path d="M30 38h8l10 34h28l6-22H46" stroke="#cd5091" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="52" cy="78" r="4" fill="#cd5091" opacity=".5"/>
        <circle cx="72" cy="78" r="4" fill="#cd5091" opacity=".5"/>
        <path d="M55 52h10M60 47v10" stroke="#cd5091" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
    <h2>Your cart is empty</h2>
    <p>Looks like you haven't added anything yet. Browse our fresh produce!</p>
    <Link to="/products" className="cart-shop-btn">
      <i className="fa fa-leaf"></i> Shop Now
    </Link>
  </div>
);

// ── Quantity Control ─────────────────────────────────────────
const QtyControl = ({ quantity, onDecrease, onIncrease, disabled }) => (
  <div className="cart-qty">
    <button className="cart-qty__btn" onClick={onDecrease} disabled={disabled || quantity <= 1}>
      <i className="fa fa-minus"></i>
    </button>
    <span className="cart-qty__num">{quantity}</span>
    <button className="cart-qty__btn" onClick={onIncrease} disabled={disabled}>
      <i className="fa fa-plus"></i>
    </button>
  </div>
);

// ── Main Cart Page ───────────────────────────────────────────
const CartPage = () => {
  const { isLoggedIn } = useAuth();
  const { cartItems, cartCount, cartSubtotal, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState(null);

  const SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = cartSubtotal >= SHIPPING_THRESHOLD ? 0 : 49;
  const TAX_RATE = 0.05;
  const tax = parseFloat((cartSubtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((cartSubtotal + SHIPPING_COST + tax).toFixed(2));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQtyChange = async (productId, newQty) => {
    setUpdatingId(productId);
    const res = await updateQuantity(productId, newQty);
    if (!res.success) showToast(res.message || 'Update failed', 'error');
    setUpdatingId(null);
  };

  const handleRemove = async (productId, name) => {
    setRemovingId(productId);
    const res = await removeItem(productId);
    if (res.success) showToast(`${name} removed from cart`);
    else showToast('Failed to remove item', 'error');
    setRemovingId(null);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    setClearing(true);
    await clearCart();
    showToast('Cart cleared');
    setClearing(false);
  };

  // ── Not logged in ──
  if (!isLoggedIn) return (
    <div className="cart-page">
      <div className="cart-page__header">
        <div className="container">
          <h1><i className="fa fa-shopping-bag"></i> Shopping Cart</h1>
        </div>
      </div>
      <LoginGate />
    </div>
  );

  return (
    <div className="cart-page">
      {/* Toast */}
      {toast && (
        <div className={`cart-toast cart-toast--${toast.type}`}>
          <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="cart-page__header">
        <div className="container">
          <div className="cart-page__header-inner">
            <div>
              <h1><i className="fa fa-shopping-bag"></i> Shopping Cart</h1>
              <p>{cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your cart` : 'Your cart'}</p>
            </div>
            <Link to="/products" className="cart-continue-link">
              <i className="fa fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="container cart-body">
        {/* Loading */}
        {loading && (
          <div className="cart-loading">
            <div className="cart-loading__spinner"></div>
            <p>Loading your cart…</p>
          </div>
        )}

        {!loading && cartItems.length === 0 && <EmptyCart />}

        {!loading && cartItems.length > 0 && (
          <div className="cart-layout">
            {/* ── Left: Items ── */}
            <div className="cart-items-col">
              <div className="cart-items-header">
                <span>Product</span>
                <span></span>
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
                <span></span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const product = item.product;
                  const lineTotal = (product.pricing.price * item.quantity).toFixed(2);
                  const isUpdating = updatingId === product._id;
                  const isRemoving = removingId === product._id;

                  return (
                    <div
                      key={product._id}
                      className={`cart-item ${isRemoving ? 'cart-item--removing' : ''}`}
                    >
                      {/* Image */}
                      <div className="cart-item__img-wrap">
                        <img
                          src={getProductImage(product)}
                          alt={product.images?.[0]?.alt || product.name}
                          onError={(e) => { e.target.src = '/default-product.png'; }}
                        />
                      </div>

                      {/* Name & meta */}
                      <div className="cart-item__info">
                        <Link to={`/products/${product.slug}`} className="cart-item__name">
                          {product.name}
                        </Link>
                        <span className="cart-item__unit">per {product.unit}</span>
                        {!product.stock?.inStock && (
                          <span className="cart-item__oos">Out of stock</span>
                        )}
                      </div>

                      {/* Unit price */}
                      <div className="cart-item__price">
                        <span className="cart-price-main">₹{product.pricing.price.toFixed(2)}</span>
                        {product.pricing.oldPrice && (
                          <span className="cart-price-old">₹{product.pricing.oldPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Qty */}
                      <div className="cart-item__qty">
                        <QtyControl
                          quantity={item.quantity}
                          disabled={isUpdating}
                          onDecrease={() => handleQtyChange(product._id, item.quantity - 1)}
                          onIncrease={() => handleQtyChange(product._id, item.quantity + 1)}
                        />
                        {isUpdating && <span className="cart-updating"><i className="fa fa-spinner fa-spin"></i></span>}
                      </div>

                      {/* Line total */}
                      <div className="cart-item__total">₹{lineTotal}</div>

                      {/* Remove */}
                      <button
                        className="cart-item__remove"
                        onClick={() => handleRemove(product._id, product.name)}
                        disabled={isRemoving}
                        title="Remove"
                      >
                        {isRemoving
                          ? <i className="fa fa-spinner fa-spin"></i>
                          : <i className="fa fa-trash-alt"></i>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Clear cart */}
              <div className="cart-items-footer">
                <button className="cart-clear-btn" onClick={handleClear} disabled={clearing}>
                  {clearing
                    ? <><i className="fa fa-spinner fa-spin"></i> Clearing…</>
                    : <><i className="fa fa-times-circle"></i> Clear Cart</>
                  }
                </button>
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className="cart-summary-col">
              <div className="cart-summary">
                <h3 className="cart-summary__title">Order Summary</h3>

                {/* Free shipping progress */}
                {SHIPPING_COST > 0 && (
                  <div className="cart-shipping-progress">
                    <div className="cart-shipping-progress__text">
                      <i className="fa fa-truck"></i>
                      Add <strong>₹{(SHIPPING_THRESHOLD - cartSubtotal).toFixed(2)}</strong> more for free shipping!
                    </div>
                    <div className="cart-shipping-progress__bar">
                      <div
                        className="cart-shipping-progress__fill"
                        style={{ width: `${Math.min((cartSubtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {SHIPPING_COST === 0 && (
                  <div className="cart-shipping-free">
                    <i className="fa fa-check-circle"></i> You've unlocked <strong>free shipping!</strong>
                  </div>
                )}

                {/* Line items */}
                <div className="cart-summary__lines">
                  <div className="cart-summary__line">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary__line">
                    <span>Shipping</span>
                    <span className={SHIPPING_COST === 0 ? 'cart-free-tag' : ''}>
                      {SHIPPING_COST === 0 ? 'FREE' : `₹${SHIPPING_COST}`}
                    </span>
                  </div>
                  <div className="cart-summary__line">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-summary__total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={() => navigate('/checkout')}
                >
                  <i className="fa fa-lock"></i>
                  Proceed to Checkout
                </button>

                {/* Trust badges */}
                <div className="cart-trust">
                  <div className="cart-trust-item">
                    <i className="fa fa-shield-alt"></i>
                    <span>Secure checkout</span>
                  </div>
                  <div className="cart-trust-item">
                    <i className="fa fa-undo"></i>
                    <span>Easy returns</span>
                  </div>
                  <div className="cart-trust-item">
                    <i className="fa fa-leaf"></i>
                    <span>100% organic</span>
                  </div>
                </div>

                {/* Accepted payments */}
                <div className="cart-payments">
                  <span>We accept</span>
                  <div className="cart-payments__icons">
                    <span className="cart-pay-badge">UPI</span>
                    <span className="cart-pay-badge">Card</span>
                    <span className="cart-pay-badge">NetBanking</span>
                    <span className="cart-pay-badge">COD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;