import axios from 'axios';

const API_URL = '/api/repos';

/**
 * Sends a repository URL to the backend for analysis.
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {Promise<Object>} Repository metadata
 */
export const analyzeRepository = async (repoUrl) => {
  const response = await axios.post(`${API_URL}/analyze`, { repoUrl });
  return response.data;
};
