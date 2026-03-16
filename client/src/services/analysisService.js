import axios from 'axios';

const API_URL = '/api/analysis';

/**
 * Returns auth headers from localStorage token.
 */
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all analyses for the current user.
 */
export const getUserAnalyses = async () => {
  const response = await axios.get(API_URL, { headers: authHeaders() });
  return response.data;
};

/**
 * Get a single analysis by ID (full payload with metadata + AI explanation).
 */
export const getAnalysisById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
  return response.data;
};

/**
 * Save or update a repository analysis.
 */
export const saveAnalysis = async (data) => {
  const response = await axios.post(API_URL, data, { headers: authHeaders() });
  return response.data;
};

/**
 * Delete an analysis by ID.
 */
export const deleteAnalysis = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
  return response.data;
};
