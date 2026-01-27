import { Request } from "express";
import { Prisma } from "@prisma/client";
import { auditService, AuditAction } from "../services/audit.service";

// Re-export AuditAction for convenience
export { AuditAction };

/**
 * Helper to log audit events with consistent user extraction
 */
export const logAudit = async (
  actor: { id: string } | undefined | null,
  action: AuditAction,
  targetType: string,
  targetId?: string,
  metadata?: Prisma.InputJsonValue,
) => {
  if (!actor?.id) return;

  return auditService.logAudit({
    actorId: actor.id,
    action,
    targetType,
    targetId,
    metadata,
  });
};

/**
 * Helper to log audit events directly from Express request
 */
export const logReqAudit = async (
  req: Request,
  action: AuditAction,
  targetType: string,
  targetId?: string,
  metadata?: Prisma.InputJsonValue,
) => {
  return logAudit(req.user, action, targetType, targetId, metadata);
};
