import PrivateStatus from '../models/PrivateStatus.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Create a new private status
 * @route   POST /api/status/private
 * @access  Private
 */
export const createPrivateStatus = async (req, res) => {
  try {
    let { content, type, visibleTo } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Parse visibleTo if it's a JSON string
    if (typeof visibleTo === 'string') {
      try {
        visibleTo = JSON.parse(visibleTo);
      } catch (e) {
        visibleTo = [];
      }
    }

    let statusContent = content;

    // If it's an image, upload to Cloudinary
    if (type === 'image' && req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'meetip-status',
        width: 600,
        height: 800,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg',
      });

      // Delete temporary file
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);

      statusContent = result.secure_url;
    } else if (type === 'image' && content.startsWith('data:image')) {
      // Handle base64 image upload
      const result = await cloudinary.uploader.upload(content, {
        folder: 'meetip-status',
        width: 600,
        height: 800,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg',
      });
      statusContent = result.secure_url;
    }

    // If no visibleTo specified, make it visible to all contacts
    let visibility = visibleTo || [];
    if (!visibility || visibility.length === 0) {
      const user = await User.findById(userId);
      visibility = user.connections || [];
    }

    const newStatus = new PrivateStatus({
      userId,
      content: statusContent,
      type,
      visibleTo: visibility,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await newStatus.save();
    await newStatus.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Private status created',
      status: newStatus,
    });
  } catch (error) {
    console.error('Create private status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Get all private statuses visible to current user(for feed)
 * @route   GET /api/status/private
 * @access  Private
 */
export const getPrivateStatuses = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    // Get private statuses where current user is in visibleTo list
    const statuses = await PrivateStatus.find({
      visibleTo: userId,
      expiresAt: { $gt: currentTime },
    })
      .populate('userId', 'username avatar email')
      .populate('likedBy', 'username')
      .populate('viewedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    // Format response with current user's interaction info
    const formattedStatuses = statuses.map((status) => ({
      _id: status._id,
      userId: status.userId._id,
      username: status.userId.username,
      avatar: status.userId.avatar,
      content: status.content,
      type: status.type,
      likes: status.likes,
      isLikedByMe: status.likedBy.some((u) => u._id.toString() === userId),
      isViewedByMe: status.viewedBy.some((u) => u._id.toString() === userId),
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
    }));

    res.json(formattedStatuses);
  } catch (error) {
    console.error('Get private statuses error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Get current user's private status
 * @route   GET /api/status/private/me
 * @access  Private
 */
export const getMyPrivateStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    const status = await PrivateStatus.findOne({
      userId,
      expiresAt: { $gt: currentTime },
    })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ message: status ? 'Status found' : 'No active status', status: status || null });
  } catch (error) {
    console.error('Get my private status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Like/Unlike a private status
 * @route   POST /api/status/private/:statusId/like
 * @access  Private
 */
export const toggleLikePrivateStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PrivateStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Check if user has access to this status
    if (!status.visibleTo.includes(userId)) {
      return res.status(403).json({ message: 'You do not have access to this status' });
    }

    const isAlreadyLiked = status.likedBy.includes(userId);

    if (isAlreadyLiked) {
      status.likedBy = status.likedBy.filter((id) => id.toString() !== userId);
      status.likes = Math.max(0, status.likes - 1);
    } else {
      status.likedBy.push(userId);
      status.likes += 1;
    }

    await status.save();
    await status.populate('userId', 'username avatar');

    res.json(status);
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Mark private status as viewed
 * @route   POST /api/status/private/:statusId/view
 * @access  Private
 */
export const markPrivateStatusAsViewed = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PrivateStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Check if user has access to this status
    if (!status.visibleTo.includes(userId)) {
      return res.status(403).json({ message: 'You do not have access to this status' });
    }

    if (!status.viewedBy.includes(userId)) {
      status.viewedBy.push(userId);
      await status.save();
    }

    res.json({ message: 'Status marked as viewed' });
  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Delete private status
 * @route   DELETE /api/status/private/:statusId
 * @access  Private
 */
export const deletePrivateStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PrivateStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    if (status.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this status' });
    }

    await PrivateStatus.findByIdAndDelete(statusId);

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
