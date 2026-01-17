import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// ... keep existing imports ...

import { prisma } from "../lib/prisma";

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

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user) return res.status(401).json({ error: "User not found" });

    // Flatten unique permissions
    const permissions = new Set<string>();
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        if (rp.permission?.key) permissions.add(rp.permission.key);
      });
      // Failsafe: Ensure SUPER_ADMIN has critical permissions even if DB seed is stale
      if (ur.role.name === "SUPER_ADMIN") {
        permissions.add("trip:delete");
        permissions.add("trip:view:internal");
        permissions.add("blog:view:internal");
        // Add other critical ones as needed or rely on DB for the rest
      }
    });

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

    // Optional Auth: If token is valid, try to fetch full user to get permissions
    // This allows mixed Views (Public vs Draft) to work correctly
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
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
