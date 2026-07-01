import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';
import { checkScheduleConflict } from '@/lib/conflict-checking';

export async function POST(req: Request) {
  const db = getMockDb();
  const userId = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, reservationId, blockData } = body;

    // Block slot action
    if (action === 'block') {
      const { venueId, startTime, endTime, reason } = blockData;
      
      // Conflict Check
      const conflictResult = checkScheduleConflict(venueId, startTime, endTime);
      if (conflictResult.conflict) {
        return NextResponse.json({ error: conflictResult.reason }, { status: 409 });
      }

      let newBlock;
      try {
        newBlock = await prisma.blockedSlot.create({
          data: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reason,
            venueId,
            createdById: userId,
          },
        });
      } catch (e) {
        newBlock = {
          id: `block-${Date.now()}`,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          reason,
          venueId,
          createdById: userId,
          createdAt: new Date(),
        };
        db.blockedSlots.push(newBlock);
        db.auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'BLOCK_SCHEDULE',
          entityType: 'BlockedSlot',
          entityId: newBlock.id,
          description: `Blocked venue schedule: "${reason || 'Maintenance'}"`,
          userId,
          createdAt: new Date(),
        });
        db.save();
      }

      return NextResponse.json({ success: true, block: newBlock });
    }

    // Reservation actions
    const reservation = db.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (action === 'accept_pencil') {
      // 1. Enforce business rule: Accept only ONE preliminary request for pencil booking.
      // Confirm there are no conflicts
      const conflictResult = checkScheduleConflict(reservation.venueId, reservation.startTime, reservation.endTime, reservation.id);
      if (conflictResult.conflict) {
        return NextResponse.json({ error: conflictResult.reason }, { status: 409 });
      }

      // 2. Reject/Close competing preliminary requests
      const resStart = new Date(reservation.startTime);
      const resEnd = new Date(reservation.endTime);

      db.reservations.forEach((other) => {
        if (
          other.id !== reservation.id &&
          other.venueId === reservation.venueId &&
          other.status === 'PRELIMINARY_SUBMITTED'
        ) {
          const otherStart = new Date(other.startTime);
          const otherEnd = new Date(other.endTime);
          
          // Overlap check
          if (otherStart < resEnd && otherEnd > resStart) {
            other.status = 'REJECTED';
            other.declineReason = 'Another reservation was pencil-booked for this slot.';
            other.updatedAt = new Date();
            
            db.auditLogs.push({
              id: `log-${Date.now()}-${Math.random().toString().substr(2,3)}`,
              action: 'AUTO_REJECT_COMPETING',
              entityType: 'Reservation',
              entityId: other.id,
              description: `Auto-rejected competing request reference ${other.referenceNumber}`,
              userId,
              createdAt: new Date(),
            });
          }
        }
      });

      // 3. Move status to PENCIL_BOOKED_DRAFT & start completion period
      const venue = db.venues.find((v) => v.id === reservation.venueId);
      const pencilBookingDays = venue?.pencilBookingDays ?? 3;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + pencilBookingDays);

      reservation.status = 'PENCIL_BOOKED_DRAFT';
      reservation.pencilBookingDeadline = deadline;
      reservation.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'ACCEPT_PRELIMINARY_PENCIL',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Accepted preliminary request for pencil booking. Deadline: ${deadline.toLocaleDateString()}`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    if (action === 'reject') {
      const { reason } = body;
      reservation.status = 'REJECTED';
      reservation.declineReason = reason;
      reservation.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'REJECT_RESERVATION',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Rejected reservation request. Reason: "${reason}"`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    if (action === 'return_completion') {
      const { remarks } = body;
      reservation.status = 'RETURNED_FOR_COMPLETION';
      reservation.returnRemarks = remarks;
      reservation.updatedAt = new Date();

      // Reset all uploaded/needs revision requirements to returned
      db.requirements.forEach((req) => {
        if (req.reservationId === reservationId && req.status === 'Uploaded') {
          req.status = 'Needs Revision';
          req.remarks = remarks;
        }
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'RETURN_FOR_COMPLETION',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Returned reservation request for document completion. Remarks: "${remarks}"`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    if (action === 'move_payment_pending') {
      const venue = db.venues.find((v) => v.id === reservation.venueId);
      const paymentDeadlineDays = venue?.paymentDeadlineDays ?? 5;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + paymentDeadlineDays);

      reservation.status = 'PAYMENT_PENDING';
      reservation.paymentDeadline = deadline;
      reservation.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'MOVE_TO_PAYMENT_PENDING',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Moved reservation to Payment Pending. Payment Deadline: ${deadline.toLocaleDateString()}`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    if (action === 'mark_payment_overdue') {
      reservation.status = 'PAYMENT_OVERDUE';
      reservation.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'MARK_PAYMENT_OVERDUE',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Marked reservation payment as Overdue`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    if (action === 'mark_booked') {
      const { remarks } = body;
      reservation.status = 'BOOKED_CONFIRMED';
      reservation.paymentRemarks = remarks;
      reservation.updatedAt = new Date();

      // Automatically approve all checklist documents
      db.requirements.forEach((req) => {
        if (req.reservationId === reservationId) {
          req.status = 'Approved';
        }
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'CONFIRM_BOOKING',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Confirmed reservation and marked as Booked. Payment Details: "${remarks || 'Settled'}"`,
        userId,
        createdAt: new Date(),
      });

      db.save();
      return NextResponse.json({ success: true, reservation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
