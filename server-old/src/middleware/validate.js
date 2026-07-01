/**
 * validate.js — Express-Validator Integration Middleware
 *
 * Runs express-validator checks and returns 400 with validation
 * errors if any exist. Use after validation chains in routes.
 *
 * Usage in routes:
 *   router.post("/", [...validationRules], validate, controller);
 */

const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors as { field: message } for easier frontend consumption
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
