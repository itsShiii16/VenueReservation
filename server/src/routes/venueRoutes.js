/**
 * venueRoutes.js — Venue Routes
 *
 * GET    /api/venues      — List all venues (public)
 * GET    /api/venues/:id  — Get venue details (public)
 * POST   /api/venues      — Create venue (VENUE_MANAGER)
 * PUT    /api/venues/:id  — Update venue (VENUE_MANAGER)
 * DELETE /api/venues/:id  — Soft-delete venue (VENUE_MANAGER)
 */

const express = require("express");
const router = express.Router();

const {
  getAllVenues,
  getVenueById,
  getVenueAvailability,
  createVenue,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { validate } = require("../middleware/validate");
const { createVenueRules, updateVenueRules } = require("../validators/venueValidators");

// Public routes — no auth required
router.get("/", getAllVenues);
router.get("/:id/availability", authenticate, getVenueAvailability);
router.get("/:id", getVenueById);

// Protected routes — VENUE_MANAGER only
router.post(
  "/",
  authenticate,
  authorizeRoles("VENUE_MANAGER"),
  createVenueRules,
  validate,
  createVenue
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("VENUE_MANAGER"),
  updateVenueRules,
  validate,
  updateVenue
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("VENUE_MANAGER"),
  deleteVenue
);

module.exports = router;
