/**
 * generateReferenceNumber.js — Reservation Reference Number Generator
 *
 * Generates a unique, human-readable reference number in the format:
 *   RES-YYYYMMDD-XXXX
 *
 * Example: RES-20260625-A3F7
 */

const generateReferenceNumber = () => {
  const now = new Date();

  // Format date as YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePart = `${year}${month}${day}`;

  // Generate 4-character random alphanumeric suffix
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `RES-${datePart}-${suffix}`;
};

module.exports = { generateReferenceNumber };
