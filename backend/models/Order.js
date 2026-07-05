const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  paymentInfo: {
    method: { type: String, enum: ['razorpay', 'stripe', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paidAt: Date
  },
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  deliveredAt: Date,
  invoiceNumber: { type: String, unique: true, sparse: true }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'VLR-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);