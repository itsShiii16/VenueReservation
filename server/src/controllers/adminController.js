/**
 * adminController.js — System Admin Controller
 *
 * Handles admin-only operations:
 * - Review and approve/reject Venue Manager access requests
 *
 * Note: System Admin does NOT directly edit venue details.
 */

const prisma = require("../config/db");
const { logAudit } = require("../services/auditService");

/**
 * GET /api/admin/venue-manager-requests
 * Get all venue manager requests (SYSTEM_ADMIN only)
 */
const getAllRequests = async (req, res, next) => {
  try {
    // Optional status filter via query param: ?status=PENDING_REVIEW
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const requests = await prisma.venueManagerRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          },
        },
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

/**
 * PATCH /api/admin/venue-manager-requests/:id/approve
 * Approve a venue manager request and upgrade the user's role (SYSTEM_ADMIN only)
 */
const approveRequest = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const request = await prisma.venueManagerRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.status !== "PENDING_REVIEW") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // Use a transaction to update both the request and the user's role
    const [updatedRequest] = await prisma.$transaction([
      // Update the request status
      prisma.venueManagerRequest.update({
        where: { id: req.params.id },
        data: {
          status: "APPROVED",
          remarks,
          reviewedById: req.user.id,
          reviewedAt: new Date(),
        },
      }),
      // Upgrade the client to VENUE_MANAGER
      prisma.user.update({
        where: { id: request.clientId },
        data: { role: "VENUE_MANAGER" },
      }),
    ]);

    await logAudit({
      userId: req.user.id,
      action: "APPROVE_VM_REQUEST",
      entityType: "VenueManagerRequest",
      entityId: req.params.id,
      description: `Approved venue manager request. User ${request.clientId} upgraded to VENUE_MANAGER.`,
    });

    res.json({
      success: true,
      message: "Request approved. User has been upgraded to Venue Manager.",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/venue-manager-requests/:id/reject
 * Reject a venue manager request (SYSTEM_ADMIN only)
 */
const rejectRequest = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const request = await prisma.venueManagerRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.status !== "PENDING_REVIEW") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    const updatedRequest = await prisma.venueManagerRequest.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        remarks,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      userId: req.user.id,
      action: "REJECT_VM_REQUEST",
      entityType: "VenueManagerRequest",
      entityId: req.params.id,
      description: `Rejected venue manager request. Remarks: ${remarks || "None"}`,
    });

    res.json({
      success: true,
      message: "Request rejected.",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRequests, approveRequest, rejectRequest };
