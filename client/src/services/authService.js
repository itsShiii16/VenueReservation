/**
 * authService.js — Replaces API calls with local DB operations
 */

import { db } from "./mockDb";

export const authService = {
  register: async (data) => {
    const user = db.register(data);
    return {
      success: true,
      data: { user, token: "mock-jwt-token" },
    };
  },
  
  login: async (data) => {
    const user = db.login(data.email, data.password);
    return {
      success: true,
      data: { user, token: "mock-jwt-token" },
    };
  },

  getMe: async () => {
    const user = db.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return {
      success: true,
      data: user,
    };
  },
};
