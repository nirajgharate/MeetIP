import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getGroupById,
  updateGroup,
  removeGroupMember,
} from '../controllers/groupController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/:groupId', getGroupById);
router.put('/:groupId', updateGroup);
router.delete('/:groupId/member/:userId', removeGroupMember);

export default router;
