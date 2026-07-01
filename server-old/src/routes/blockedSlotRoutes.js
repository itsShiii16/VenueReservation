/**
 * blockedSlotRoutes.js — Blocked Slot Routes
 *
 * GET    /api/blocked-slots/:venueId  — Get blocked slots for a venue (public)
 * POST   /api/blocked-slots           — Create blocked slot (VENUE_MANAGER)
 * DELETE /api/blocked-slots/:id       — Remove blocked slot (VENUE_MANAGER)
 */

const express = require("express");
const router = express.Router();

const {
  getByVenue,
  createBlockedSlot,
  deleteBlockedSlot,
} = require("../controllers/blockedSlotController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { validate } = require("../middleware/validate");
const { createBlockedSlotRules } = require("../validators/blockedSlotValidators");

// Authenticated users can view blocked slots as part of availability checking.
router.get("/:venueId", authenticate, getByVenue);

// Protected: manage blocked slots (VENUE_MANAGER only)
router.post(
  "/",
  authenticate,
  authorizeRoles("VENUE_MANAGER"),
  createBlockedSlotRules,
  validate,
  createBlockedSlot
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("VENUE_MANAGER"),
  deleteBlockedSlot
);

module.exports = router;
