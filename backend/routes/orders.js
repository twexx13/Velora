const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Create order
router.post('/', protect, asyncHandler(async (req, res) => {
  const { shippingAddress, paymentInfo } = req.body;
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0]?.url || '',
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    color: item.color
  }));
  const itemsPrice = cart.total;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  // Update stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity }
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], discount: 0 }
  );

  res.status(201).json({ success: true, message: 'Order placed', order });
}));

// Get my orders
router.get('/my-orders', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, orders });
}));

// Get single order
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.status(200).json({ success: true, order });
}));

// Cancel order
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!['processing', 'confirmed'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel this order');
  }
  order.orderStatus = 'cancelled';
  await order.save();
  res.status(200).json({ success: true, message: 'Order cancelled', order });
}));

// Get all orders (Admin)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt');
  res.status(200).json({ success: true, orders });
}));

// Update order status (Admin)
router.put('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.orderStatus = req.body.status;
  if (req.body.status === 'delivered') order.deliveredAt = Date.now();
  await order.save();
  res.status(200).json({ success: true, message: 'Order updated', order });
}));

module.exports = router;