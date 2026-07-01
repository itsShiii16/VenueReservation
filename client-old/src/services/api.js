/**
 * api.js - Small fetch wrapper for the VRS backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("vrs_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("vrs_token");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed.");
    error.response = { status: response.status, data: payload };
    throw error;
  }

  return payload;
}

const api = {
  get: (path) => request(path),
  post: (path, data) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (path, data) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (path, data) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};

export default api;
