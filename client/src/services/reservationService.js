/**
 * reservationService.js — Reservation API calls
 */

import api from "./api";

export const reservationService = {
  getMy: () => api.get("/reservations/my"),
  create: (data) => api.post("/reservations", data),
  getById: (id) => api.get(`/reservations/${id}`),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),

  // Venue Manager endpoints
  getVenueManagerReservations: () => api.get("/reservations/venue-manager"),
  approve: (id) => api.patch(`/reservations/${id}/approve`),
  decline: (id, data) => api.patch(`/reservations/${id}/decline`, data),
};
