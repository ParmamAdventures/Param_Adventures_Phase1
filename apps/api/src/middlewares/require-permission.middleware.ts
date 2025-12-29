import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";
import { prisma } from "../lib/prisma";

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        throw new HttpError(403, "FORBIDDEN", "Unauthenticated");
    }

    // Check if permission is present in current list
    if (user.permissions && user.permissions.includes(permission)) {
        return next();
    }

    // If not present (or permissions list is empty), fetch from DB to be sure
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (dbUser) {
        const permissions = new Set<string>();
        dbUser.roles.forEach(ur => {
            ur.role.permissions.forEach(rp => {
                permissions.add(rp.permission.key);
            });
        });
        user.permissions = Array.from(permissions);
        (req as any).user.permissions = user.permissions; // persist for downstream
    }
    
    // Final check
    if (!user.permissions?.includes(permission)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        `You do not have permission to perform this action (${permission})`
      );
    }

    next();
  };
}
