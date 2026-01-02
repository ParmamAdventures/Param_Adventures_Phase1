import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// ... keep existing imports ...

import { prisma } from "../lib/prisma";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    
    // Fetch user with roles
    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { 
            roles: {
                include: { role: true }
            } 
        }
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = {
      id: user.id,
      roles: user.roles.map(ur => ur.role.name), // Flatten roles to string array
      permissions: [], // Permissions logic could be similar, stubbed for now
    };
    next();
  } catch (err) {
    console.error("Auth Fail", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return next();
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      roles: [],
      permissions: [],
    };
  } catch {
    // Ignore invalid tokens in optional auth
  }
  next();
}
