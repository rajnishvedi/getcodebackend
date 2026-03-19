import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { dashboardAPI, userAPI } = await import('../../services/api');

      const statsResponse = await dashboardAPI.getStats();
      const usersResponse = await userAPI.getAll({ page: 1, limit: 5 });

      const statsData = statsResponse.data.stats;
      console.log('Dashboard stats:', statsData); // Debug log to check stats data structure

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalProducts: statsData.totalProducts || 0,
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
      });

      setRecentUsers(usersResponse.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-users">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
              {/* <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> 12% from last month
              </span> */}
            </div>
          </div>

          <div className="stat-card stat-products">
            <div className="stat-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
              {/* <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> 5 new this month
              </span> */}
            </div>
          </div>

          {/* <div className="stat-card stat-orders">
            <div className="stat-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
              {/* <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> 8% from last month
              </span> 
            </div>
          </div>*/}

          {/* <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div className="stat-info">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> 15% from last month
              </span>
            </div>
          </div> */}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/products/new" className="action-card">
              <i className="fas fa-plus-circle"></i>
              <span>Add New Product</span>
            </Link>
            <Link to="/admin/users" className="action-card">
              <i className="fas fa-user-plus"></i>
              <span>View All Users</span>
            </Link>
            <Link to="/admin/orders" className="action-card">
              <i className="fas fa-list-alt"></i>
              <span>View Orders</span>
            </Link>
            {/* <Link to="/admin/settings" className="action-card">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link> */}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-content">
          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Users</h2>
              <Link to="/admin/users" className="view-all">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/users/${user._id}`} className="btn-view">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.customer}</td>
                      <td>₹{order.amount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;