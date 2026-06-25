/**
 * api.js — Axios instance configured for the VRS backend
 *
 * Automatically attaches JWT token from localStorage to all requests.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vrs_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (response) => response.data, // Unwrap axios response
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vrs_token");
      // Optionally redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
