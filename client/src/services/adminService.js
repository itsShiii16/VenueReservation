/**
 * adminService.js — Admin API calls
 */

import api from "./api";

export const adminService = {
  getVMRequests: (status) =>
    api.get("/admin/venue-manager-requests", { params: status ? { status } : {} }),
  approveVMRequest: (id, data) =>
    api.patch(`/admin/venue-manager-requests/${id}/approve`, data),
  rejectVMRequest: (id, data) =>
    api.patch(`/admin/venue-manager-requests/${id}/reject`, data),
};
