/**
 * reservationRoutes.js — Reservation Routes
 *
 * Client routes:
 *   GET   /api/reservations/my              — My reservations
 *   POST  /api/reservations                 — Create reservation
 *   GET   /api/reservations/:id             — Reservation details
 *   PATCH /api/reservations/:id/cancel      — Cancel reservation
 *
 * Venue Manager routes:
 *   GET   /api/reservations/venue-manager   — Reservations for my venues
 *   PATCH /api/reservations/:id/approve     — Approve reservation
 *   PATCH /api/reservations/:id/decline     — Decline reservation
 */

const express = require("express");
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getVenueManagerReservations,
  approveReservation,
  declineReservation,
} = require("../controllers/reservationController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { validate } = require("../middleware/validate");
const {
  createReservationRules,
  declineReservationRules,
} = require("../validators/reservationValidators");

// All reservation routes require authentication
router.use(authenticate);

// ─── Client Routes ───
router.get("/my", getMyReservations);
router.post("/", authorizeRoles("CLIENT"), createReservationRules, validate, createReservation);
router.get("/:id", getReservationById);
router.patch("/:id/cancel", authorizeRoles("CLIENT"), cancelReservation);

// ─── Venue Manager Routes ───
router.get(
  "/venue-manager",
  authorizeRoles("VENUE_MANAGER"),
  getVenueManagerReservations
);
router.patch(
  "/:id/approve",
  authorizeRoles("VENUE_MANAGER"),
  approveReservation
);
router.patch(
  "/:id/decline",
  authorizeRoles("VENUE_MANAGER"),
  declineReservationRules,
  validate,
  declineReservation
);

module.exports = router;
