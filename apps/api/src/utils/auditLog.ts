import { prisma } from "../lib/prisma";
import { AuditAction } from "@prisma/client";

/**
 * Creates an audit log entry
 * Consolidates 14+ duplicate audit log creations across controllers
 */
export async function createAuditLog(params: {
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata || {},
    },
  });
}

/**
 * Re-export AuditAction as AuditActions for backward compatibility
 */
export { AuditAction as AuditActions } from "@prisma/client";

/**
 * Type-safe target types
 */
export const AuditTargetTypes = {
  TRIP: "TRIP",
  BLOG: "BLOG",
  BOOKING: "BOOKING",
  USER: "USER",
  PAYMENT: "PAYMENT",
  ROLE: "ROLE",
  PERMISSION: "PERMISSION",
} as const;

export type { AuditAction };
// TargetType is just string in schema, but we can keep the helper
