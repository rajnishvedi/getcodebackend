const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  deleteUser,
  getUserStats,
  verifyUser,
} = require('../controllers/adminUserController');
const { protect, authorize } = require('../middleware/adminAuth');

// All routes require authentication
router.use(protect);

// Get user statistics
router.get('/stats', getUserStats);

// Get all users
router.get('/', authorize('users.view'), getAllUsers);

// Get single user
router.get('/:id', authorize('users.view'), getUserById);

// Toggle user status
router.put('/:id/toggle-status', authorize('users.edit'), toggleUserStatus);

// Verify user
router.put('/:id/verify', authorize('users.edit'), verifyUser);

// Update user
router.put('/:id', authorize('users.edit'), updateUser);

// Delete user
router.delete('/:id', authorize('users.delete'), deleteUser);

module.exports = router;