/**
 * authService.js - Backend-backed authentication calls.
 */

import api from "./api";

export const authService = {
  register: async (data) => api.post("/auth/register", data),

  login: async (data) => api.post("/auth/login", data),

  getMe: async () => api.get("/auth/me"),
};
