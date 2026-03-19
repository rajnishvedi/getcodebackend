const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/adminAuth');
const {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');

// ==================== ADMIN ORDER ROUTES ====================
// All mounted at /api/admin/orders  (matches api.js calls)

router.get('/stats', protect, getOrderStats);           // GET  /api/admin/orders/stats
router.get('/', protect, getAllOrders);                  // GET  /api/admin/orders
router.put('/:id/status', protect, updateOrderStatus);  // PUT  /api/admin/orders/:id/status

module.exports = router;

// Register in server.js as:  app.use('/api/admin/orders', require('./routes/adminOrderRoutes'))