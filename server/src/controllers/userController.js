/**
 * userController.js — User Controller
 *
 * Handles user profile operations.
 */

const prisma = require("../config/db");

// Fields to return (exclude password)
const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  organization: true,
  position: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * GET /api/users
 * Get all users (admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get a single user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update the current user's profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, organization, position } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(organization !== undefined && { organization }),
        ...(position !== undefined && { position }),
      },
      select: USER_SELECT,
    });

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateProfile };
