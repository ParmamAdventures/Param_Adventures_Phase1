import { Request, Response, NextFunction } from "express";
import { auditService } from "../services/audit.service";
import { AuditAction } from "../generated/client";

interface AutoLogOptions {
  action: AuditAction;
  targetType: string;
  /**
   * Function to extract target ID from request.
   * Defaults to req.params.id if not provided.
   */
  getTargetId?: (req: Request) => string | undefined;
}

/**
 * Factory function to create audit logging middleware.
 * Automatically logs actions to audit trail after response is sent.
 * @param {AutoLogOptions} options - Configuration with action, targetType, optional getTargetId function
 * @returns {Function} - Express middleware function that auto-logs actions
 */
export function autoLog(options: AutoLogOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    // We hook into the response 'finish' event to log after the action is done.
    // This allows us to know the status code (success/fail).
    res.on("finish", () => {
      // Only log successful mutations or specific errors if needed.
      // Usually, audit logs track what *happened*.
      // If the status is 2xx, the action succeeded.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const actorId = (req as any).user?.id;
        const targetId = options.getTargetId ? options.getTargetId(req) : req.params.id;

        auditService.logAudit({
          actorId,
          action: options.action,
          targetType: options.targetType,
          targetId,
          metadata: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          },
        });
      }
    });

    next();
  };
}
