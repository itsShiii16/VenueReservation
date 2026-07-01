/**
 * authorizeRoles.js — Role-based Authorization Middleware
 *
 * Usage in routes:
 *   authorizeRoles("SYSTEM_ADMIN")
 *   authorizeRoles("VENUE_MANAGER", "SYSTEM_ADMIN")
 *
 * Must be used AFTER the authenticate middleware, since it
 * reads the role from req.user.
 */

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
