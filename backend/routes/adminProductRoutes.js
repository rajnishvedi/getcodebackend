const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  toggleActive,
  toggleInStock,
  getStats,
} = require("../controllers/adminProductController");

const { protect } = require("../middleware/adminAuth"); // adjust to your auth middleware

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/products"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // max 4 images, 5MB each
});

// ==================== ROUTES ====================

// Stats (must be before /:id to avoid conflict)
router.get("/stats", protect, getStats);

// CRUD
router.get("/", protect, getAllProducts);
router.get("/:id", protect, getProductById);
router.post("/", protect, upload.array("images", 4), createProduct);
router.put("/:id", protect, upload.array("images", 4), updateProduct);
router.delete("/:id", protect, deleteProduct);

// Image management
router.delete("/:id/images/:filename", protect, deleteProductImage);

// Toggle actions
router.put("/:id/toggle-active", protect, toggleActive);
router.put("/:id/toggle-instock", protect, toggleInStock);

module.exports = router;