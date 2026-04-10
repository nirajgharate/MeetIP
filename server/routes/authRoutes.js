import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// ✅ ADD: Get current user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // ✅ authMiddleware already attaches req.user with full user data
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

export default router;