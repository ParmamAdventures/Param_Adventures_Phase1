import { PrismaClient } from "@prisma/client";
import { logger } from "../lib/logger";

const prisma = new PrismaClient();

export interface CreateAuditLogParams {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export const auditService = {
  /**
   * Logs an action to the database.
   * This function is designed to be "fire and forget" or awaited depending on criticality.
   */
  async logAudit(params: CreateAuditLogParams) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          metadata: params.metadata ?? {},
        },
      });
    } catch (error) {
      // In a production app, we might want to log this to a file or monitoring service
      // so we don't lose the fact that auditing failed.
      logger.error("FAILED TO LOG AUDIT", { error });
    }
  },
};
