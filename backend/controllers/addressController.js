const Address = require('../models/Address');

// ==================== GET ALL ADDRESSES ====================
exports.getAll = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET ONE ====================
exports.getOne = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CREATE ====================
exports.create = async (req, res) => {
  try {
    const { label, fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // If marking as default, unset all others first
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // If this is the first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      fullName,
      phone,
      line1,
      line2: line2 || '',
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ success: true, address, message: 'Address added successfully' });
  } catch (err) {
    console.error('create address error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// ==================== UPDATE ====================
exports.update = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const { label, fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, {
      label: label ?? address.label,
      fullName: fullName ?? address.fullName,
      phone: phone ?? address.phone,
      line1: line1 ?? address.line1,
      line2: line2 ?? address.line2,
      city: city ?? address.city,
      state: state ?? address.state,
      pincode: pincode ?? address.pincode,
      country: country ?? address.country,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault,
    });

    await address.save();
    res.json({ success: true, address, message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== DELETE ====================
exports.remove = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If the deleted address was default, set another one as default
    if (wasDefault) {
      const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== SET DEFAULT ====================
exports.setDefault = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ success: true, message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};