// src/api/axios.js
import axios from 'axios';

console.log("🔥 VITE_API_URL =", import.meta.env.VITE_API_URL); // Boleh dipertahankan sementara untuk debugging

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // aktif kalau pakai Sanctum (cookie-based auth)
});

// Interceptor untuk Authorization header (token JWT)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
