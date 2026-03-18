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

/**
 * Download a PDF report for an analysis.
 * Triggers the browser file-download dialog.
 */
export const downloadReport = async (analysisId) => {
  const response = await axios.get(`/api/report/${analysisId}`, {
    headers: authHeaders(),
    responseType: 'blob',
  });

  // Create a temporary download link
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Extract filename from Content-Disposition header or use a default
  const disposition = response.headers['content-disposition'];
  const match = disposition && disposition.match(/filename="?([^"]+)"?/);
  link.download = match ? match[1] : `analysis-report.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get a shared analysis by shareId (public — no auth required).
 */
export const getSharedAnalysis = async (shareId) => {
  const response = await axios.get(`/api/share/${shareId}`);
  return response.data;
};
