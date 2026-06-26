/**
 * checkScheduleConflict.js — Schedule Conflict Checker
 *
 * Checks whether a proposed time range overlaps with any:
 *   1. Blocking reservations for the same venue
 *   2. Blocked slots for the same venue
 *
 * Overlap logic:
 *   newStart < existingEnd AND newEnd > existingStart
 *
 * Returns:
 *   { hasConflict: false } if no conflict
 *   { hasConflict: true, conflictType: "reservation"|"blocked_slot", details: {...} }
 */

const prisma = require("../config/db");

const BLOCKING_RESERVATION_STATUSES = [
  "PENCIL_BOOKED_DRAFT",
  "PAYMENT_PENDING",
  "BOOKED_CONFIRMED",
];

const checkScheduleConflict = async (venueId, startTime, endTime, excludeReservationId = null) => {
  // 1. Check blocking reservations for overlap.
  // Preliminary and under-review requests do not block the slot.
  const reservationFilter = {
    venueId,
    status: { in: BLOCKING_RESERVATION_STATUSES },
    // Overlap: newStart < existingEnd AND newEnd > existingStart
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };

  // Optionally exclude a specific reservation (useful when updating)
  if (excludeReservationId) {
    reservationFilter.id = { not: excludeReservationId };
  }

  const conflictingReservation = await prisma.reservation.findFirst({
    where: reservationFilter,
    select: {
      id: true,
      referenceNumber: true,
      eventTitle: true,
      startTime: true,
      endTime: true,
    },
  });

  if (conflictingReservation) {
    return {
      hasConflict: true,
      conflictType: "reservation",
      details: conflictingReservation,
    };
  }

  // 2. Check blocked slots for overlap
  const conflictingBlockedSlot = await prisma.blockedSlot.findFirst({
    where: {
      venueId,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: {
      id: true,
      reason: true,
      startTime: true,
      endTime: true,
    },
  });

  if (conflictingBlockedSlot) {
    return {
      hasConflict: true,
      conflictType: "blocked_slot",
      details: conflictingBlockedSlot,
    };
  }

  // No conflict found
  return { hasConflict: false };
};

module.exports = { checkScheduleConflict };
