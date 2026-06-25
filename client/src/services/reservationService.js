/**
 * reservationService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const reservationService = {
  getMy: async () => {
    const user = db.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const reservations = db.getReservations().filter((r) => r.clientId === user.id);
    // Include full venue info
    const fullReservations = reservations.map((r) => {
      const venue = db.getVenueById(r.venueId);
      return { ...r, venue };
    });
    return {
      success: true,
      data: fullReservations,
    };
  },

  create: async (data) => {
    return {
      success: true,
      data: db.createReservation(data),
    };
  },

  createAssisted: async (data) => {
    return {
      success: true,
      data: db.createAssistedBooking(data),
    };
  },

  getById: async (id) => {
    const res = db.getReservationById(id);
    if (!res) throw new Error("Reservation not found");
    return {
      success: true,
      data: res,
    };
  },

  cancel: async (id) => {
    db.cancelReservation(id);
    return {
      success: true,
    };
  },

  getVenueManagerReservations: async () => {
    const user = db.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    // Get venues managed by current user
    const managedVenues = db.getVenues().filter((v) => v.createdById === user.id);
    const managedIds = managedVenues.map((v) => v.id);
    
    const reservations = db.getReservations().filter((r) => managedIds.includes(r.venueId));
    const fullReservations = reservations.map((r) => {
      const venue = db.getVenueById(r.venueId);
      const client = db.getUsers().find((u) => u.id === r.clientId);
      return { ...r, venue, client };
    });

    return {
      success: true,
      data: fullReservations,
    };
  },

  approve: async (id) => {
    db.approveReservation(id);
    return {
      success: true,
    };
  },

  decline: async (id, data) => {
    db.declineReservation(id, data.declineReason);
    return {
      success: true,
    };
  },

  updateRequirement: async (reservationId, reqId, status, remarks, fileName = null) => {
    db.updateRequirementStatus(reservationId, reqId, status, remarks, fileName);
    return {
      success: true,
    };
  },

  updatePayment: async (reservationId, paymentStatus, remarks = "") => {
    db.setPaymentStatus(reservationId, paymentStatus, remarks);
    return {
      success: true,
    };
  },
};
