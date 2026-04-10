import express from 'express';
import multer from 'multer';
import path from 'path';

import { getProfile, updateProfile, getUserById, getUsers, blockUser, unblockUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All routes here are private and require a valid JWT
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

// PUT /api/user/:id - Update user profile
router.put('/:id', authMiddleware, upload.single('avatar'), updateProfile);

// GET /api/user/all
router.get('/all', authMiddleware, getUsers);

// ✅ NEW: Block/Unblock routes
router.post('/block/:id', authMiddleware, blockUser);
router.post('/unblock/:id', authMiddleware, unblockUser);

// ✅ Step 15.2: Fetch specific user by ID
// This must stay at the bottom so it doesn't override static routes like /profile
router.get('/:id', authMiddleware, getUserById);

export default router;