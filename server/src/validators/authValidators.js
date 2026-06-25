/**
 * authValidators.js — Validation rules for authentication endpoints
 */

const { body } = require("express-validator");

const registerRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters."),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),

  body("organization")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Organization must be at most 100 characters."),

  body("position")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Position must be at most 100 characters."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];

module.exports = { registerRules, loginRules };
