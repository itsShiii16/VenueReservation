/**
 * formatDate.js — Date formatting utilities
 */

/**
 * Format a date string to a readable format
 * e.g., "Jun 25, 2026 at 2:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format just the date portion
 * e.g., "Jun 25, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format just the time portion
 * e.g., "2:30 PM"
 */
export function formatTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
