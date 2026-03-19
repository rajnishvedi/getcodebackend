const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ==================== PLACE ORDER ====================
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method are required' });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name pricing images unit stock isActive',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate all items still in stock
    for (const item of cart.items) {
      const p = item.product;
      if (!p || !p.isActive) {
        return res.status(400).json({ success: false, message: `A product in your cart is no longer available` });
      }
      if (!p.stock.inStock || p.stock.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${p.name}` });
      }
    }

    const SHIPPING_THRESHOLD = 500;
    const subtotal = cart.items.reduce((sum, i) => sum + i.product.pricing.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 49;
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    // Build order items snapshot (prices locked at purchase time)
    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.images?.[0]?.url || '',
      price: i.product.pricing.price,
      unit: i.product.unit,
      quantity: i.quantity,
    }));

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      notes: notes || '',
      pricing: { subtotal, shipping, tax, total },
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { 'stock.quantity': -item.quantity },
        $set: { 'stock.inStock': item.product.stock.quantity - item.quantity > 0 },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order, message: 'Order placed successfully' });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// ==================== MY ORDERS ====================
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query — optionally filter by status
    const query = { user: req.user._id };
    const VALID_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET ORDER BY ID ====================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CANCEL ORDER ====================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'stock.quantity': item.quantity },
        $set: { 'stock.inStock': true },
      });
    }

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ADMIN: GET ALL ORDERS ====================
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search?.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ADMIN: UPDATE ORDER STATUS ====================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ success: true, order, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ADMIN: ORDER STATS ====================
exports.getOrderStats = async (req, res) => {
  try {
    const [total, placed, processing, delivered, cancelled, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed' }),
      Order.countDocuments({ status: { $in: ['confirmed', 'processing', 'shipped'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    ]);

    res.json({
      success: true,
      stats: { total, placed, processing, delivered, cancelled, revenue: revenue[0]?.total || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};