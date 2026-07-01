/**
 * venueValidators.js — Validation rules for venue endpoints
 */

const { body } = require("express-validator");

const createVenueRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Venue name is required.")
    .isLength({ max: 150 })
    .withMessage("Venue name must be at most 150 characters."),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required."),

  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required.")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),

  body("description")
    .optional()
    .trim(),

  body("managingUnit")
    .optional()
    .trim(),

  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array."),

  body("equipment")
    .optional()
    .isArray()
    .withMessage("Equipment must be an array."),

  body("rules")
    .optional()
    .trim(),

  body("imageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image URL must be a valid URL."),

  body("defaultRate")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("Default rate must be a non-negative number."),

  body("defaultRateType")
    .optional()
    .trim()
    .isIn(["HOURLY", "FLAT"])
    .withMessage("Default rate type must be HOURLY or FLAT."),

  body("defaultOpenTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Default open time must be in HH:MM format (24-hour)."),

  body("defaultCloseTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Default close time must be in HH:MM format (24-hour)."),
];

// Update uses the same rules but all fields are optional
const updateVenueRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Venue name must be at most 150 characters."),

  body("location")
    .optional()
    .trim(),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),

  body("description")
    .optional()
    .trim(),

  body("managingUnit")
    .optional()
    .trim(),

  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array."),

  body("equipment")
    .optional()
    .isArray()
    .withMessage("Equipment must be an array."),

  body("rules")
    .optional()
    .trim(),

  body("imageUrl")
    .optional()
    .trim(),

  body("defaultRate")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("Default rate must be a non-negative number."),

  body("defaultRateType")
    .optional()
    .trim()
    .isIn(["HOURLY", "FLAT"])
    .withMessage("Default rate type must be HOURLY or FLAT."),

  body("defaultOpenTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Default open time must be in HH:MM format (24-hour)."),

  body("defaultCloseTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Default close time must be in HH:MM format (24-hour)."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
];

module.exports = { createVenueRules, updateVenueRules };
