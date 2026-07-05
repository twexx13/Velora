const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get wishlist
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name images price discountPrice rating stock');
  res.status(200).json({ success: true, wishlist: user.wishlist });
}));

// Toggle wishlist (add/remove)
router.post('/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const index = user.wishlist.indexOf(productId);
  let message;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    user.wishlist.push(productId);
    message = 'Added to wishlist';
  }
  await user.save();
  res.status(200).json({ success: true, message, wishlist: user.wishlist });
}));

// Clear wishlist
router.delete('/', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { wishlist: [] });
  res.status(200).json({ success: true, message: 'Wishlist cleared' });
}));

module.exports = router;