import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function attachPermissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const roles: any[] = await prisma.userRole.findMany({
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

    const roleNames = roles
      .map((r) => r.role?.name)
      .filter(Boolean) as string[];

    const permissionsSet = new Set<string>();
    for (const r of roles) {
      const perms = r.role?.permissions ?? [];
      for (const p of perms) {
        const key = p?.permission?.key;
        if (key) permissionsSet.add(key);
      }
    }

    if (req.user) {
      req.user.roles = roleNames;
      req.user.permissions = Array.from(permissionsSet);
      req.permissions = req.user.permissions; // Also attach to req.permissions as seen in trips.routes
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
