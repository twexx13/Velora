const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth',       require('./routes/auth'));
app.use('/api/v1/products',   require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/cart',       require('./routes/cart'));
app.use('/api/v1/wishlist',   require('./routes/wishlist'));
app.use('/api/v1/orders',     require('./routes/orders'));
app.use('/api/v1/payment',    require('./routes/payment'));
app.use('/api/v1/contact',    require('./routes/contact'));
app.use('/api/v1/upload',     require('./routes/upload'));
app.use('/api/v1/admin',      require('./routes/admin'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Velora API is running 🚀' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});