import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { tokenDenylistService } from "../services/tokenDenylist.service";
import * as jwt from "jsonwebtoken";
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

interface GoogleProfile {
  id: string; // Google ID
  displayName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
  provider: string;
}

/**
 * Register a new user account with email, password, and name.
 * @param {Request} req - Express request with email, password, name in body
 * @param {Response} res - Express response with created user and 201 status
 * @returns {Promise<void>} - Sends success response with user data
 * @throws {Error} - Throws if email already exists or validation fails
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await authService.register({ email, password, name });
  return ApiResponse.success(res, { user }, "User registered successfully", 201);
});

/**
 * Authenticate user with email and password credentials.
 * Returns access token, refresh token (in HttpOnly cookie), and full user details with roles and permissions.
 * @param {Request} req - Express request with email, password in body
 * @param {Response} res - Express response with tokens and user data, sets refresh_token cookie
 * @returns {Promise<void>} - Sends success response with { accessToken, user }
 * @throws {Error} - Throws if credentials invalid or user not found
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user: authUser } = await authService.login(email, password);

  // Fetch full user details with roles and permissions
  const { prisma } = await import("../lib/prisma");

  const user = (await prisma.user.findUnique({
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
  })) as UserWithRoles | null;

  const userRoles = (user?.roles ?? []).map((r) => r.role.name);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: { name: { in: userRoles } } },
    include: { permission: true },
  });

  const permissions = Array.from(
    new Set(rolePermissions.map((rp: RolePermissionRow) => rp.permission.key)),
  );

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return ApiResponse.success(
    res,
    {
      accessToken,
      user: { ...user, roles: userRoles, permissions },
    },
    "Login successful",
  );
});

/**
 * Refresh expired access token using refresh token from cookies.
 * @param {Request} req - Express request with refresh_token in HttpOnly cookie
 * @param {Response} res - Express response with new accessToken
 * @returns {Promise<void>} - Sends success response with { accessToken }
 * @throws {Error} - Throws if refresh token missing, invalid, or expired
 */
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return ApiResponse.error(res, "MISSING_REFRESH_TOKEN", "Missing refresh token", 401);
  }

  try {
    const { accessToken } = await authService.refresh(token);
    return ApiResponse.success(res, { accessToken }, "Token refreshed", 200);
  } catch {
    return ApiResponse.error(res, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token", 401);
  }
});

/**
 * Logout user by clearing refresh token cookie.
 * @param {Request} _req - Express request (unused)
 * @param {Response} res - Express response with cleared refresh_token cookie
 * @returns {Promise<void>} - Sends success response
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  // Revoke Access Token if present
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (decoded?.jti && decoded?.exp) {
      const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
      await tokenDenylistService.denylistToken(decoded.jti, ttl);
    }
  }

  // Revoke Refresh Token if present in cookie
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
    if (decoded?.jti && decoded?.exp) {
      const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
      await tokenDenylistService.denylistToken(decoded.jti, ttl);
    }
  }

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return ApiResponse.success(res, "Logged out successfully");
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
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

  const permissions = Array.from(
    new Set(rolePermissions.map((rp: RolePermissionRow) => rp.permission.key)),
  );

  res.set("Cache-Control", "no-store");
  return ApiResponse.success(
    res,
    {
      ...user,
      roles: userRoles,
      permissions,
    },
    "Current user details",
  );
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  return ApiResponse.success(res, {}, "If an account exists, a reset link has been sent.");
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return ApiResponse.success(res, {}, "Password updated successfully");
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  await authService.changePassword(userId, currentPassword, newPassword);
  return ApiResponse.success(res, "Password changed successfully");
});

export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  // req.user is populated by passport
  const user = req.user as unknown as GoogleProfile | undefined;
  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  // Generate Session
  // Use socialLogin to handle user provisioning and login for social accounts
  const { refreshToken } = await authService.socialLogin({
    id: user.id, // This is the googleId
    email: user.emails[0].value, // Get email from the emails array
    name: user.displayName || `${user.name.givenName} ${user.name.familyName}`, // Use displayName or construct from name object
  });
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
