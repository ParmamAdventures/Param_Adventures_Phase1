import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function assignRole(req: Request, res: Response) {
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

  // Rule 2 & 3: system roles only manageable by SUPER_ADMIN
  if (role.isSystem && !(actor.roles || []).includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "System role modification denied" });
  }

  // Prevent duplicate assignment
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "ROLE_ASSIGNED",
      targetType: "User",
      targetId: userId,
      metadata: { role: roleName },
    },
  });

  res.json({ message: "Role assigned" });
}
