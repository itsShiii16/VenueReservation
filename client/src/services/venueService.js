/**
 * venueService.js - Backend-backed venue API calls.
 */

import api from "./api";

export const venueService = {
  getAll: async () => api.get("/venues"),

  getById: async (id) => api.get(`/venues/${id}`),

  getAvailability: async (id) => api.get(`/venues/${id}/availability`),

  create: async (data) => api.post("/venues", data),

  update: async (id, data) => api.put(`/venues/${id}`, data),

  delete: async (id) => api.delete(`/venues/${id}`),

  batchConfigureDates: async (id, data) => api.post(`/venues/${id}/date-configs/batch`, data),
};
