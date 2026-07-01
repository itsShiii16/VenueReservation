/**
 * venueManagerRequestController.js — Venue Manager Request Controller
 *
 * Handles requests from Clients to become Venue Managers.
 * Clients submit requests; System Admin reviews them (in adminController).
 */

const prisma = require("../config/db");
const { logAudit } = require("../services/auditService");

/**
 * POST /api/venue-manager-requests
 * Submit a request to become a Venue Manager (CLIENT only)
 */
const submitRequest = async (req, res, next) => {
  try {
    const { officeOrOrganization, position, facilityToManage, reason, supportingDocumentUrl } =
      req.body;

    // Check for existing pending request
    const existingRequest = await prisma.venueManagerRequest.findFirst({
      where: {
        clientId: req.user.id,
        status: "PENDING_REVIEW",
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending venue manager request.",
      });
    }

    const request = await prisma.venueManagerRequest.create({
      data: {
        officeOrOrganization,
        position,
        facilityToManage,
        reason,
        supportingDocumentUrl,
        clientId: req.user.id,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: "SUBMIT_VM_REQUEST",
      entityType: "VenueManagerRequest",
      entityId: request.id,
      description: `Submitted venue manager request for ${facilityToManage}`,
    });

    res.status(201).json({
      success: true,
      message: "Venue manager request submitted successfully.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/venue-manager-requests/my
 * Get the current user's venue manager requests
 */
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await prisma.venueManagerRequest.findMany({
      where: { clientId: req.user.id },
      include: {
        reviewedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRequest, getMyRequests };
