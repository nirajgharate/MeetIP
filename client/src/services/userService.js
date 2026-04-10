import api from '../api/api.js';

/**
 * Fetch all registered users
 */
export const getUsers = async () => {
  try {
    // Note: Ensure your backend route is actually '/user/all' or '/users'
    const response = await api.get('/user/all'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data?.message || 'Failed to fetch users';
  }
};

/**
 * Fetch the authenticated user's profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile data';
  }
};

/**
 * Update the authenticated user's profile information
 */
export const updateProfile = async (userData) => {
  try {
    const config = {};
    if (!(userData instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
      };
    } else {
      // Ensure browser-managed FormData boundary works correctly
      config.headers = {
        'Content-Type': undefined,
      };
    }
    const response = await api.put('/user/profile', userData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

/**
 * Update only the user's avatar
 */
export const updateAvatar = async (avatarUrl) => {
  try {
    const response = await api.put('/user/profile', { avatar: avatarUrl });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Avatar update failed';
  }
};

/**
 * Block a user
 */
export const blockUser = async (userId) => {
  try {
    const response = await api.post(`/user/block/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to block user';
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (userId) => {
  try {
    const response = await api.post(`/user/unblock/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to unblock user';
  }
};

// Logic for chat is usually kept in chatService.js, 
// but if you keep it here, export it individually too:
export const startChat = async (targetUserId) => {
  try {
    const response = await api.post('/chats', { targetUserId });
    return response.data;
  } catch (error) {
    console.error("Error starting chat:", error);
    throw error;
  }
};