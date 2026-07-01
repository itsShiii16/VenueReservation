/**
 * authenticate.js — JWT Authentication Middleware
 *
 * Verifies the JWT token from the Authorization header.
 * If valid, attaches the user object to req.user.
 * If missing or invalid, returns 401 Unauthorized.
 */

const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        organization: true,
        position: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    next(error);
  }
};

module.exports = { authenticate };
