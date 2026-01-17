import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

/**
 * Middleware to fetch and attach user roles and permissions to request object.
 * Requires authentication (req.user.id) to be set by auth middleware.
 * Fetches latest permissions from database for authorization checks.
 * @param {Request} req - Express request with user ID in req.user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} - Calls next() or sends 401 if unauthenticated
 */
export async function attachPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        error: `Your account status is ${user.status}.`,
        status: user.status,
        reason: user.statusReason,
      });
    }

    const roles = user.roles;

    const roleNames = roles.map((r: any) => r.role?.name).filter(Boolean) as string[];

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
