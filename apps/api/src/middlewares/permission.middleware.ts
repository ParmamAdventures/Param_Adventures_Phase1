import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function attachPermissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const roleNames = roles.map((r) => r.role.name);

  const permissions = new Set<string>();
  roles.forEach((r) => {
    r.role.permissions.forEach((p) => {
      permissions.add(p.permission.key);
    });
  });

  (req as any).user = {
    ...(req as any).user,
    roles: roleNames,
    permissions: Array.from(permissions),
  };

  next();
}
