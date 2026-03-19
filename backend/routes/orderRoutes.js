const express = require('express');
const router = express.Router();
const { userProtect } = require('../middleware/userAuth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');

// ==================== USER ROUTES ====================
router.post('/', userProtect, createOrder);
router.get('/my-orders', userProtect, getMyOrders);   // MUST be before /:id
router.get('/:id', userProtect, getOrderById);
router.put('/:id/cancel', userProtect, cancelOrder);

module.exports = router;

// Register in server.js as:  app.use('/api/orders', require('./routes/orderRoutes'))
// Admin order routes live in adminOrderRoutes.js at /api/admin/orders