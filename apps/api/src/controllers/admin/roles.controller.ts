import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
