/**
 * reservationService.js - Backend-backed reservation API calls.
 */

import api from "./api";

export const reservationService = {
  getMy: async () => api.get("/reservations/my"),

  create: async (data) => api.post("/reservations", data),

  getById: async (id) => api.get(`/reservations/${id}`),

  cancel: async (id) => api.patch(`/reservations/${id}/cancel`),

  getVenueManagerReservations: async () => api.get("/reservations/venue-manager"),

  approve: async (id) => api.patch(`/reservations/${id}/approve`),

  decline: async (id, data) => api.patch(`/reservations/${id}/decline`, data),

  createAssisted: async () => {
    throw new Error("Assisted booking API endpoint is not available yet.");
  },

  acceptPencilBooking: async () => {
    throw new Error("Pencil booking acceptance API endpoint is not available yet.");
  },

  updateRequirement: async () => {
    throw new Error("Requirement upload API endpoint is not available yet.");
  },

  updatePayment: async () => {
    throw new Error("Payment status API endpoint is not available yet.");
  },
};
