import api from '../api/api.js';

/**
 * ========== PUBLIC STATUS SERVICES ==========
 */

/**
 * Create a new public status
 */
export const createPublicStatus = async (formData) => {
  try {
    const response = await api.post('/status/public', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create public status';
  }
};

export const updatePublicStatus = async (statusId, formData) => {
  try {
    const response = await api.put(`/status/public/${statusId}`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update public status';
  }
};

/**
 * Get all public statuses (feed)
 */
export const getPublicStatuses = async () => {
  try {
    const response = await api.get('/status/public');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch public statuses';
  }
};

/**
 * Get current user's public status
 */
export const getMyPublicStatus = async () => {
  try {
    const response = await api.get('/status/public/me');
    // Response is the status object directly, or { message, status: null }
    return { status: response.data?.status || response.data };
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch your public status';
  }
};


/**
 * Like/Unlike a public status
 */
export const toggleLikePublicStatus = async (statusId) => {
  try {
    const response = await api.post(`/status/public/${statusId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to toggle like';
  }
};

/**
 * Mark public status as viewed
 */
export const markPublicStatusAsViewed = async (statusId) => {
  try {
    const response = await api.post(`/status/public/${statusId}/view`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark as viewed';
  }
};

/**
 * Delete public status
 */
export const deletePublicStatus = async (statusId) => {
  try {
    const response = await api.delete(`/status/public/${statusId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete public status';
  }
};

/**
 * ========== PRIVATE STATUS SERVICES ==========
 */

/**
 * Create a new private status
 */
export const createPrivateStatus = async (content, type = 'text', imageFile = null, visibleTo = []) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('type', type);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (visibleTo.length > 0) {
      formData.append('visibleTo', JSON.stringify(visibleTo));
    }

    const response = await api.post('/status/private', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create private status';
  }
};

/**
 * Get all private statuses visible to current user (feed)
 */
export const getPrivateStatuses = async () => {
  try {
    const response = await api.get('/status/private');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch private statuses';
  }
};

/**
 * Get current user's private status
 */
export const getMyPrivateStatus = async () => {
  try {
    const response = await api.get('/status/private/me');
    // Response is the status object directly, or { message, status: null }
    return { status: response.data?.status || response.data };
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch your private status';
  }
};


/**
 * Like/Unlike a private status
 */
export const toggleLikePrivateStatus = async (statusId) => {
  try {
    const response = await api.post(`/status/private/${statusId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to toggle like';
  }
};

/**
 * Mark private status as viewed
 */
export const markPrivateStatusAsViewed = async (statusId) => {
  try {
    const response = await api.post(`/status/private/${statusId}/view`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark as viewed';
  }
};

/**
 * Delete private status
 */
export const deletePrivateStatus = async (statusId) => {
  try {
    const response = await api.delete(`/status/private/${statusId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete private status';
  }
};
