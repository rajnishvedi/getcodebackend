import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {sidebarOpen && <span>Tm Onions Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-${sidebarOpen ? 'angle-left' : 'angle-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin/dashboard"
            className={`nav-item-a ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-home"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/admin/users"
            className={`nav-item-a ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <i className="fas fa-users"></i>
            {sidebarOpen && <span>Users</span>}
          </Link>

          <Link
            to="/admin/products"
            className={`nav-item-a ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <i className="fas fa-box"></i>
            {sidebarOpen && <span>Products</span>}
          </Link>

          <Link
            to="/admin/orders"
            className={`nav-item-a ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            <i className="fas fa-shopping-cart"></i>
            {sidebarOpen && <span>Orders</span>}
          </Link>

          {/* <Link
            to="/admin/categories"
            className={`nav-item-a ${isActive('/admin/categories') ? 'active' : ''}`}
          >
            <i className="fas fa-tags"></i>
            {sidebarOpen && <span>Categories</span>}
          </Link>

          <Link
            to="/admin/analytics"
            className={`nav-item-a ${isActive('/admin/analytics') ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line"></i>
            {sidebarOpen && <span>Analytics</span>}
          </Link>

          <Link
            to="/admin/settings"
            className={`nav-item-a ${isActive('/admin/settings') ? 'active' : ''}`}
          >
            <i className="fas fa-cog"></i>
            {sidebarOpen && <span>Settings</span>}
          </Link> */}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item-a logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb-a">
              <i className="fas fa-home"></i>
              <span>{location.pathname.split('/').filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="header-right">
            <button className="header-icon-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>

            <div className="admin-profile">
              <button
                className="profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="profile-avatar">
                  {adminData.profile ? (
                    <img src={adminData.profile} alt={adminData.firstName} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">
                    {adminData.firstName} {adminData.lastName}
                  </span>
                  <span className="profile-role">{adminData.role || 'Admin'}</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link to="/admin/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    My Profile
                  </Link>
                  <Link to="/admin/settings" className="dropdown-item">
                    <i className="fas fa-cog"></i>
                    Settings
                  </Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;