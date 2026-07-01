/**
 * blockedSlotService.js - Backend-backed blocked slot API calls.
 */

import api from "./api";

export const blockedSlotService = {
  getByVenue: async (venueId) => api.get(`/blocked-slots/${venueId}`),

  create: async (data) => api.post("/blocked-slots", data),

  delete: async (id) => api.delete(`/blocked-slots/${id}`),
};
