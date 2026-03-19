const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteProfileImage,
} = require('../controllers/userController');

const { userProtect } = require('../middleware/userAuth');

// ==================== MULTER FOR PROFILE IMAGE ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files allowed'), false);
  },
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// ==================== PUBLIC ROUTES ====================
router.post('/register', register);
router.post('/login', login);

// ==================== PROTECTED ROUTES ====================
router.post('/logout', userProtect, logout);
router.get('/profile', userProtect, getProfile);
router.put('/profile', userProtect, upload.single('profile'), updateProfile);
router.put('/change-password', userProtect, changePassword);
router.delete('/profile-image', userProtect, deleteProfileImage);

module.exports = router;