import express from 'express';
import {
  createChat,
  getUserChats,
  sendMessage,
  getMessages,
  markAsRead,
  createGroup,
  updateGroup,
  removeFromGroup
} from '../controllers/chatController.js';
import { markMessagesAsSeen } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js'; // ✅ IMPORTED MULTER MIDDLEWARE

const router = express.Router();

// Apply protection to all routes in this file
router.use(authMiddleware);

// --- Chat Discovery & History ---
router.post('/', createChat);           // Create or get existing chat
router.get('/', getUserChats);          // Get all chats for current user (Populates latest message)

// --- Group Management ---
router.post('/group', createGroup);     // Create a new group
router.put('/group/:chatId', updateGroup); // Update group details
router.delete('/group/:chatId/member/:userId', removeFromGroup); // Remove member from group

// --- Message Transmission ---
// ✅ UPDATED: Added upload.single('file') to handle media attachments
router.post('/message', upload.single('file'), sendMessage);
router.get('/message/:chatId', getMessages);     // Get history for a specific chat

// ✅ New Logic: Mark as Read
// This should be triggered by the frontend whenever 'selectedChat' changes
router.patch('/read/:chatId', markAsRead);

router.put('/message/seen/:chatId', authMiddleware, markMessagesAsSeen);

export default router;