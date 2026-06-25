/**
 * venueService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const venueService = {
  getAll: async () => {
    return {
      success: true,
      data: db.getVenues(),
    };
  },

  getById: async (id) => {
    return {
      success: true,
      data: db.getVenueById(id),
    };
  },

  create: async (data) => {
    return {
      success: true,
      data: db.createVenue(data),
    };
  },

  update: async (id, data) => {
    return {
      success: true,
      data: db.updateVenue(id, data),
    };
  },

  delete: async (id) => {
    db.deleteVenue(id);
    return {
      success: true,
    };
  },
};
