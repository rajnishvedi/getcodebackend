const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/adminAuthController');
const { protect } = require('../middleware/adminAuth');

// Public routes
router.post('/login', login);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;