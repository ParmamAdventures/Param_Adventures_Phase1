import { prisma } from "../lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import { auditService } from "./audit.service";

export class UserService {
  /**
   * Fetches a user by ID with their roles and permissions.
   * @param userId The ID of the user to fetch.
   * @returns The user object with roles and permissions, or null if not found.
   */
  async getUserWithPermissions(userId: string) {
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
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const roles = user.roles.map((r) => r.role.name);
    const permissions = new Set<string>();

    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.key);
      });
    });

    return {
      ...user,
      roles,
      permissions: Array.from(permissions),
    };
  }

  /**
   * Checks if a user has a specific permission.
   * @param userId The ID of the user.
   * @param permissionKey The permission key to check.
   * @returns True if the user has the permission, false otherwise.
   */
  async hasPermission(userId: string, permissionKey: string) {
    const user = await this.getUserWithPermissions(userId);
    if (!user) return false;
    return user.permissions.includes(permissionKey);
  }
  /**
   * Updates a user's profile and logs the action.
   */
  async updateProfile(userId: string, data: Prisma.UserUpdateInput & { avatarImageId?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        nickname: data.nickname,
        bio: data.bio,
        age: typeof data.age === "number" ? data.age : undefined, // Ensure number
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarImage: data.avatarImageId
          ? { connect: { id: data.avatarImageId as string } }
          : undefined,
        preferences: data.preferences ?? undefined,
      },
      include: {
        avatarImage: true,
      },
    });

    await auditService.logAudit({
      actorId: userId,
      action: AuditAction.USER_UPDATE_PROFILE,
      targetType: "User",
      targetId: userId,
    });

    return user;
  }
}

export const userService = new UserService();
