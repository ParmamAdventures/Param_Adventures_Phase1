import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

type UserWithRoles = {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  phoneNumber: string | null;
  address: string | null;
  status: string;
  createdAt: Date;
  avatarImage: string | null;
  preferences: Record<string, unknown> | null;
  roles: { role: { id: string; name: string } }[];
};

type RolePermissionRow = {
  permission: { key: string };
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await authService.register({ email, password, name });
  return ApiResponse.success(res, "User registered successfully", { user }, 201);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user: authUser } = await authService.login(email, password);

  // Fetch full user details with roles and permissions
  const { prisma } = await import("../lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      bio: true,
      age: true,
      gender: true,
      phoneNumber: true,
      address: true,
      status: true,
      createdAt: true,
      avatarImage: true,
      preferences: true,
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
    },
  }) as UserWithRoles | null;

  const userRoles = (user?.roles ?? []).map((r) => r.role.name);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: { name: { in: userRoles } } },
    include: { permission: true },
  });

  const permissions = Array.from(new Set(rolePermissions.map((rp: RolePermissionRow) => rp.permission.key)));

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return ApiResponse.success(res, "Login successful", {
    accessToken,
    user: { ...user, roles: userRoles, permissions },
  });
});


export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return ApiResponse.error(res, "Missing refresh token", 401);
  }

  const { accessToken } = await authService.refresh(token);
  return ApiResponse.success(res, "Token refreshed", { accessToken });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return ApiResponse.success(res, "Logged out successfully");
});

export const me = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { prisma } = await import("../lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      bio: true,
      age: true,
      gender: true,
      phoneNumber: true,
      address: true,
      status: true,
      createdAt: true,
      avatarImage: true,
      preferences: true,
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
    },
  });

  const userRoles = (user?.roles ?? []).map((r) => r.role.name);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: { name: { in: userRoles } } },
    include: { permission: true },
  });

  const permissions = Array.from(new Set(rolePermissions.map((rp: RolePermissionRow) => rp.permission.key)));

  res.set("Cache-Control", "no-store");
  return ApiResponse.success(res, "Current user details", {
    ...user,
    roles: userRoles,
    permissions,
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  return ApiResponse.success(res, "If an account exists, a reset link has been sent.");
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return ApiResponse.success(res, "Password updated successfully");
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  await authService.changePassword(userId, currentPassword, newPassword);
  return ApiResponse.success(res, "Password changed successfully");
});

export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as UserWithRoles | undefined; // User attached by Passport Strategy
  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  // Generate Session
  const { accessToken, refreshToken } = await authService.login(user.email);

  // Set Refresh Cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // Redirect to Frontend
  // Note: We can't pass AccessToken easily in URL hash/query securely without exposing it.
  // Strategy: Redirect to /dashboard.
  // Frontend's Middleware/Effect checks "Refresh Token" cookie? 
  // OR Frontend calls "/auth/refresh" immediately on mount if no access token.
  // This is the standard pattern.
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});
