const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { Clan } = require('../models');

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

// Helper function to process image
async function processImage(buffer) {
  return sharp(buffer)
    .resize(400, 400, { // Resize to 400x400
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ // Convert to JPEG
      quality: 80, // 80% quality
      chromaSubsampling: '4:4:4'
    })
    .toBuffer();
}

// Helper function to save image
async function saveImage(buffer, filename) {
  const uploadDir = 'public/uploads/avatars';
  
  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/avatars/${filename}`;
}

// Upload avatar
router.post('/clans/:clanId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const clan = await Clan.findByPk(req.params.clanId);
    if (!clan) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process and compress the image
    const processedImageBuffer = await processImage(req.file.buffer);
    
    // Generate unique filename
    const filename = `${clan.id}-${Date.now()}.jpg`;
    
    // Save the processed image
    const avatarUrl = await saveImage(processedImageBuffer, filename);

    // Delete old avatar if exists
    if (clan.avatarUrl) {
      const oldAvatarPath = path.join('public', clan.avatarUrl);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    // Update clan record
    await clan.update({ avatarUrl });

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get clan avatar
router.get('/clans/:clanId/avatar', async (req, res) => {
  try {
    const clan = await Clan.findByPk(req.params.clanId);
    if (!clan) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ avatarUrl: clan.avatarUrl });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

module.exports = router;