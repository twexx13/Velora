const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  price: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  total: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);