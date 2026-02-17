// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Attach token for all non-auth routes
    if (token && !config.url.includes('/api/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
