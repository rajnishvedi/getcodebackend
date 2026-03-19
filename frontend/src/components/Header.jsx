import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const Header = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const getProfileSrc = () => {
    if (!user?.profile) return null;
    return user.profile.startsWith('http')
      ? user.profile
      : `${BASE_URL}/uploads/profiles/${user.profile}`;
  };

  const profileSrc = getProfileSrc();

  return (
    <>
      {/* Top Bar */}
      <div className="container-fluid fixed-top px-0 wow fadeIn" data-wow-delay="0.1s">
        <div className="top-bar row gx-0 align-items-center d-none d-lg-flex">
          <div className="col-lg-6 px-5 text-start">
            <small><i className="fa fa-map-marker-alt me-2"></i>Room. P1/4, Bypass road, Eec market</small>
            <small className="ms-4"><i className="fa fa-envelope me-2"></i>info@tmonion.com</small>
          </div>
          <div className="col-lg-6 px-5 text-end">
            <small>Follow us:</small>
            <a className="text-body ms-3" href="/"><i className="fab fa-facebook-f"></i></a>
            <a className="text-body ms-3" href="/"><i className="fab fa-twitter"></i></a>
            <a className="text-body ms-3" href="/"><i className="fab fa-linkedin-in"></i></a>
            <a className="text-body ms-3" href="/"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="navbar navbar-expand-lg navbar-light py-lg-0 px-lg-5 wow fadeIn" data-wow-delay="0.1s">
          <Link to="/" className="navbar-brand ms-4 ms-lg-0">
            <h1 className="fw-bold text-primary m-0">Tm<span className="text-secondary"> Onions</span></h1>
          </Link>

          <button
            type="button"
            className="navbar-toggler me-4"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto p-4 p-lg-0">
              <Link to="/" className="nav-item nav-link active">Home</Link>
              <Link to="/about" className="nav-item nav-link">About Us</Link>
              <Link to="/products" className="nav-item nav-link">Products</Link>
              <Link to="/contact" className="nav-item nav-link">Contact Us</Link>
            </div>

            {/* ==================== AUTH ICONS ==================== */}
            <div className="d-none d-lg-flex align-items-center ms-2" style={{ gap: '8px' }}>

              {/* Search — always visible */}
              <a className="btn-sm-square bg-white rounded-circle" href="/products" title="Search">
                <small className="fa fa-search text-body"></small>
              </a>

              {isLoggedIn ? (
                <>
                  {/* Cart — only when logged in */}
                  <Link
                    to="/cart"
                    className="btn-sm-square bg-white rounded-circle position-relative"
                    title="My Cart"
                  >
                    <small className="fa fa-shopping-bag text-body"></small>
                  </Link>

                  {/* Wishlist — only when logged in */}
                  <Link
                    to="/wishlist"
                    className="btn-sm-square bg-white rounded-circle"
                    title="Wishlist"
                  >
                    <small className="fa fa-heart text-body"></small>
                  </Link>

                  {/* Profile dropdown */}
                  <div className="position-relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      title={user?.fullName || user?.firstName}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border: '2px solid #cd5091',
                        background: '#fff',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {profileSrc ? (
                        <img
                          src={profileSrc}
                          alt={user?.firstName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#cd5091',
                          textTransform: 'uppercase',
                          lineHeight: 1,
                        }}>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      )}
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.13)',
                        minWidth: '200px',
                        zIndex: 9999,
                        overflow: 'hidden',
                        border: '1px solid #eee',
                      }}>
                        {/* User info header */}
                        <div style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid #f0f0f0',
                          background: '#f9fdf5',
                        }}>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a2a10' }}>
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9aaa8a', marginTop: '2px' }}>
                            {user?.email}
                          </div>
                        </div>

                        {/* Menu items */}
                        {[
                          { to: '/profile', icon: 'fa-user', label: 'My Profile' },
                          { to: '/my-orders', icon: 'fa-box', label: 'My Orders' },
                          { to: '/wishlist', icon: 'fa-heart', label: 'Wishlist' },
                          { to: '/cart', icon: 'fa-shopping-bag', label: 'My Cart' },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '11px 16px',
                              fontSize: '14px',
                              color: '#2d3a20',
                              textDecoration: 'none',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7e8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <i className={`fa ${item.icon}`} style={{ color: '#cd5091', width: '16px', textAlign: 'center' }}></i>
                            {item.label}
                          </Link>
                        ))}

                        {/* Divider + Logout */}
                        <div style={{ borderTop: '1px solid #f0f0f0' }}>
                          <button
                            onClick={handleLogout}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '11px 16px',
                              fontSize: '14px',
                              color: '#e53e3e',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <i className="fa fa-sign-out-alt" style={{ width: '16px', textAlign: 'center' }}></i>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Not logged in — show login icon only */
                <Link
                  to="/login"
                  className="btn-sm-square bg-white rounded-circle"
                  title="Sign In"
                >
                  <small className="fa fa-user text-body"></small>
                </Link>
              )}
            </div>

            {/* Mobile auth links */}
            <div className="d-lg-none px-4 pb-3 border-top mt-2">
              {isLoggedIn ? (
                <div style={{ paddingTop: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1a2a10' }}>
                    Hi, {user?.firstName}!
                  </div>
                  <Link to="/profile" className="nav-item nav-link">My Profile</Link>
                  <Link to="/orders" className="nav-item nav-link">My Orders</Link>
                  <Link to="/cart" className="nav-item nav-link">Cart</Link>
                  <Link to="/wishlist" className="nav-item nav-link">Wishlist</Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      padding: '0.5rem 0',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    <i className="fa fa-sign-out-alt me-2"></i>Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ paddingTop: '12px', display: 'flex', gap: '10px' }}>
                  <Link
                    to="/login"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      border: '1.5px solid #cd5091',
                      borderRadius: '8px',
                      color: '#cd5091',
                      fontWeight: '600',
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      background: '#cd5091',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;