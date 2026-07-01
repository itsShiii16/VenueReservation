/**
 * reservationController.js — Reservation Controller
 *
 * Handles reservation CRUD and status management:
 * - Clients can create reservations and cancel their own
 * - Venue Managers can view, approve, and decline reservations for their venues
 * - Conflict checking is enforced on creation
 */

const prisma = require("../config/db");
const { ensureNoConflict } = require("../services/conflictService");
const { generateReferenceNumber } = require("../utils/generateReferenceNumber");
const { logAudit } = require("../services/auditService");

/**
 * POST /api/reservations
 * Create a new reservation (CLIENT only)
 * Checks for schedule conflicts before creating.
 */
const createReservation = async (req, res, next) => {
  try {
    const { venueId, eventTitle, expectedAttendees, startTime, endTime, notes, slots } =
      req.body;

    // Verify venue exists and is active
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: "Venue not found or is inactive.",
      });
    }

    // Resolve slots array
    let bookingSlots = [];
    if (slots && Array.isArray(slots) && slots.length > 0) {
      bookingSlots = slots.map((s) => ({
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
      }));
    } else {
      bookingSlots = [{
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }];
    }

    // Check conflicts for each slot
    for (const slot of bookingSlots) {
      await ensureNoConflict(venueId, slot.startTime, slot.endTime);
    }

    // Generate a unique reference number
    const referenceNumber = generateReferenceNumber();

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        referenceNumber,
        eventTitle,
        activityType: "See submitted requirements",
        expectedAttendees: parseInt(expectedAttendees),
        startTime: bookingSlots[0].startTime,
        endTime: bookingSlots[0].endTime,
        notes,
        status: venue.allowsPencilBooking ? "PRELIMINARY_SUBMITTED" : "UNDER_REVIEW",
        clientId: req.user.id,
        venueId,
        slots: bookingSlots,
      },
      include: {
        venue: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      userId: req.user.id,
      action: "CREATE_RESERVATION",
      entityType: "Reservation",
      entityId: reservation.id,
      description: `Created reservation ${referenceNumber} for ${venue.name}`,
    });

    res.status(201).json({
      success: true,
      message: "Reservation submitted successfully.",
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reservations/my
 * Get all reservations for the current client
 */
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { clientId: req.user.id },
      include: {
        venue: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reservations/:id
 * Get a single reservation by ID
 */
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        venue: { select: { id: true, name: true, location: true } },
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    // Clients can only view their own reservations
    // Venue Managers can view reservations for their venues
    if (
      req.user.role === "CLIENT" &&
      reservation.clientId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own reservations.",
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reservations/:id/cancel
 * Cancel a reservation (CLIENT only, must be the owner)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (reservation.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own reservations.",
      });
    }

    if (!["PRELIMINARY_SUBMITTED", "PENCIL_BOOKED_DRAFT", "UNDER_REVIEW", "RETURNED_FOR_COMPLETION", "PAYMENT_PENDING", "PAYMENT_OVERDUE"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a reservation with status: ${reservation.status}`,
      });
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });

    await logAudit({
      userId: req.user.id,
      action: "CANCEL_RESERVATION",
      entityType: "Reservation",
      entityId: updated.id,
      description: `Cancelled reservation ${updated.referenceNumber}`,
    });

    res.json({
      success: true,
      message: "Reservation cancelled.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reservations/venue-manager
 * Get reservations for venues managed by the current venue manager
 */
const getVenueManagerReservations = async (req, res, next) => {
  try {
    // Find venues managed by this user
    const managedVenueIds = await prisma.venue.findMany({
      where: { createdById: req.user.id, isActive: true },
      select: { id: true },
    });

    const venueIds = managedVenueIds.map((v) => v.id);

    const reservations = await prisma.reservation.findMany({
      where: { venueId: { in: venueIds } },
      include: {
        venue: { select: { id: true, name: true } },
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reservations/:id/approve
 * Mark a reservation as booked / confirmed (VENUE_MANAGER only)
 */
const approveReservation = async (req, res, next) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { venue: true },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    // Verify the manager owns this venue
    if (reservation.venue.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only manage reservations for your own venues.",
      });
    }

    if (!["PAYMENT_PENDING", "PAYMENT_OVERDUE"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a reservation with status: ${reservation.status}`,
      });
    }

    // Re-check for conflicts before approving
    await ensureNoConflict(
      reservation.venueId,
      reservation.startTime,
      reservation.endTime,
      reservation.id
    );

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: "BOOKED_CONFIRMED" },
    });

    await logAudit({
      userId: req.user.id,
      action: "APPROVE_RESERVATION",
      entityType: "Reservation",
      entityId: updated.id,
      description: `Marked reservation ${updated.referenceNumber} as booked / confirmed`,
    });

    res.json({
      success: true,
      message: "Reservation approved.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reservations/:id/decline
 * Decline a reservation with a reason (VENUE_MANAGER only)
 */
const declineReservation = async (req, res, next) => {
  try {
    const { declineReason } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { venue: true },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (reservation.venue.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only manage reservations for your own venues.",
      });
    }

    if (!["PRELIMINARY_SUBMITTED", "UNDER_REVIEW", "RETURNED_FOR_COMPLETION"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot decline a reservation with status: ${reservation.status}`,
      });
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: "REJECTED", declineReason },
    });

    await logAudit({
      userId: req.user.id,
      action: "DECLINE_RESERVATION",
      entityType: "Reservation",
      entityId: updated.id,
      description: `Declined reservation ${updated.referenceNumber}: ${declineReason}`,
    });

    res.json({
      success: true,
      message: "Reservation declined.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getVenueManagerReservations,
  approveReservation,
  declineReservation,
};
