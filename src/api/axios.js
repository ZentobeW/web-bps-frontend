// src/api/axios.js
import axios from 'axios';

// DEBUG: log env ke console (wajib deploy ulang agar terlihat di console)
console.log("🔥 VITE_API_URL =", import.meta.env.VITE_API_URL);

// === VERSI HARDCODE SEMENTARA ===
// Ganti ini hanya untuk test, nanti dikembalikan
const instance = axios.create({
  baseURL: 'https://web-bps-backend-production-68c8.up.railway.app/api', // <-- hardcoded sementara
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // bisa true atau false tergantung Laravel (Sanctum / token)
});

// Interceptor untuk Authorization (bearer token)
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
