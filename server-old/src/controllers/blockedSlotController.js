/**
 * blockedSlotController.js — Blocked Slot Controller
 *
 * Handles blocked slot management for venue managers.
 * Blocked slots prevent reservations from being made during those times.
 */

const prisma = require("../config/db");
const { logAudit } = require("../services/auditService");

/**
 * GET /api/blocked-slots/:venueId
 * Get all blocked slots for a venue (public)
 */
const getByVenue = async (req, res, next) => {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: { venueId: req.params.venueId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    res.json({
      success: true,
      data: blockedSlots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blocked-slots
 * Create a blocked slot for a venue (VENUE_MANAGER only)
 */
const createBlockedSlot = async (req, res, next) => {
  try {
    const { venueId, startTime, endTime, reason } = req.body;

    // Verify the venue exists and belongs to this manager
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    if (venue.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only block slots for venues you manage.",
      });
    }

    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason,
        venueId,
        createdById: req.user.id,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: "CREATE_BLOCKED_SLOT",
      entityType: "BlockedSlot",
      entityId: blockedSlot.id,
      description: `Blocked slot for ${venue.name}: ${reason || "No reason provided"}`,
    });

    res.status(201).json({
      success: true,
      message: "Schedule blocked successfully.",
      data: blockedSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/blocked-slots/:id
 * Remove a blocked slot (VENUE_MANAGER only)
 */
const deleteBlockedSlot = async (req, res, next) => {
  try {
    const blockedSlot = await prisma.blockedSlot.findUnique({
      where: { id: req.params.id },
    });

    if (!blockedSlot) {
      return res.status(404).json({
        success: false,
        message: "Blocked slot not found.",
      });
    }

    if (blockedSlot.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only remove blocked slots you created.",
      });
    }

    await prisma.blockedSlot.delete({
      where: { id: req.params.id },
    });

    await logAudit({
      userId: req.user.id,
      action: "DELETE_BLOCKED_SLOT",
      entityType: "BlockedSlot",
      entityId: req.params.id,
      description: "Removed blocked slot",
    });

    res.json({
      success: true,
      message: "Blocked slot removed.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getByVenue, createBlockedSlot, deleteBlockedSlot };
