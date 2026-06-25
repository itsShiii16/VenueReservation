/**
 * blockedSlotService.js — Blocked Slot API calls
 */

import api from "./api";

export const blockedSlotService = {
  getByVenue: (venueId) => api.get(`/blocked-slots/${venueId}`),
  create: (data) => api.post("/blocked-slots", data),
  delete: (id) => api.delete(`/blocked-slots/${id}`),
};
