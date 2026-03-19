const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  unit: { type: String },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    notes: { type: String, default: '' },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `TMO-${String(count + 1001).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);