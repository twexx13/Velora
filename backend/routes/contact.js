const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

// Submit contact form
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const contact = await Contact.create({ 
    name, email, phone, subject, message 
  });
  res.status(201).json({ 
    success: true, 
    message: 'Message sent successfully! We will get back to you soon.' 
  });
}));

// Get all contacts (Admin)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort('-createdAt');
  res.status(200).json({ success: true, contacts });
}));

// Update contact status (Admin)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true }
  );
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.status(200).json({ success: true, contact });
}));

module.exports = router;