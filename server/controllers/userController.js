import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// ✅ NEW: Get user profile by ID (Step 15.2)
// @route   GET /api/users/:id
// @access  Private/Public (Depending on your middleware)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'username')
      .populate('blockedUsers', 'username');

    if (user) {
      // Get connection count and other stats
      const connectionCount = user.connections.length;
      const blockedCount = user.blockedUsers.length;
      
      // Count groups (chats with more than 2 participants)
      const Chat = (await import('../models/Chat.js')).default;
      const groupsCount = await Chat.countDocuments({
        members: user._id,
        isGroup: true
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        avatar: user.avatar,
        bio: user.bio || "",
        profession: user.profession || "",
        createdAt: user.createdAt,
        stats: {
          connections: connectionCount,
          groups: groupsCount,
          blocked: blockedCount
        },
        connections: user.connections,
        blockedUsers: user.blockedUsers
      });
    } else {
      res.status(404).json({ message: 'Terminal user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user profile (Current Logged In User)
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        avatar: user.avatar,
        bio: user.bio || "", 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile or PUT /api/users/:id
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    console.log('Update profile request for userId:', userId);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? 'File present' : 'No file');

    // Only allow users to update their own profile (or implement admin check later)
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const user = await User.findById(userId);

    if (user) {
      if (req.body.username) user.username = req.body.username;
      if (req.body.email) user.email = req.body.email;
      if (req.body.mobileNumber) user.mobileNumber = req.body.mobileNumber;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.profession !== undefined) user.profession = req.body.profession;

      // Handle avatar upload to Cloudinary
      if (req.file) {
        try {
          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'meetip-profiles',
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            format: 'jpg'
          });

          // Delete the temporary file
          const fs = await import('fs');
          fs.unlinkSync(req.file.path);

          // Update user avatar with Cloudinary URL
          user.avatar = result.secure_url;
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // Don't fail the update, just log the error
          // return res.status(500).json({ message: 'Failed to upload image' });
        }
      } else if (req.body.avatar && req.body.avatar.startsWith('data:image')) {
        // Handle base64 image upload (fallback)
        try {
          const result = await cloudinary.uploader.upload(req.body.avatar, {
            folder: 'meetip-profiles',
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            format: 'jpg'
          });
          user.avatar = result.secure_url;
        } catch (uploadError) {
          console.error('Cloudinary base64 upload error:', uploadError);
          // Don't fail the update
          // return res.status(500).json({ message: 'Failed to upload image' });
        }
      } else if (req.body.avatar === null || req.body.avatar === '') {
        // Remove avatar
        user.avatar = '';
      }

      const updatedUser = await user.save();

      console.log('User updated successfully:', updatedUser.username);

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        profession: updatedUser.profession,
        createdAt: updatedUser.createdAt,
        stats: {
          connections: updatedUser.connections.length,
          blocked: updatedUser.blockedUsers.length,
          groups: 0 // Will be calculated from Chat model
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("-password") 
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "SERVER_ERROR: Failed to fetch nodes" });
  }
};

// ✅ NEW: Block a user
// @route   POST /api/users/block/:id
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Add to blocked list and remove from connections
    user.blockedUsers.push(userId);
    user.connections = user.connections.filter(id => id.toString() !== userId);
    await user.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ✅ NEW: Unblock a user
// @route   POST /api/users/unblock/:id
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is blocked
    if (!user.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User not blocked' });
    }

    // Remove from blocked list
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};