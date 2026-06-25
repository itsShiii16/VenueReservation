/**
 * venueManagerRequestValidators.js — Validation rules for VM request endpoints
 */

const { body } = require("express-validator");

const submitRequestRules = [
  body("officeOrOrganization")
    .trim()
    .notEmpty()
    .withMessage("Office or organization is required."),

  body("position")
    .trim()
    .notEmpty()
    .withMessage("Position is required."),

  body("facilityToManage")
    .trim()
    .notEmpty()
    .withMessage("Facility to manage is required."),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required.")
    .isLength({ min: 20 })
    .withMessage("Reason must be at least 20 characters."),

  body("supportingDocumentUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Supporting document must be a valid URL."),
];

const reviewRequestRules = [
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks must be at most 500 characters."),
];

module.exports = { submitRequestRules, reviewRequestRules };
