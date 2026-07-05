const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get cart
router.get('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name images price discountPrice stock');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.status(200).json({ success: true, cart });
}));

// Add to cart
router.post('/', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIndex = cart.items.findIndex(
    item => item.product.toString() === productId &&
    item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      size,
      color,
      price: product.discountPrice || product.price
    });
  }
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock');
  res.status(200).json({ success: true, message: 'Added to cart', cart });
}));

// Update cart item
router.put('/:itemId', protect, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  res.status(200).json({ success: true, cart });
}));

// Remove item
router.delete('/:itemId', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.status(200).json({ success: true, message: 'Item removed', cart });
}));

// Clear cart
router.delete('/', protect, asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], discount: 0 }
  );
  res.status(200).json({ success: true, message: 'Cart cleared' });
}));

module.exports = router;