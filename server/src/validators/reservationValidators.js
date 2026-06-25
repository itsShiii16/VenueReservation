/**
 * reservationValidators.js — Validation rules for reservation endpoints
 */

const { body } = require("express-validator");

const createReservationRules = [
  body("venueId")
    .trim()
    .notEmpty()
    .withMessage("Venue ID is required.")
    .isUUID()
    .withMessage("Venue ID must be a valid UUID."),

  body("eventTitle")
    .trim()
    .notEmpty()
    .withMessage("Event title is required.")
    .isLength({ max: 200 })
    .withMessage("Event title must be at most 200 characters."),

  body("activityType")
    .trim()
    .notEmpty()
    .withMessage("Activity type is required."),

  body("expectedAttendees")
    .notEmpty()
    .withMessage("Expected attendees is required.")
    .isInt({ min: 1 })
    .withMessage("Expected attendees must be a positive integer."),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required.")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date."),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required.")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date.")
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time.");
      }
      return true;
    }),

  body("notes")
    .optional()
    .trim(),
];

const declineReservationRules = [
  body("declineReason")
    .trim()
    .notEmpty()
    .withMessage("A reason for declining is required."),
];

module.exports = { createReservationRules, declineReservationRules };
