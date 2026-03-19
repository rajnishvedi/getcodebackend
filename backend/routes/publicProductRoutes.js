const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getByCategory,
  searchProducts,
  getProductsByTag,
} = require("../controllers/publicProductController");

// Search (must be before /:id to avoid conflict)
router.get("/search", searchProducts);

// Tag-based listing (new, popular, organic, etc.)
router.get("/tag/:tag", getProductsByTag);

// Category listing
router.get("/category/:category", getByCategory);

// Slug lookup (must be before /:id)
router.get("/slug/:slug", getProductBySlug);

// All products
router.get("/", getAllProducts);

// Single product by ID
router.get("/:id", getProductById);

module.exports = router;