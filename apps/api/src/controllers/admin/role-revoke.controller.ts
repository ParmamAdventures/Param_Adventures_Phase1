import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isLastSuperAdmin } from "../../utils/roleGuards";

const prisma = new PrismaClient();

export async function revokeRole(req: Request, res: Response) {
  const actor = (req as any).user;
  const { userId, roleName } = req.body;

  if (!actor || !actor.id) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  // Rule 1: cannot modify self
  if (actor.id === userId) {
    return res.status(403).json({ error: "Cannot modify your own roles" });
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return res.status(404).json({ error: "Role not found" });

  // Rule 4: cannot remove last SUPER_ADMIN
  if (role.name === "SUPER_ADMIN" && (await isLastSuperAdmin(userId))) {
    return res.status(403).json({ error: "Cannot remove last SUPER_ADMIN" });
  }

  // Rule 2 & 3
  if (role.isSystem && !(actor.roles || []).includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "System role modification denied" });
  }

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId: role.id } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "ROLE_REVOKED",
      targetType: "User",
      targetId: userId,
      metadata: { role: roleName },
    },
  });

  res.json({ message: "Role revoked" });
}
