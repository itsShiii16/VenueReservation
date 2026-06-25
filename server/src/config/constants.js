/**
 * constants.js — App-wide constants
 *
 * Centralizes role names, status values, and other magic strings
 * so they can be imported instead of hardcoded throughout the app.
 */

const ROLES = {
  CLIENT: "CLIENT",
  VENUE_MANAGER: "VENUE_MANAGER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
};

const RESERVATION_STATUS = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
};

const VM_REQUEST_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

module.exports = {
  ROLES,
  RESERVATION_STATUS,
  VM_REQUEST_STATUS,
};
