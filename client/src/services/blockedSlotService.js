/**
 * blockedSlotService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const blockedSlotService = {
  getByVenue: async (venueId) => {
    const slots = db.getBlockedSlots().filter((b) => b.venueId === venueId);
    return {
      success: true,
      data: slots,
    };
  },

  create: async (data) => {
    return {
      success: true,
      data: db.createBlockedSlot(data),
    };
  },

  delete: async (id) => {
    db.deleteBlockedSlot(id);
    return {
      success: true,
    };
  },
};
