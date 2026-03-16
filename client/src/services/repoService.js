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

/**
 * Fetches the file tree of a GitHub repository.
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {Promise<{ tree: Array, truncated: boolean, totalFiles: number }>}
 */
export const fetchRepoTree = async (repoUrl) => {
  const response = await axios.post(`${API_URL}/tree`, { repoUrl });
  return response.data;
};

/**
 * Detects the tech stack of a GitHub repository.
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {Promise<Object>} Detected tech stack
 */
export const fetchTechStack = async (repoUrl) => {
  const response = await axios.post(`${API_URL}/tech-stack`, { repoUrl });
  return response.data;
};

/**
 * Generates an AI-powered codebase explanation.
 * Accepts optional pre-fetched data to avoid redundant GitHub API calls.
 * @param {string} repoUrl - Full GitHub repository URL
 * @param {Object} [repoData] - Pre-fetched repository metadata
 * @param {Object} [techStackData] - Pre-fetched tech stack data
 * @returns {Promise<Object>} AI explanation with overview, architecture, components, setup
 */
export const fetchAIExplanation = async (repoUrl, repoData = null, techStackData = null) => {
  const response = await axios.post(`${API_URL}/ai-analysis`, {
    repoUrl,
    repoData,
    techStackData,
  });
  return response.data;
};

/**
 * Generates an architecture diagram from repo data.
 * @param {{ repoName: string, techStack: Object, folders: string[] }} data
 * @returns {Promise<{ diagram: string }>}
 */
export const fetchArchitectureDiagram = async (data) => {
  const response = await axios.post(`${API_URL}/architecture`, data);
  return response.data;
};

/**
 * Sends a chat question about a repository.
 * @param {string} question
 * @param {Object} repoContext
 * @returns {Promise<{ answer: string, _mock?: boolean }>}
 */
export const sendChatMessage = async (question, repoContext) => {
  const response = await axios.post('/api/chat/repo', { question, repoContext });
  return response.data;
};
