import PublicStatus from '../models/PublicStatus.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

const uploadStatusMedia = async (file, type) => {
  if (!file) return null;

  const uploadOptions = {
    folder: 'meetip-status',
    quality: 'auto',
  };

  if (type === 'video' || file.mimetype.startsWith('video/')) {
    uploadOptions.resource_type = 'video';
    uploadOptions.format = 'mp4';
  } else {
    uploadOptions.width = 600;
    uploadOptions.height = 800;
    uploadOptions.crop = 'fill';
    uploadOptions.format = 'jpg';
  }

  const result = await cloudinary.uploader.upload(file.path, uploadOptions);
  const fs = await import('fs');
  fs.unlinkSync(file.path);
  return result.secure_url;
};

/**
 * Create a new public status
 * @route   POST /api/status/public
 * @access  Private
 */
export const createPublicStatus = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const userId = req.user._id;

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    let statusContent = content || '';
    let statusType = type;

    if (req.file) {
      statusContent = await uploadStatusMedia(req.file, type);
      statusType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const newStatus = new PublicStatus({
      userId,
      content: statusContent,
      type: statusType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await newStatus.save();
    await newStatus.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Public status created',
      status: newStatus,
    });
  } catch (error) {
    console.error('Create public status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Get all public statuses (for feed)
 * @route   GET /api/status/public
 * @access  Private
 */
export const getPublicStatuses = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    // Get all public statuses that haven't expired
    const statuses = await PublicStatus.find({
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
    console.error('Get public statuses error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Get current user's public status
 * @route   GET /api/status/public/me
 * @access  Private
 */
export const getMyPublicStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    const status = await PublicStatus.findOne({
      userId,
      expiresAt: { $gt: currentTime },
    })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ message: status ? 'Status found' : 'No active status', status: status || null });
  } catch (error) {
    console.error('Get my public status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Like/Unlike a public status
 * @route   POST /api/status/public/:statusId/like
 * @access  Private
 */
export const toggleLikePublicStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PublicStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
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
 * Mark status as viewed
 * @route   POST /api/status/public/:statusId/view
 * @access  Private
 */
export const markPublicStatusAsViewed = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PublicStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
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
 * Update a public status
 * @route   PUT /api/status/public/:statusId
 * @access  Private
 */
export const updatePublicStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.user._id;

    const status = await PublicStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    if (status.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to edit this status' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Content or media is required to update the status' });
    }

    if (req.file) {
      status.content = await uploadStatusMedia(req.file, type);
      status.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else {
      status.content = content;
      status.type = type;
    }

    status.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await status.save();
    await status.populate('userId', 'username avatar');

    res.json({ message: 'Public status updated', status });
  } catch (error) {
    console.error('Update public status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Delete public status
 * @route   DELETE /api/status/public/:statusId
 * @access  Private
 */
export const deletePublicStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await PublicStatus.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    if (status.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this status' });
    }

    await PublicStatus.findByIdAndDelete(statusId);

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
