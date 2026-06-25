/**
 * app.js — Express application setup
 *
 * Configures middleware (CORS, JSON parsing), mounts all API routes,
 * and attaches the global error handler.
 */

const express = require("express");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const venueRoutes = require("./routes/venueRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const blockedSlotRoutes = require("./routes/blockedSlotRoutes");
const venueManagerRequestRoutes = require("./routes/venueManagerRequestRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware imports
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ───────────── Global Middleware ─────────────

// Enable CORS for the frontend dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json());

// ───────────── API Routes ─────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/blocked-slots", blockedSlotRoutes);
app.use("/api/venue-manager-requests", venueManagerRequestRoutes);
app.use("/api/admin", adminRoutes);

// Health-check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ───────────── Error Handling ─────────────

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
