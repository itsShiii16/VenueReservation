/**
 * authController.js — Authentication Controller
 *
 * Handles user registration, login, and fetching the current user.
 */

const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { generateToken } = require("../utils/generateToken");

/**
 * POST /api/auth/register
 * Register a new user account (default role: CLIENT)
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, position } = req.body;

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "CLIENT", // All new users start as CLIENT
        position,
      },
      // Don't return the password
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        organization: true,
        position: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful.",
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile
 * Requires: authenticate middleware
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        organization: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
