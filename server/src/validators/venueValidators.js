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

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
];

module.exports = { createVenueRules, updateVenueRules };
