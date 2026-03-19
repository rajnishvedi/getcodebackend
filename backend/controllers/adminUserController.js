const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      verified = 'all',
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Verified filter
    if (verified !== 'all') {
      query.isVerified = verified === 'verified';
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -loginToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -loginToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, isActive, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Get new users last month for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
    });

    // Calculate growth percentage
    const growthPercentage = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(2)
      : 100;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth,
        growthPercentage: parseFloat(growthPercentage),
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      user: {
        _id: user._id,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};