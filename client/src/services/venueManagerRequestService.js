/**
 * venueManagerRequestService.js — VM Request API calls
 */

import api from "./api";

export const venueManagerRequestService = {
  submit: (data) => api.post("/venue-manager-requests", data),
  getMy: () => api.get("/venue-manager-requests/my"),
};
