import { prisma } from "../lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";

export interface AuditLogData {
  action: AuditAction;
  actorId?: string;
  actorName?: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

export const AuditTargetTypes = {
  TRIP: "TRIP",
  BLOG: "BLOG",
  BOOKING: "BOOKING",
  USER: "USER",
  PAYMENT: "PAYMENT",
  ROLE: "ROLE",
  PERMISSION: "PERMISSION",
  SERVER_CONFIG: "SERVER_CONFIG",
} as const;

export { AuditAction } from "@prisma/client";
export { AuditAction as AuditActions } from "@prisma/client"; // Keep alias for backward compat if needed

export class AuditService {
  async logAudit(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          actorId: data.actorId,
          targetType: data.targetType,
          targetId: data.targetId,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }
}

export const auditService = new AuditService();
