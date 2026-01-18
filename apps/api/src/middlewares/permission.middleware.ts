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

    // Failsafe: Augment permissions for SUPER_ADMIN and ADMIN to match route checks
    // This prevents 403s when database permission keys lag behind code expectations.
    if (roleNames.includes("SUPER_ADMIN")) {
      // Trip permissions
      permissionsSet.add("trip:create");
      permissionsSet.add("trip:view:internal");
      permissionsSet.add("trip:edit");
      permissionsSet.add("trip:delete");
      permissionsSet.add("trip:publish");
      permissionsSet.add("trip:archive");
      permissionsSet.add("trip:approve");
      permissionsSet.add("trip:submit");
      permissionsSet.add("trip:update-status");
      permissionsSet.add("trip:assign-guide");
      permissionsSet.add("trip:assign-manager");

      // Booking permissions
      permissionsSet.add("booking:read:admin");
      permissionsSet.add("booking:approve");
      permissionsSet.add("booking:reject");
      permissionsSet.add("booking:cancel");
      permissionsSet.add("booking:refund");

      // Blog/Content permissions
      permissionsSet.add("blog:create");
      permissionsSet.add("blog:update");
      permissionsSet.add("blog:publish");
      permissionsSet.add("blog:delete");
      permissionsSet.add("blog:view:internal");
      permissionsSet.add("blog:approve");
      permissionsSet.add("blog:reject");
      permissionsSet.add("blog:submit");

      // Media permissions
      permissionsSet.add("media:upload");
      permissionsSet.add("media:view");
      permissionsSet.add("media:delete");
      permissionsSet.add("media:manage");

      // User permissions
      permissionsSet.add("user:list");
      permissionsSet.add("user:create");
      permissionsSet.add("user:update");
      permissionsSet.add("user:delete");
      permissionsSet.add("user:edit");
      permissionsSet.add("user:assign-role");
      permissionsSet.add("user:remove-role");

      // Role permissions
      permissionsSet.add("role:list");
      permissionsSet.add("role:create");
      permissionsSet.add("role:update");
      permissionsSet.add("role:delete");
      permissionsSet.add("role:assign");

      // Analytics & Audit
      permissionsSet.add("analytics:view");
      permissionsSet.add("audit:view");
      permissionsSet.add("metrics:read");

      // System/Admin
      permissionsSet.add("system:settings");
      permissionsSet.add("admin:dashboard");
    }

    // ADMIN: Most permissions, but cannot delete users, delete roles, or refund bookings
    if (roleNames.includes("ADMIN") && !roleNames.includes("SUPER_ADMIN")) {
      // Trip permissions
      permissionsSet.add("trip:create");
      permissionsSet.add("trip:view:internal");
      permissionsSet.add("trip:edit");
      permissionsSet.add("trip:delete");
      permissionsSet.add("trip:publish");
      permissionsSet.add("trip:archive");
      permissionsSet.add("trip:approve");
      permissionsSet.add("trip:submit");
      permissionsSet.add("trip:update-status");
      permissionsSet.add("trip:assign-guide");
      permissionsSet.add("trip:assign-manager");

      // Booking permissions (no refund)
      permissionsSet.add("booking:read:admin");
      permissionsSet.add("booking:approve");
      permissionsSet.add("booking:reject");
      permissionsSet.add("booking:cancel");

      // Blog moderation
      permissionsSet.add("blog:create");
      permissionsSet.add("blog:update");
      permissionsSet.add("blog:publish");
      permissionsSet.add("blog:view:internal");
      permissionsSet.add("blog:approve");
      permissionsSet.add("blog:reject");
      permissionsSet.add("blog:submit");

      // Media
      permissionsSet.add("media:upload");
      permissionsSet.add("media:view");
      permissionsSet.add("media:delete");
      permissionsSet.add("media:manage");

      // Users (no delete). Can edit/update user profiles.
      permissionsSet.add("user:list");
      permissionsSet.add("user:create");
      permissionsSet.add("user:update");
      permissionsSet.add("user:edit");

      // Roles (no assign/remove or delete per policy)
      permissionsSet.add("role:list");
      permissionsSet.add("role:create");
      permissionsSet.add("role:update");

      // Analytics & Audit
      permissionsSet.add("analytics:view");
      permissionsSet.add("audit:view");
      permissionsSet.add("metrics:read");

      permissionsSet.add("admin:dashboard");
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
