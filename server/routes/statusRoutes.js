import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createPublicStatus,
  getPublicStatuses,
  getMyPublicStatus,
  toggleLikePublicStatus,
  markPublicStatusAsViewed,
  updatePublicStatus,
  deletePublicStatus,
} from '../controllers/publicStatusController.js';
import {
  createPrivateStatus,
  getPrivateStatuses,
  getMyPrivateStatus,
  toggleLikePrivateStatus,
  markPrivateStatusAsViewed,
  deletePrivateStatus,
} from '../controllers/privateStatusController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
});

// All routes are private
router.use(authMiddleware);

// ========== PUBLIC STATUS ROUTES ==========
// Create public status
router.post('/public', upload.single('media'), createPublicStatus);
// Edit public status
router.put('/public/:statusId', upload.single('media'), updatePublicStatus);

// Get current user's public status (must come BEFORE /:statusId routes)
router.get('/public/me', getMyPublicStatus);

// Get all public statuses (feed)
router.get('/public', getPublicStatuses);

// Like/Unlike public status
router.post('/public/:statusId/like', toggleLikePublicStatus);

// Mark public status as viewed
router.post('/public/:statusId/view', markPublicStatusAsViewed);

// Delete public status
router.delete('/public/:statusId', deletePublicStatus);

// ========== PRIVATE STATUS ROUTES ==========
// Create private status
router.post('/private', upload.single('image'), createPrivateStatus);

// Get current user's private status (must come BEFORE /:statusId routes)
router.get('/private/me', getMyPrivateStatus);

// Get all private statuses visible to current user (feed)
router.get('/private', getPrivateStatuses);

// Like/Unlike private status
router.post('/private/:statusId/like', toggleLikePrivateStatus);

// Mark private status as viewed
router.post('/private/:statusId/view', markPrivateStatusAsViewed);

// Delete private status
router.delete('/private/:statusId', deletePrivateStatus);

export default router;
