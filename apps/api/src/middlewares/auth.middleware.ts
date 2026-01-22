import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { tokenDenylistService } from "../services/tokenDenylist.service";
import { USER_WITH_ROLES_INCLUDE } from "../utils/prismaSelects";

/**
 * Middleware to verify Bearer token and attach authenticated user to request.
 * Fetches user details with roles and permissions from database.
 * @param {Request} req - Express request object with Authorization header
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void} - Calls next() if authenticated, sends 401 if not
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);

    // Check if process token is revoked
    if (payload.jti && (await tokenDenylistService.isTokenRevoked(payload.jti))) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: USER_WITH_ROLES_INCLUDE,
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    // Flatten unique permissions
    const permissions = new Set<string>();
    const roles = user.roles.map((ur) => ur.role.name);

    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        if (rp.permission?.key) permissions.add(rp.permission.key);
      });
    });

    // Failsafe: Ensure SUPER_ADMIN has ALL admin permissions
    if (roles.includes("SUPER_ADMIN")) {
      // Trip permissions
      permissions.add("trip:create");
      permissions.add("trip:view:internal");
      permissions.add("trip:edit");
      permissions.add("trip:delete");
      permissions.add("trip:publish");
      permissions.add("trip:archive");

      // Booking permissions
      permissions.add("booking:read:admin");
      permissions.add("booking:approve");
      permissions.add("booking:reject");
      permissions.add("booking:cancel");
      permissions.add("booking:refund");

      // Blog/Content permissions
      permissions.add("blog:create");
      permissions.add("blog:update");
      permissions.add("blog:publish");
      permissions.add("blog:delete");
      permissions.add("blog:view:internal");

      // Media permissions
      permissions.add("media:upload");
      permissions.add("media:view");
      permissions.add("media:delete");

      // User permissions
      permissions.add("user:list");
      permissions.add("user:create");
      permissions.add("user:update");
      permissions.add("user:delete");

      // Role permissions
      permissions.add("role:list");
      permissions.add("role:create");
      permissions.add("role:update");
      permissions.add("role:delete");

      // Analytics & Audit
      permissions.add("analytics:view");
      permissions.add("audit:view");

      // System
      permissions.add("system:settings");
      permissions.add("admin:dashboard");
      permissions.add("content:manage");
    }

    // Failsafe: Ensure ADMIN has most permissions (except system settings and user delete)
    if (roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN")) {
      // Trip permissions
      permissions.add("trip:create");
      permissions.add("trip:view:internal");
      permissions.add("trip:edit");
      permissions.add("trip:delete");
      permissions.add("trip:publish");
      permissions.add("trip:archive");

      // Booking permissions
      permissions.add("booking:read:admin");
      permissions.add("booking:approve");
      permissions.add("booking:reject");
      permissions.add("booking:cancel");

      // Blog/Content permissions
      permissions.add("blog:create");
      permissions.add("blog:update");
      permissions.add("blog:publish");
      permissions.add("blog:view:internal");

      // Media permissions
      permissions.add("media:upload");
      permissions.add("media:view");
      permissions.add("media:delete");

      // User permissions (no delete)
      permissions.add("user:list");
      permissions.add("user:create");
      permissions.add("user:update");

      // Role permissions
      permissions.add("role:list");
      permissions.add("role:create");
      permissions.add("role:update");

      // Analytics & Audit
      permissions.add("analytics:view");
      permissions.add("audit:view");

      permissions.add("admin:dashboard");
      permissions.add("content:manage");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || "User",
      roles: user.roles.map((ur) => ur.role.name),
      permissions: Array.from(permissions),
    };
    req.permissions = Array.from(permissions); // Populate Request-level permissions
    next();
  } catch (err) {
    console.error("Auth Fail", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return next();
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);

    // Check if token is revoked
    if (payload.jti && (await tokenDenylistService.isTokenRevoked(payload.jti))) {
      return next();
    }

    // Optional Auth: If token is valid, try to fetch full user to get permissions
    // This allows mixed Views (Public vs Draft) to work correctly
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: USER_WITH_ROLES_INCLUDE,
    });

    if (user) {
      const permissions = new Set<string>();
      user.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          if (rp.permission?.key) permissions.add(rp.permission.key);
        });
      });

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name || "User",
        roles: user.roles.map((ur) => ur.role.name),
        permissions: Array.from(permissions),
      };
      req.permissions = Array.from(permissions);
    } else {
      // Token valid but user not found? Fallback or ignore.
      // Usually safe to ignore in optional auth or treat as guest.
    }
  } catch {
    // Ignore invalid tokens in optional auth
  }
  // ...existing code...
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    // Super admin bypass or direct match
    if (userRoles.includes("SUPER_ADMIN") || userRoles.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: "Insufficient role" });
  };
}
