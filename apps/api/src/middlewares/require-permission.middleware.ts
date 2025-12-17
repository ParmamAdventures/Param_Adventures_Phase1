import { Request, Response, NextFunction } from "express";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user?.permissions) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Super Admin bypass
    if (user.roles.includes("SUPER_ADMIN")) {
      return next();
    }

    if (!user.permissions.includes(permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
