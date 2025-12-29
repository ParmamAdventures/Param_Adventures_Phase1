
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken } from "../utils/jwt";
import { auditService } from "./audit.service";
import { notificationService } from "./notification.service";

export class AuthService {
  async register(data: { email: string; password: string; name: string }) {
    console.log(`[AuthService] Attempting registration for: ${data.email}`);
    const normalizedEmail = data.email.toLowerCase().trim();
    const { password, name } = data;

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      console.warn(`[AuthService] Registration failed: Email ${normalizedEmail} already registered`);
      throw new Error("Email already registered");
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name,
      },
    });

    console.log(`[AuthService] Registration successful for: ${normalizedEmail}`);
    await auditService.logAudit({
      actorId: user.id,
      action: "USER_REGISTER",
      targetType: "User",
      targetId: user.id,
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new Error("Invalid credentials: User not found");
    }

    if (password) {
      const valid = await verifyPassword(password, user.password!);
      if (!valid) {
        throw new Error("Invalid credentials: Password mismatch");
      }
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    console.log(`[AuthService] Login successful for: ${email}`);
    await auditService.logAudit({
      actorId: user.id,
      action: "USER_LOGIN",
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
      console.log(`[AuthService] Token refreshed for user: ${payload.sub}`);
      return { accessToken: newAccessToken };
    } catch (error) {
      console.error(`[AuthService] Refresh failed:`, error);
      throw new Error("Invalid refresh token");
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
        data: { password: hashedPassword }
      });
    } catch (error) {
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
      data: { password: hashedPassword }
    });

    await auditService.logAudit({
      actorId: user.id,
      action: "USER_CHANGE_PASSWORD",
      targetType: "User",
      targetId: user.id,
    });
  }
}

export const authService = new AuthService();
