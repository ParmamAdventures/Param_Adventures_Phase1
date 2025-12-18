import { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/httpError";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user?.permissions) {
      throw new HttpError(403, "FORBIDDEN", "Unauthenticated");
    }

    if (!user.permissions.includes(permission)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action"
      );
    }

    next();
  };
}
