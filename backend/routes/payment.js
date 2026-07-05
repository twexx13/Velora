const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');

// Get Razorpay key
router.get('/razorpay/key', protect, (req, res) => {
  res.status(200).json({ 
    success: true, 
    key: process.env.RAZORPAY_KEY_ID 
  });
});

// Create Razorpay order
router.post('/razorpay/create-order', protect, asyncHandler(async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}));

// Verify Razorpay payment
router.post('/razorpay/verify', protect, asyncHandler(async (req, res) => {
  const crypto = require('crypto');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  if (expected !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }
  res.status(200).json({ success: true, message: 'Payment verified' });
}));

// COD order
router.post('/cod', protect, asyncHandler(async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Cash on delivery order confirmed' 
  });
}));

module.exports = router;