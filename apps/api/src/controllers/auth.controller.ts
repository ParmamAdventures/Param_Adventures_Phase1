import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_REGISTER",
      targetType: "User",
      targetId: user.id,
    },
  });

  res.status(201).json({ message: "User registered successfully" });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/auth/refresh",
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_LOGIN",
      targetType: "User",
      targetId: user.id,
    },
  });

  res.json({ accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken(payload.sub);

    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refresh_token", {
    path: "/auth/refresh",
  });

  res.json({ message: "Logged out successfully" });
}

export async function me(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      // collect permissions via roles -> role.permissions -> permission
      // We'll fetch permissions separately for clarity
    },
  });

  const userRoles = (user?.roles ?? []).map((r: any) => r.role.name);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: { name: { in: userRoles } } },
    include: { permission: true },
  });

  const permissions = Array.from(
    new Set(rolePermissions.map((rp) => rp.permission.key))
  );

  // Prevent browsers from returning cached (304) responses for auth state.
  res.set("Cache-Control", "no-store");
  res.json({ ...user, roles: userRoles, permissions });
}
