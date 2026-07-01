/**
 * reservationRoutes.js - Reservation Routes
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

router.use(authenticate);

router.get("/my", getMyReservations);
router.post("/", authorizeRoles("CLIENT"), createReservationRules, validate, createReservation);

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

router.get("/:id", getReservationById);
router.patch("/:id/cancel", authorizeRoles("CLIENT"), cancelReservation);

module.exports = router;
