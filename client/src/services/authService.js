import axios from 'axios';

// Base URL for API requests — uses Vite proxy in dev, or direct URL in production
const API_URL = '/api/auth';

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<{ _id: string, name: string, email: string, token: string }>}
 */
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

/**
 * Login an existing user
 * @param {{ email: string, password: string }} userData
 * @returns {Promise<{ _id: string, name: string, email: string, token: string }>}
 */
export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

/**
 * Get the current logged-in user's profile
 * @param {string} token - JWT token
 * @returns {Promise<{ _id: string, name: string, email: string, createdAt: string }>}
 */
export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
