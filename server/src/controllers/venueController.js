/**
 * venueController.js — Venue Controller
 *
 * Handles venue CRUD operations.
 * - Anyone can view venues (GET)
 * - Only VENUE_MANAGER can create, update, delete venues
 */

const prisma = require("../config/db");
const { logAudit } = require("../services/auditService");

/**
 * GET /api/venues
 * Get all active venues (public — no auth required)
 */
const getAllVenues = async (req, res, next) => {
  try {
    const venues = await prisma.venue.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/venues/:id
 * Get a single venue by ID (public)
 */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        requirements: true,
        blockedSlots: {
          where: {
            endTime: { gte: new Date() }, // Only future blocked slots
          },
          orderBy: { startTime: "asc" },
        },
        reservations: {
          where: {
            status: "APPROVED",
            endTime: { gte: new Date() }, // Only future approved reservations
          },
          select: {
            id: true,
            eventTitle: true,
            activityType: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    res.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/venues
 * Create a new venue (VENUE_MANAGER only)
 */
const createVenue = async (req, res, next) => {
  try {
    const {
      name,
      location,
      capacity,
      description,
      managingUnit,
      amenities,
      equipment,
      rules,
      imageUrl,
    } = req.body;

    const venue = await prisma.venue.create({
      data: {
        name,
        location,
        capacity: parseInt(capacity),
        description,
        managingUnit,
        amenities: amenities || [],
        equipment: equipment || [],
        rules,
        imageUrl,
        createdById: req.user.id,
      },
    });

    // Log the action
    await logAudit({
      userId: req.user.id,
      action: "CREATE_VENUE",
      entityType: "Venue",
      entityId: venue.id,
      description: `Created venue: ${venue.name}`,
    });

    res.status(201).json({
      success: true,
      message: "Venue created successfully.",
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/venues/:id
 * Update an existing venue (VENUE_MANAGER only, must be the creator)
 */
const updateVenue = async (req, res, next) => {
  try {
    // Verify the venue exists and belongs to this manager
    const existingVenue = await prisma.venue.findUnique({
      where: { id: req.params.id },
    });

    if (!existingVenue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    if (existingVenue.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit venues that you manage.",
      });
    }

    const updatedVenue = await prisma.venue.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        // Ensure capacity is an integer if provided
        ...(req.body.capacity && { capacity: parseInt(req.body.capacity) }),
      },
    });

    await logAudit({
      userId: req.user.id,
      action: "UPDATE_VENUE",
      entityType: "Venue",
      entityId: updatedVenue.id,
      description: `Updated venue: ${updatedVenue.name}`,
    });

    res.json({
      success: true,
      message: "Venue updated successfully.",
      data: updatedVenue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/venues/:id
 * Soft-delete a venue by marking it inactive (VENUE_MANAGER only)
 */
const deleteVenue = async (req, res, next) => {
  try {
    const existingVenue = await prisma.venue.findUnique({
      where: { id: req.params.id },
    });

    if (!existingVenue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    if (existingVenue.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete venues that you manage.",
      });
    }

    // Soft delete — mark as inactive
    await prisma.venue.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    await logAudit({
      userId: req.user.id,
      action: "DELETE_VENUE",
      entityType: "Venue",
      entityId: req.params.id,
      description: `Deactivated venue: ${existingVenue.name}`,
    });

    res.json({
      success: true,
      message: "Venue has been deactivated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};
