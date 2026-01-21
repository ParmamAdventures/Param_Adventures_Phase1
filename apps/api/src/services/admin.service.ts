import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { auditService, AuditActions } from "./audit.service";

export class AdminService {
  /**
   * Gets dashboard statistics for admin overview.
   * @returns Dashboard stats including counts and recent activity.
   */
  async getDashboardStats() {
    const [pendingBlogs, totalUsers, activeTrips, recentActivity] = await prisma.$transaction([
      // 1. Pending Blogs
      prisma.blog.count({
        where: { status: "PENDING_REVIEW" },
      }),
      // 2. Active Users
      prisma.user.count({
        where: { status: "ACTIVE" },
      }),
      // 3. Active/Published Trips
      prisma.trip.count({
        where: { status: "PUBLISHED" },
      }),
      // 4. Recent Audit Logs (Activity Stream)
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          createdAt: true,
          targetType: true,
        },
      }),
    ]);

    return {
      counts: {
        pendingBlogs,
        totalUsers,
        activeTrips,
      },
      recentActivity,
    };
  }

  /**
   * Lists all users with optional role filtering.
   * @param roleFilter Optional role name to filter by.
   * @returns Array of users with their roles.
   */
  async listUsers(roleFilter?: string) {
    const where: any = {};

    if (roleFilter) {
      where.roles = {
        some: {
          role: {
            name: roleFilter,
          },
        },
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        avatarImage: {
          select: {
            thumbUrl: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      roles: u.roles.map((r) => r.role.name),
      createdAt: u.createdAt,
      avatarImage: u.avatarImage,
    }));
  }

  /**
   * Updates a user's status.
   * @param userId The user ID to update.
   * @param status The new status (ACTIVE, SUSPENDED, BANNED).
   * @param reason Optional reason for the status change.
   * @param actorId The admin user making the change.
   * @returns The updated user.
   */
  async updateUserStatus(userId: string, status: string, actorId: string, reason?: string) {
    if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      throw new HttpError(400, "INVALID_STATUS", "Invalid status");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: status as "ACTIVE" | "SUSPENDED" | "BANNED",
        statusReason: reason,
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    await auditService.logAudit({
      actorId,
      action: AuditActions.USER_STATUS_UPDATED,
      targetType: "USER",
      targetId: user.id,
      metadata: { status, reason },
    });

    return user;
  }

  /**
   * Soft deletes a user by setting status to BANNED.
   * @param userId The user ID to delete.
   * @param actorId The admin user performing the deletion.
   * @returns Success message.
   */
  async deleteUser(userId: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: "BANNED", statusReason: "DELETED_BY_ADMIN" },
    });

    await auditService.logAudit({
      actorId,
      action: AuditActions.USER_DELETED,
      targetType: "USER",
      targetId: user.id,
      metadata: { deletedAt: new Date().toISOString() },
    });

    return { message: "User deleted successfully", userId: user.id };
  }

  /**
   * Unsuspends a user by setting status back to ACTIVE.
   * @param userId The user ID to unsuspend.
   * @param actorId The admin user performing the action.
   * @returns The updated user.
   */
  async unsuspendUser(userId: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE", statusReason: null },
    });

    await auditService.logAudit({
      actorId,
      action: AuditActions.USER_UNSUSPENDED,
      targetType: "USER",
      targetId: user.id,
    });

    return user;
  }

  /**
   * Gets moderation summary showing pending items.
   * @returns Counts of pending trips and blogs.
   */
  async getModerationSummary() {
    const [pendingTrips, pendingBlogs] = await Promise.all([
      prisma.trip.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    return {
      pendingTrips,
      pendingBlogs,
      totalPending: pendingTrips + pendingBlogs,
    };
  }

  /**
   * Gets a user by ID for admin viewing.
   * @param userId The user ID.
   * @returns User details with roles and activity.
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        statusReason: true,
        createdAt: true,
        avatarImage: {
          select: {
            thumbUrl: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            blogs: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "NOT_FOUND", "User not found");
    }

    return {
      ...user,
      roles: user.roles.map((r) => r.role.name),
      activityCount: {
        bookings: user._count.bookings,
        blogs: user._count.blogs,
        reviews: user._count.reviews,
      },
    };
  }
}

export const adminService = new AdminService();
