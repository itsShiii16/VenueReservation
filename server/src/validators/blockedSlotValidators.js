/**
 * blockedSlotValidators.js — Validation rules for blocked slot endpoints
 */

const { body } = require("express-validator");

const createBlockedSlotRules = [
  body("venueId")
    .trim()
    .notEmpty()
    .withMessage("Venue ID is required.")
    .isUUID()
    .withMessage("Venue ID must be a valid UUID."),

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

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Reason must be at most 300 characters."),
];

module.exports = { createBlockedSlotRules };
