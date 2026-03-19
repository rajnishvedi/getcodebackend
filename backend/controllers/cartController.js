const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug pricing images stock unit isActive',
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// ==================== GET CART ====================
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    // Filter out items where product is inactive or deleted
    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.pricing.price * item.quantity,
      0
    );

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validItems,
        itemCount: validItems.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET CART COUNT ====================
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart
      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ADD TO CART ====================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (!product.stock.inStock) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }
    if (product.stock.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock.quantity} units available`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (newQty > product.stock.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock.quantity} units available`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    // Re-populate for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug pricing images stock unit',
    });

    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    res.json({
      success: true,
      message: 'Added to cart',
      itemCount,
      cart: {
        items: cart.items,
        itemCount,
      },
    });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UPDATE QUANTITY ====================
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!productId || qty < 0) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (qty === 0) {
      // Remove item if quantity set to 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      const product = await Product.findById(productId);
      if (qty > product.stock.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock.quantity} units available`,
        });
      }
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, message: 'Cart updated', itemCount });
  } catch (error) {
    console.error('updateQuantity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== REMOVE ITEM ====================
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, message: 'Item removed', itemCount });
  } catch (error) {
    console.error('removeItem error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CLEAR CART ====================
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};