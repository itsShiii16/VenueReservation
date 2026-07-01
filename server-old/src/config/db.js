/**
 * db.js — Prisma Client singleton
 *
 * Creates a single PrismaClient instance to be shared across the app.
 * This prevents creating multiple connections during development with
 * hot-reloading (nodemon).
 */

const { PrismaClient } = require("@prisma/client");

// Reuse the same client instance across hot-reloads in development
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

module.exports = prisma;
