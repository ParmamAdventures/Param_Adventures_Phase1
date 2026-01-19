import { prisma } from "../lib/prisma";
import { AuditAction } from "@prisma/client";

export interface AuditLogData {
  action: AuditAction;
  actorId?: string;
  actorName?: string;
  targetType: string;
  targetId?: string;
  metadata?: any;
}

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
