import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in headers
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Check if user still exists in DB
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next(); // Use return to stop execution here
    } catch (error) {
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 5. Final fallback if no token was found at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};