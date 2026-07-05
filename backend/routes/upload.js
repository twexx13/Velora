const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/', protect, authorize('admin'),
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'velora',
      transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    });
    res.status(200).json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url
    });
  })
);

// Delete image
router.delete('/:publicId', protect, authorize('admin'),
  asyncHandler(async (req, res) => {
    await cloudinary.uploader.destroy(
      decodeURIComponent(req.params.publicId)
    );
    res.status(200).json({ success: true, message: 'Image deleted' });
  })
);

module.exports = router;