jest.mock("../../src/lib/prisma");

import { prisma } from "../../src/lib/prisma";
import { AdminService } from "../../src/services/admin.service";
import { HttpError } from "../../src/utils/httpError";

describe("AdminService", () => {
  let adminService: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService();
  });

  describe("getDashboardStats", () => {
    it("retrieves dashboard statistics", async () => {
      const mockStats = [
        5, // pendingBlogs
        100, // totalUsers
        20, // activeTrips
        [
          // recentActivity
          {
            id: "log_1",
            action: "USER_CREATED",
            createdAt: new Date(),
            targetType: "USER",
          },
        ],
      ];

      (prisma.$transaction as jest.Mock).mockResolvedValue(mockStats);

      const result = await adminService.getDashboardStats();

      expect(result.counts.pendingBlogs).toBe(5);
      expect(result.counts.totalUsers).toBe(100);
      expect(result.counts.activeTrips).toBe(20);
      expect(result.recentActivity).toHaveLength(1);
    });

    it("handles empty recent activity", async () => {
      const mockStats = [0, 0, 0, []];

      (prisma.$transaction as jest.Mock).mockResolvedValue(mockStats);

      const result = await adminService.getDashboardStats();

      expect(result.counts.pendingBlogs).toBe(0);
      expect(result.recentActivity).toEqual([]);
    });
  });

  describe("listUsers", () => {
    it("lists all users without filter", async () => {
      const mockUsers = [
        {
          id: "user_1",
          email: "user1@test.com",
          name: "User One",
          status: "ACTIVE",
          createdAt: new Date(),
          avatarImage: null,
          roles: [{ role: { name: "USER" } }],
        },
        {
          id: "user_2",
          email: "user2@test.com",
          name: "User Two",
          status: "SUSPENDED",
          createdAt: new Date(),
          avatarImage: null,
          roles: [{ role: { name: "ADMIN" } }],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await adminService.listUsers();

      expect(prisma.user.findMany as jest.Mock).toHaveBeenCalledWith({
        where: {},
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
        }),
      });

      expect(result).toHaveLength(2);
      expect(result[0].roles).toEqual(["USER"]);
      expect(result[1].roles).toEqual(["ADMIN"]);
    });

    it("filters users by role", async () => {
      const mockUsers = [
        {
          id: "admin_1",
          email: "admin@test.com",
          name: "Admin User",
          status: "ACTIVE",
          createdAt: new Date(),
          avatarImage: null,
          roles: [{ role: { name: "ADMIN" } }],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      await adminService.listUsers("ADMIN");

      expect(prisma.user.findMany as jest.Mock).toHaveBeenCalledWith({
        where: {
          roles: {
            some: {
              role: {
                name: "ADMIN",
              },
            },
          },
        },
        select: expect.any(Object),
      });
    });

    it("returns empty array when no users found", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await adminService.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe("updateUserStatus", () => {
    it("updates user status to SUSPENDED", async () => {
      const userId = "user_123";
      const actorId = "admin_456";
      const status = "SUSPENDED";
      const reason = "Violation of terms";

      const mockUser = {
        id: userId,
        email: "user@test.com",
        status: "SUSPENDED",
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await adminService.updateUserStatus(userId, status, actorId, reason);

      expect(prisma.user.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          status,
          statusReason: reason,
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      expect(prisma.auditLog.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          actorId,
          action: "USER_STATUS_UPDATED",
          targetType: "USER",
          targetId: userId,
          metadata: { status, reason },
        },
      });

      expect(result.status).toBe("SUSPENDED");
    });

    it("throws error for invalid status", async () => {
      const userId = "user_123";
      const actorId = "admin_456";
      const invalidStatus = "INVALID";

      await expect(adminService.updateUserStatus(userId, invalidStatus, actorId)).rejects.toThrow(
        "Invalid status",
      );
    });

    it("updates user status without reason", async () => {
      const userId = "user_123";
      const actorId = "admin_456";

      const mockUser = {
        id: userId,
        email: "user@test.com",
        status: "ACTIVE",
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      await adminService.updateUserStatus(userId, "ACTIVE", actorId);

      expect(prisma.user.update as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "ACTIVE",
            statusReason: undefined,
          }),
        }),
      );
    });
  });

  describe("deleteUser", () => {
    it("soft deletes a user", async () => {
      const userId = "user_123";
      const actorId = "admin_456";

      const mockUser = {
        id: userId,
        status: "BANNED",
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await adminService.deleteUser(userId, actorId);

      expect(prisma.user.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: "BANNED", statusReason: "DELETED_BY_ADMIN" },
      });

      expect(prisma.auditLog.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          actorId,
          action: "USER_DELETED",
          targetType: "USER",
          targetId: userId,
          metadata: expect.objectContaining({
            deletedAt: expect.any(String),
          }),
        },
      });

      expect(result.message).toBe("User deleted successfully");
      expect(result.userId).toBe(userId);
    });

    it("creates audit log on deletion", async () => {
      const userId = "user_789";
      const actorId = "admin_123";

      (prisma.user.update as jest.Mock).mockResolvedValue({ id: userId });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      await adminService.deleteUser(userId, actorId);

      expect(prisma.auditLog.create as jest.Mock).toHaveBeenCalled();
    });
  });

  describe("unsuspendUser", () => {
    it("unsuspends a user and sets status to ACTIVE", async () => {
      const userId = "user_123";
      const actorId = "admin_456";

      const mockUser = {
        id: userId,
        email: "user@test.com",
        status: "ACTIVE",
        statusReason: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await adminService.unsuspendUser(userId, actorId);

      expect(prisma.user.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: "ACTIVE", statusReason: null },
      });

      expect(prisma.auditLog.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          actorId,
          action: "USER_UNSUSPENDED",
          targetType: "USER",
          targetId: userId,
          metadata: {},
        },
      });

      expect(result.status).toBe("ACTIVE");
    });

    it("clears status reason on unsuspend", async () => {
      const userId = "user_123";
      const actorId = "admin_456";

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        statusReason: null,
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await adminService.unsuspendUser(userId, actorId);

      expect(result.statusReason).toBeNull();
    });
  });

  describe("getModerationSummary", () => {
    it("returns moderation summary with counts", async () => {
      (prisma.trip.count as jest.Mock).mockResolvedValue(3);
      (prisma.blog.count as jest.Mock).mockResolvedValue(7);

      const result = await adminService.getModerationSummary();

      expect(prisma.trip.count as jest.Mock).toHaveBeenCalledWith({
        where: { status: "PENDING_REVIEW" },
      });
      expect(prisma.blog.count as jest.Mock).toHaveBeenCalledWith({
        where: { status: "PENDING_REVIEW" },
      });

      expect(result.pendingTrips).toBe(3);
      expect(result.pendingBlogs).toBe(7);
      expect(result.totalPending).toBe(10);
    });

    it("handles zero pending items", async () => {
      (prisma.trip.count as jest.Mock).mockResolvedValue(0);
      (prisma.blog.count as jest.Mock).mockResolvedValue(0);

      const result = await adminService.getModerationSummary();

      expect(result.totalPending).toBe(0);
    });
  });

  describe("getUserById", () => {
    it("retrieves user details with roles and activity counts", async () => {
      const userId = "user_123";

      const mockUser = {
        id: userId,
        email: "user@test.com",
        name: "Test User",
        status: "ACTIVE",
        statusReason: null,
        createdAt: new Date(),
        avatarImage: null,
        roles: [{ role: { name: "USER" } }, { role: { name: "CONTENT_CREATOR" } }],
        _count: {
          bookings: 5,
          blogs: 3,
          reviews: 10,
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.getUserById(userId);

      expect(prisma.user.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.objectContaining({
          id: true,
          email: true,
          _count: {
            select: {
              bookings: true,
              blogs: true,
              reviews: true,
            },
          },
        }),
      });

      expect(result.id).toBe(userId);
      expect(result.roles).toEqual(["USER", "CONTENT_CREATOR"]);
      expect(result.activityCount.bookings).toBe(5);
      expect(result.activityCount.blogs).toBe(3);
      expect(result.activityCount.reviews).toBe(10);
    });

    it("throws error when user not found", async () => {
      const userId = "non_existent";

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(adminService.getUserById(userId)).rejects.toThrow("User not found");
    });

    it("includes status reason if present", async () => {
      const userId = "user_123";

      const mockUser = {
        id: userId,
        email: "user@test.com",
        name: "Suspended User",
        status: "SUSPENDED",
        statusReason: "Policy violation",
        createdAt: new Date(),
        avatarImage: null,
        roles: [{ role: { name: "USER" } }],
        _count: {
          bookings: 0,
          blogs: 0,
          reviews: 0,
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.getUserById(userId);

      expect(result.statusReason).toBe("Policy violation");
    });
  });
});
