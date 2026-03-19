const Product = require("../models/Product");

// ==================== GET ALL PRODUCTS (PUBLIC) ====================
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      tag,
      search,
      sort = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    const query = { isActive: true };

    if (category && ["vegetable", "fruit"].includes(category)) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search?.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["pricing.price"] = {};
      if (minPrice) query["pricing.price"].$gte = parseFloat(minPrice);
      if (maxPrice) query["pricing.price"].$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {
      createdAt: { createdAt: order === "asc" ? 1 : -1 },
      price: { "pricing.price": order === "asc" ? 1 : -1 },
      name: { name: order === "asc" ? 1 : -1 },
    };
    const sortQuery = sortOptions[sort] || sortOptions.createdAt;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("getAllProducts (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCT BY ID ====================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-__v");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductById (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCT BY SLUG ====================
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select("-__v");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductBySlug (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCTS BY CATEGORY ====================
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    if (!["vegetable", "fruit"].includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const query = { isActive: true, category };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
      currentPage: parseInt(page),
      category,
    });
  } catch (error) {
    console.error("getByCategory (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SEARCH PRODUCTS ====================
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { tags: { $regex: q.trim(), $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("name slug category pricing images tags unit");

    res.json({ success: true, products, query: q });
  } catch (error) {
    console.error("searchProducts (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET FEATURED / NEW / POPULAR ====================
exports.getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 8 } = req.query;

    const validTags = ["new", "organic", "seasonal", "popular", "discount"];
    if (!validTags.includes(tag)) {
      return res.status(400).json({ success: false, message: "Invalid tag" });
    }

    const products = await Product.find({ isActive: true, tags: tag })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-__v");

    res.json({ success: true, products, tag });
  } catch (error) {
    console.error("getProductsByTag (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};