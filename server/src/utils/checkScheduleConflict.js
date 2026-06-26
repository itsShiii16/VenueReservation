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
  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  const overlap = (s1, e1, s2, e2) => {
    return new Date(s1) < new Date(e2) && new Date(e1) > new Date(s2);
  };

  // 1. Check blocking reservations for overlap.
  const reservations = await prisma.reservation.findMany({
    where: {
      venueId,
      status: { in: BLOCKING_RESERVATION_STATUSES },
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
    },
    select: {
      id: true,
      referenceNumber: true,
      eventTitle: true,
      startTime: true,
      endTime: true,
      slots: true,
    },
  });

  for (const res of reservations) {
    if (res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
      for (const slot of res.slots) {
        if (overlap(slot.startTime, slot.endTime, newStart, newEnd)) {
          return {
            hasConflict: true,
            conflictType: "reservation",
            details: res,
          };
        }
      }
    } else {
      if (overlap(res.startTime, res.endTime, newStart, newEnd)) {
        return {
          hasConflict: true,
          conflictType: "reservation",
          details: res,
        };
      }
    }
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
