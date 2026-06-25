/**
 * conflictService.js — Schedule Conflict Service
 *
 * Thin wrapper around the checkScheduleConflict utility.
 * Provides a service-layer interface for controllers.
 */

const { checkScheduleConflict } = require("../utils/checkScheduleConflict");

/**
 * Check if a venue has scheduling conflicts for a given time range.
 * Throws a descriptive error if a conflict is found.
 *
 * @param {string} venueId - The venue to check
 * @param {Date|string} startTime - Proposed start time
 * @param {Date|string} endTime - Proposed end time
 * @param {string} [excludeReservationId] - Reservation to exclude (for updates)
 * @throws {Error} If a conflict is detected
 */
const ensureNoConflict = async (venueId, startTime, endTime, excludeReservationId = null) => {
  const result = await checkScheduleConflict(
    venueId,
    new Date(startTime),
    new Date(endTime),
    excludeReservationId
  );

  if (result.hasConflict) {
    const error = new Error("This schedule is unavailable.");
    error.statusCode = 409;
    error.conflictDetails = result;
    throw error;
  }
};

module.exports = { ensureNoConflict };
