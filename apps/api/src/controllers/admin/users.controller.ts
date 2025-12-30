import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      roles: u.roles.map((r) => r.role.name),
      createdAt: u.createdAt,
    }))
  );
}
export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      status,
      statusReason: reason,
    },
    select: {
      id: true,
      email: true,
      status: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: (req as any).user.id,
      action: "USER_STATUS_UPDATED",
      targetType: "USER",
      targetId: user.id,
      metadata: { status, reason },
    },
  });

  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  // Soft delete via status (Using BANNED as proxy for DELETE to avoid schema lock issues)
  const user = await prisma.user.update({
    where: { id },
    data: { status: "BANNED", statusReason: "DELETED_BY_ADMIN" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: (req as any).user.id,
      action: "USER_DELETED",
      targetType: "USER",
      targetId: user.id,
      metadata: { deletedAt: new Date().toISOString() },
    },
  });

  res.json({ message: "User deleted successfully" });
}

export async function unsuspendUser(req: Request, res: Response) {
    const { id } = req.params;
  
    const user = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE", statusReason: null },
    });
  
    await prisma.auditLog.create({
      data: {
        actorId: (req as any).user.id,
        action: "USER_UNSUSPENDED",
        targetType: "USER",
        targetId: user.id,
      },
    });
  
    res.json(user);
}
