/**
 * venueManagerRequestService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const venueManagerRequestService = {
  submit: async (data) => {
    return {
      success: true,
      data: db.submitVMRequest(data),
    };
  },

  getMy: async () => {
    const user = db.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const requests = db.getVMRequests().filter((r) => r.clientId === user.id);
    return {
      success: true,
      data: requests,
    };
  },
};
