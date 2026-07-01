/**
 * roleHelpers.js — Role-based helper functions
 */

export const ROLES = {
  CLIENT: "CLIENT",
  VENUE_MANAGER: "VENUE_MANAGER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
};

export const isClient = (user) => user?.role === ROLES.CLIENT;
export const isVenueManager = (user) => user?.role === ROLES.VENUE_MANAGER;
export const isAdmin = (user) => user?.role === ROLES.SYSTEM_ADMIN;

/**
 * Get a human-readable role label
 */
export function getRoleLabel(role) {
  const labels = {
    CLIENT: "Client",
    VENUE_MANAGER: "Venue Manager",
    SYSTEM_ADMIN: "System Admin",
  };
  return labels[role] || role;
}

/**
 * Get the default redirect path for a user's role
 */
export function getDefaultPath(role) {
  switch (role) {
    case ROLES.VENUE_MANAGER:
      return "/vm/dashboard";
    case ROLES.SYSTEM_ADMIN:
      return "/admin/dashboard";
    default:
      return "/";
  }
}
