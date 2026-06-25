/**
 * userRoutes.js — User Routes
 *
 * GET  /api/users          — Get all users (admin only)
 * GET  /api/users/:id      — Get user by ID
 * PUT  /api/users/profile  — Update own profile
 */

const express = require("express");
const router = express.Router();

const { getUsers, getUserById, updateProfile } = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorizeRoles");

// All user routes require authentication
router.use(authenticate);

// Admin-only: list all users
router.get("/", authorizeRoles("SYSTEM_ADMIN"), getUsers);

// Update own profile (must come before /:id to avoid conflict)
router.put("/profile", updateProfile);

// Get user by ID
router.get("/:id", getUserById);

module.exports = router;
