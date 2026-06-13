import api from '../api/api.js';

const storeSession = (data) => {
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }

  return {
    token: data?.token,
    user: data?.user || {
      _id: data?._id,
      username: data?.username,
      email: data?.email,
      mobileNumber: data?.mobileNumber,
    },
  };
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/**
 * Register a new user
 * @param {Object} userData - Contains username, email, mobileNumber, password
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return storeSession(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed'));
  }
};

/**
 * Login an existing user
 * @param {Object} credentials - Contains email and password
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return storeSession(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed'));
  }
};

/**
 * Logout utility
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
