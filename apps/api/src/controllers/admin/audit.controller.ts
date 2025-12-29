import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listAuditLogs(req: Request, res: Response) {
  const { action, actorId, targetType, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to list audit logs", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
