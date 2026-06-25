/**
 * adminService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const adminService = {
  getVMRequests: async (status) => {
    let requests = db.getVMRequests();
    if (status && status !== "ALL") {
      requests = requests.filter((r) => r.status === status);
    }
    // Include full client user information
    const fullRequests = requests.map((r) => {
      const client = db.getUsers().find((u) => u.id === r.clientId);
      return { ...r, client };
    });
    return {
      success: true,
      data: fullRequests,
    };
  },

  approveVMRequest: async (id, data) => {
    db.approveVMRequest(id, data?.remarks || "");
    return {
      success: true,
    };
  },

  rejectVMRequest: async (id, data) => {
    db.rejectVMRequest(id, data?.remarks || "");
    return {
      success: true,
    };
  },
};
