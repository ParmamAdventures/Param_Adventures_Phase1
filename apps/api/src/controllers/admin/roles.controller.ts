import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { isLastSuperAdmin } from "../../utils/roleGuards";

export async function listRoles(req: Request, res: Response) {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });


  res.json(
    roles.map((r) => ({
      id: r.id,
      name: r.name,
      isSystem: r.isSystem,
      permissions: r.permissions.map((p) => p.permission.key),
    }))
  );
}

export async function updateRolePermissions(req: Request, res: Response) {
  const { id } = req.params;
  const { permissions } = req.body; // array of permission keys

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array of strings" });
  }

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    return res.status(404).json({ error: "Role not found" });
  }

  if (role.isSystem) {
    return res.status(403).json({ error: "Cannot modify system roles" });
  }

  // Find all permission IDs for the keys
  const permissionRecs = await prisma.permission.findMany({
    where: { key: { in: permissions } },
  });

  // Transaction to replace permissions
  await prisma.$transaction(async (tx) => {
    // 1. Remove all existing
    await tx.rolePermission.deleteMany({ where: { roleId: id } });

    // 2. Add new
    if (permissionRecs.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionRecs.map((p) => ({
          roleId: id,
          permissionId: p.id,
        })),
      });
    }
  });

  res.json({ success: true });
}

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
