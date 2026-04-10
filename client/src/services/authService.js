import api from '../api/api.js';

/**
 * Register a new user
 * @param {Object} userData - Contains username, email, mobileNumber, password
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // If your backend returns a token, store it immediately
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    // Throw error so the component can catch it and show a toast/alert
    throw error.response?.data?.message || 'Registration failed';
  }
};

/**
 * Login an existing user
 * @param {Object} credentials - Contains email and password
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

/**
 * Logout utility
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
