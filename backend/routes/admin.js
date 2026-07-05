const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    newContacts,
    revenueData,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.find().sort('-createdAt').limit(5)
      .populate('user', 'name email'),
    Product.find({ stock: { $lte: 5 }, isActive: true })
      .select('name stock images').limit(10)
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      newContacts,
      totalRevenue: revenueData[0]?.total || 0
    },
    recentOrders,
    lowStockProducts
  });
}));

// Get all users (Admin)
router.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({ success: true, users });
}));

// Update user role (Admin)
router.put('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role, isActive: req.body.isActive },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, user });
}));

// Delete user (Admin)
router.delete('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
}));

module.exports = router;