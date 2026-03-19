const Product = require("../models/Product");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

// ==================== GET ALL PRODUCTS (ADMIN) ====================
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category = "all",
      status = "all",
      tag = "all",
    } = req.query;

    const query = {};

    // Search by name
    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category
    if (category !== "all") {
      query.category = category;
    }

    // Filter by active status
    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    // Filter by tag
    if (tag !== "all") {
      query.tags = tag;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET SINGLE PRODUCT (ADMIN) ====================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      oldPrice,
      currency,
      unit,
      stockQuantity,
      inStock,
      tags,
      isActive,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required",
      });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({ url: file.filename, alt: name });
      });
    }

    const product = new Product({
      name,
      slug,
      category,
      description,
      images,
      pricing: {
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        currency: currency || "INR",
      },
      unit: unit || "kg",
      stock: {
        quantity: parseInt(stockQuantity) || 0,
        inStock: inStock === "true" || inStock === true,
      },
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      isActive: isActive === "false" || isActive === false ? false : true,
    });

    await product.save();
    res.status(201).json({ success: true, product, message: "Product created successfully" });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      category,
      description,
      price,
      oldPrice,
      currency,
      unit,
      stockQuantity,
      inStock,
      tags,
      isActive,
      keepExistingImages,
    } = req.body;

    // Update slug if name changed
    if (name && name !== product.name) {
      let slug = slugify(name, { lower: true, strict: true });
      const existing = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      product.slug = slug;
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;

    product.pricing = {
      price: price ? parseFloat(price) : product.pricing.price,
      oldPrice: oldPrice ? parseFloat(oldPrice) : product.pricing.oldPrice,
      currency: currency || product.pricing.currency,
    };

    if (unit) product.unit = unit;

    product.stock = {
      quantity: stockQuantity !== undefined ? parseInt(stockQuantity) : product.stock.quantity,
      inStock: inStock !== undefined
        ? inStock === "true" || inStock === true
        : product.stock.inStock,
    };

    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : JSON.parse(tags || "[]");
    }

    if (isActive !== undefined) {
      product.isActive = isActive === "false" || isActive === false ? false : true;
    }

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.filename, alt: product.name }));
      if (keepExistingImages === "true") {
        product.images = [...product.images, ...newImages];
      } else {
        product.images = newImages;
      }
    }

    await product.save();
    res.json({ success: true, product, message: "Product updated successfully" });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete product images from disk
    product.images.forEach((img) => {
      const filePath = path.join(__dirname, "../public/uploads/products", img.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== DELETE SINGLE IMAGE ====================
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Remove from images array
    product.images = product.images.filter((img) => img.url !== filename);
    await product.save();

    // Delete file from disk
    const filePath = path.join(__dirname, "../public/uploads/products", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("deleteProductImage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== TOGGLE ACTIVE STATUS ====================
exports.toggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      isActive: product.isActive,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("toggleActive error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== TOGGLE IN-STOCK STATUS ====================
exports.toggleInStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock.inStock = !product.stock.inStock;
    await product.save();

    res.json({
      success: true,
      inStock: product.stock.inStock,
      message: `Product marked as ${product.stock.inStock ? "In Stock" : "Out of Stock"}`,
    });
  } catch (error) {
    console.error("toggleInStock error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET STATS ====================
exports.getStats = async (req, res) => {
  try {
    const [totalProducts, active, inactive, outOfStock, vegetables, fruits] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: false }),
        Product.countDocuments({ "stock.inStock": false }),
        Product.countDocuments({ category: "vegetable" }),
        Product.countDocuments({ category: "fruit" }),
      ]);

    res.json({
      success: true,
      stats: { totalProducts, active, inactive, outOfStock, vegetables, fruits },
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};