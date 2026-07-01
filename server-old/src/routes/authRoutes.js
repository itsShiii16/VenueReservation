/**
 * authRoutes.js — Authentication Routes
 *
 * POST /api/auth/register  — Create a new account
 * POST /api/auth/login     — Log in and get JWT
 * GET  /api/auth/me        — Get current user profile
 */

const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { registerRules, loginRules } = require("../validators/authValidators");

// Public routes
router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

// Protected route
router.get("/me", authenticate, getMe);

module.exports = router;
