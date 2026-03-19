const express = require('express');
const router = express.Router();
const { userProtect } = require('../middleware/userAuth');
const {
  getCart,
  getCartCount,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(userProtect);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove/:productId', removeItem);
router.delete('/clear', clearCart);

module.exports = router;