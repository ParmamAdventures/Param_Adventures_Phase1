import { prisma } from "../lib/prisma";

export interface AuditLogData {
  action: string;
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
