import { Request, Response, NextFunction } from "express";

/**
 * Factory function to create role-based authorization middleware.
 * Checks if authenticated user has required role, denies with 403 if not.
 * @param {string} role - Required role name
 * @returns {Function} - Express middleware function for role authorization
 */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user?.roles?.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
