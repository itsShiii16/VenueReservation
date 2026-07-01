import { getMockDb } from './mock-data';

export function checkScheduleConflict(
  venueId: string,
  startTimeStr: string | Date,
  endTimeStr: string | Date,
  excludeReservationId?: string
): { conflict: boolean; reason?: string } {
  const newStart = new Date(startTimeStr);
  const newEnd = new Date(endTimeStr);

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return { conflict: true, reason: 'Invalid dates provided.' };
  }

  if (newStart >= newEnd) {
    return { conflict: true, reason: 'Start time must be before end time.' };
  }

  const db = getMockDb();

  // 1. Check Blocked Slots
  const conflictingBlock = db.blockedSlots.find((block) => {
    if (block.venueId !== venueId) return false;
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);
    return newStart < blockEnd && newEnd > blockStart;
  });

  if (conflictingBlock) {
    return {
      conflict: true,
      reason: `The time slot conflicts with a blocked schedule: "${conflictingBlock.reason || 'Maintenance'}"`,
    };
  }

  // 2. Check Reservations
  const conflictingReservation = db.reservations.find((res) => {
    if (res.venueId !== venueId) return false;
    if (excludeReservationId && res.id === excludeReservationId) return false;

    // Check status
    const blockingStatuses = [
      'BOOKED_CONFIRMED',
      'PENCIL_BOOKED_DRAFT',
      'PAYMENT_PENDING',
      'PAYMENT_OVERDUE',
      'BLOCKED',
    ];
    if (!blockingStatuses.includes(res.status)) return false;

    const resStart = new Date(res.startTime);
    const resEnd = new Date(res.endTime);
    return newStart < resEnd && newEnd > resStart;
  });

  if (conflictingReservation) {
    return {
      conflict: true,
      reason: `The time slot conflicts with an existing reservation: "${conflictingReservation.eventTitle}" (${resLabel(conflictingReservation.status)})`,
    };
  }

  return { conflict: false };
}

function resLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase();
}
