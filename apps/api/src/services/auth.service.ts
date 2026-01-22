import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
} from "../utils/jwt";
import { auditService } from "./audit.service";
import { AuditAction } from "../generated/client";
import { notificationService } from "./notification.service";
import { HttpError } from "../utils/httpError";

export class AuthService {
  async register(data: { email: string; password: string; name: string }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const { password, name } = data;

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      console.warn(
        `[AuthService] Registration failed: Email ${normalizedEmail} already registered`,
      );
      throw new HttpError(409, "EMAIL_REGISTERED", "Email already registered");
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name,
      },
    });

    await auditService.logAudit({
      actorId: user.id,
      action: AuditAction.USER_REGISTER,
      targetType: "User",
      targetId: user.id,
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    if (password) {
      const valid = await verifyPassword(password, user.password!);
      if (!valid) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
      }
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await auditService.logAudit({
      actorId: user.id,
      action: AuditAction.USER_LOGIN,
      targetType: "User",
      targetId: user.id,
    });

    const { password: _, ...cleanUser } = user;
    return { user: cleanUser, accessToken, refreshToken };
  }

  async socialLogin(profile: { id: string; email: string; name: string }) {
    const normalizedEmail = profile.email.toLowerCase().trim();

    // 1. Check if user already exists with this googleId
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

    if (!user) {
      // 2. If not, check if a user exists with this email (might be an existing local account)
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

      if (user) {
        // Link the Google account to the existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id },
        });
        console.log(`[AuthService] Linked Google account ${profile.id} to existing user ${user.id}`);
      } else {
        // 3. If no user found by googleId or email, create a new user
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: profile.name,
            googleId: profile.id,
            // Password can be null for social logins
          },
        });
        console.log(`[AuthService] Created new user ${user.id} via Google login`);
      }
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await auditService.logAudit({
      actorId: user.id,
      action: AuditAction.USER_LOGIN, // Using USER_LOGIN for social as well
      targetType: "User",
      targetId: user.id,
    });

    const { password: _, ...cleanUser } = user;
    return { user: cleanUser, accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const newAccessToken = signAccessToken(payload.sub);
      return { accessToken: newAccessToken };
    } catch (error) {
      console.error(`[AuthService] Refresh failed:`, error);
      throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return; // Silent fail for security
    }

    const token = signResetToken(user.id);
    const resetLink = `${process.env.WEB_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    await notificationService.sendPasswordResetEmail(user.email, resetLink);
  }

  async resetPassword(token: string, password?: string) {
    try {
      const payload = verifyResetToken(token);
      const hashedPassword = await hashPassword(password!);

      await prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });
    } catch {
      throw new Error("Invalid or expired reset token");
    }
  }

  async changePassword(userId: string, currentPassword?: string, newPassword?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const valid = await verifyPassword(currentPassword!, user.password!);
    if (!valid) {
      throw new Error("Incorrect current password");
    }

    const hashedPassword = await hashPassword(newPassword!);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await auditService.logAudit({
      actorId: user.id,
      action: AuditAction.USER_CHANGE_PASSWORD,
      targetType: "User",
      targetId: user.id,
    });
  }
}

export const authService = new AuthService();
