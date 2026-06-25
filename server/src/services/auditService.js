/**
 * auditService.js — Audit Logging Service
 *
 * Provides a simple function to log important actions
 * to the AuditLog table for accountability and tracking.
 */

const prisma = require("../config/db");

/**
 * Log an action to the audit trail.
 *
 * @param {Object} params
 * @param {string} params.userId      - ID of the user performing the action
 * @param {string} params.action      - Action name (e.g., "CREATE_VENUE")
 * @param {string} params.entityType  - Type of entity (e.g., "Venue")
 * @param {string} params.entityId    - ID of the affected entity
 * @param {string} [params.description] - Optional human-readable description
 */
const logAudit = async ({ userId, action, entityType, entityId, description }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
      },
    });
  } catch (error) {
    // Audit logging should never crash the main request
    console.error("⚠️ Audit log error:", error.message);
  }
};

module.exports = { logAudit };
