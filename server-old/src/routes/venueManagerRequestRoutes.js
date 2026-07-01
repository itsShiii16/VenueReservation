/**
 * venueManagerRequestRoutes.js — Venue Manager Request Routes (Client Side)
 *
 * POST /api/venue-manager-requests     — Submit a VM access request (CLIENT)
 * GET  /api/venue-manager-requests/my  — Get my VM requests (CLIENT)
 */

const express = require("express");
const router = express.Router();

const {
  submitRequest,
  getMyRequests,
} = require("../controllers/venueManagerRequestController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { validate } = require("../middleware/validate");
const { submitRequestRules } = require("../validators/venueManagerRequestValidators");

// All routes require authentication
router.use(authenticate);

// Client submits a request
router.post(
  "/",
  authorizeRoles("CLIENT"),
  submitRequestRules,
  validate,
  submitRequest
);

// Client views their own requests
router.get("/my", getMyRequests);

module.exports = router;
