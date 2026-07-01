/**
 * errorHandler.js — Global Error Handler Middleware
 *
 * Catches all errors thrown in route handlers / controllers
 * and sends a consistent JSON error response.
 *
 * Must be registered LAST with app.use() in app.js.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the error for debugging (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  }

  // Prisma known request errors (e.g., unique constraint violation)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `A record with that ${err.meta?.target?.join(", ") || "field"} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
