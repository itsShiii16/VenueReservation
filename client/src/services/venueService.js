/**
 * venueService.js — Venue API calls
 */

import api from "./api";

export const venueService = {
  getAll: () => api.get("/venues"),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post("/venues", data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};
