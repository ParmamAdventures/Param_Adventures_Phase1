import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      roles: [],
      permissions: [],
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
