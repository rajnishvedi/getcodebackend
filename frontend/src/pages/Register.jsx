import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { level: score, label: labels[score] };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      {/* Left panel */}
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <img src="/carousel-1.png" alt="Fresh produce" className="auth-bg-img" />
        <div className="auth-visual-content">
          <div className="auth-logo-big">
            <span className="logo-tm">Tm</span>
            <span className="logo-onions"> Onions</span>
          </div>
          <h2 className="auth-tagline">Join Our<br />Farm Family.</h2>
          <p className="auth-sub">Get access to the freshest organic produce, exclusive deals, and doorstep delivery.</p>
          <div className="auth-perks">
            <div className="auth-perk">
              <div className="auth-perk-icon"><i className="fa fa-leaf"></i></div>
              <div>
                <strong>100% Organic</strong>
                <p>Chemical-free, naturally grown</p>
              </div>
            </div>
            <div className="auth-perk">
              <div className="auth-perk-icon"><i className="fa fa-percentage"></i></div>
              <div>
                <strong>Member Discounts</strong>
                <p>Exclusive offers for registered users</p>
              </div>
            </div>
            <div className="auth-perk">
              <div className="auth-perk-icon"><i className="fa fa-history"></i></div>
              <div>
                <strong>Order Tracking</strong>
                <p>Real-time delivery updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Start shopping fresh, organic produce today</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fa fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-row">
              <div className="auth-field">
                <label>First Name *</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user auth-input-icon"></i>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Last Name *</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user auth-input-icon"></i>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label>Email address *</label>
              <div className="auth-input-wrap">
                <i className="fa fa-envelope auth-input-icon"></i>
                <input
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
              <label>Phone <span className="auth-optional">(optional)</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-phone auth-input-icon"></i>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password *</label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-seg ${i <= strength.level ? `strength-${strength.level}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`auth-strength-label strength-text-${strength.level}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label>Confirm Password *</label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className="auth-field-error">Passwords don't match</span>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><i className="fa fa-spinner fa-spin"></i> Creating account…</>
              ) : (
                <><i className="fa fa-user-plus"></i> Create Account</>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>

          <Link to="/login" className="auth-alt-btn">
            Sign in instead
          </Link>

          <p className="auth-back-home">
            <Link to="/"><i className="fa fa-arrow-left"></i> Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;