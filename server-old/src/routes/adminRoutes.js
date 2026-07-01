/**
 * adminRoutes.js — System Admin Routes
 *
 * GET   /api/admin/venue-manager-requests              — List all VM requests
 * PATCH /api/admin/venue-manager-requests/:id/approve   — Approve a VM request
 * PATCH /api/admin/venue-manager-requests/:id/reject    — Reject a VM request
 *
 * All routes require SYSTEM_ADMIN role.
 */

const express = require("express");
const router = express.Router();

const {
  getAllRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/adminController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { validate } = require("../middleware/validate");
const { reviewRequestRules } = require("../validators/venueManagerRequestValidators");

// All admin routes require authentication + SYSTEM_ADMIN role
router.use(authenticate, authorizeRoles("SYSTEM_ADMIN"));

// Venue Manager Request management
router.get("/venue-manager-requests", getAllRequests);
router.patch("/venue-manager-requests/:id/approve", reviewRequestRules, validate, approveRequest);
router.patch("/venue-manager-requests/:id/reject", reviewRequestRules, validate, rejectRequest);

module.exports = router;
