import axios from "axios";

// Use VITE_API_URL from .env in production, fallback to /api for dev proxy
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export default API;