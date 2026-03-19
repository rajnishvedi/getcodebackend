import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel — visual */}
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <img src="/about.png" alt="Fresh produce" className="auth-bg-img" />
        <div className="auth-visual-content">
          <div className="auth-logo-big">
            <span className="logo-tm">Tm</span>
            <span className="logo-onions"> Onions</span>
          </div>
          <h2 className="auth-tagline">Farm Fresh.<br />Always Fresh.</h2>
          <p className="auth-sub">The finest organic fruits &amp; vegetables, delivered from our farm to your door.</p>
          <div className="auth-badges">
            <span className="auth-badge"><i className="fa fa-leaf"></i> 100% Organic</span>
            <span className="auth-badge"><i className="fa fa-truck"></i> Fast Delivery</span>
            <span className="auth-badge"><i className="fa fa-star"></i> Premium Quality</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fa fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <i className="fa fa-envelope auth-input-icon"></i>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><i className="fa fa-spinner fa-spin"></i> Signing in…</>
              ) : (
                <><i className="fa fa-sign-in-alt"></i> Sign In</>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>New to Tm Onions?</span></div>

          <Link to="/register" className="auth-alt-btn">
            Create an account
          </Link>

          <p className="auth-back-home">
            <Link to="/"><i className="fa fa-arrow-left"></i> Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;