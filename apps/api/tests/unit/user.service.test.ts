import { userService } from "../../src/services/user.service";
import { prisma } from "../../src/lib/prisma";
import { auditService } from "../../src/services/audit.service";

jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../src/services/audit.service", () => ({
  auditService: {
    logAudit: jest.fn(),
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserWithPermissions", () => {
    it("should fetch user with roles and permissions", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: "Tester",
        bio: "Test bio",
        age: 25,
        gender: "MALE",
        phoneNumber: "+1234567890",
        address: "123 Test St",
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: { id: "img-123", mediumUrl: "https://example.com/avatar.jpg" },
        preferences: { theme: "dark" },
        roles: [
          {
            role: {
              id: "role-1",
              name: "USER",
              permissions: [
                { permission: { key: "booking:create" } },
                { permission: { key: "booking:view:own" } },
              ],
            },
          },
          {
            role: {
              id: "role-2",
              name: "TRIP_VIEWER",
              permissions: [{ permission: { key: "trip:view" } }],
            },
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserWithPermissions("user-123");

      expect(result).toEqual({
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: "Tester",
        bio: "Test bio",
        age: 25,
        gender: "MALE",
        phoneNumber: "+1234567890",
        address: "123 Test St",
        status: "ACTIVE",
        createdAt: mockUser.createdAt,
        avatarImage: { id: "img-123", mediumUrl: "https://example.com/avatar.jpg" },
        preferences: { theme: "dark" },
        roles: ["USER", "TRIP_VIEWER"],
        permissions: ["booking:create", "booking:view:own", "trip:view"],
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: expect.objectContaining({
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
          roles: expect.any(Object),
        }),
      });
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserWithPermissions("non-existent");

      expect(result).toBeNull();
    });

    it("should handle user with no roles", async () => {
      const mockUser = {
        id: "user-456",
        email: "noroles@test.com",
        name: "No Roles User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
        preferences: null,
        roles: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserWithPermissions("user-456");

      expect(result).toEqual({
        ...mockUser,
        roles: [],
        permissions: [],
      });
    });

    it("should deduplicate permissions from multiple roles", async () => {
      const mockUser = {
        id: "user-789",
        email: "multi@test.com",
        name: "Multi Role User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
        preferences: null,
        roles: [
          {
            role: {
              id: "role-1",
              name: "ADMIN",
              permissions: [
                { permission: { key: "trip:create" } },
                { permission: { key: "trip:edit" } },
              ],
            },
          },
          {
            role: {
              id: "role-2",
              name: "TRIP_MANAGER",
              permissions: [
                { permission: { key: "trip:edit" } }, // Duplicate
                { permission: { key: "trip:delete" } },
              ],
            },
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserWithPermissions("user-789");

      expect(result?.permissions).toHaveLength(3);
      expect(result?.permissions).toEqual(
        expect.arrayContaining(["trip:create", "trip:edit", "trip:delete"]),
      );
    });
  });

  describe("hasPermission", () => {
    it("should return true if user has the permission", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
        preferences: null,
        roles: [
          {
            role: {
              id: "role-1",
              name: "USER",
              permissions: [{ permission: { key: "booking:create" } }],
            },
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.hasPermission("user-123", "booking:create");

      expect(result).toBe(true);
    });

    it("should return false if user does not have the permission", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
        preferences: null,
        roles: [
          {
            role: {
              id: "role-1",
              name: "USER",
              permissions: [{ permission: { key: "booking:view:own" } }],
            },
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.hasPermission("user-123", "admin:access");

      expect(result).toBe(false);
    });

    it("should return false if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.hasPermission("non-existent", "any:permission");

      expect(result).toBe(false);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile with all fields", async () => {
      const updateData = {
        name: "Updated Name",
        nickname: "NewNick",
        bio: "Updated bio",
        age: 30,
        gender: "FEMALE",
        phoneNumber: "+9876543210",
        address: "456 New St",
        avatarImageId: "img-456",
        preferences: { theme: "light", notifications: true },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        ...updateData,
        age: 30,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: { id: "img-456", mediumUrl: "https://example.com/new-avatar.jpg" },
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateProfile("user-123", updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          name: "Updated Name",
          nickname: "NewNick",
          bio: "Updated bio",
          age: 30,
          gender: "FEMALE",
          phoneNumber: "+9876543210",
          address: "456 New St",
          avatarImageId: "img-456",
          preferences: { theme: "light", notifications: true },
        },
        include: {
          avatarImage: true,
        },
      });
    });

    it("should log audit trail after profile update", async () => {
      const updateData = {
        name: "Updated Name",
        nickname: "NewNick",
      };

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Updated Name",
        nickname: "NewNick",
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        avatarImageId: null,
        preferences: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      await userService.updateProfile("user-123", updateData);

      expect(auditService.logAudit).toHaveBeenCalledWith({
        actorId: "user-123",
        action: "USER_UPDATE_PROFILE",
        targetType: "User",
        targetId: "user-123",
      });
    });

    it("should handle partial profile updates", async () => {
      const updateData = {
        bio: "New bio only",
        preferences: { darkMode: true },
      };

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Existing Name",
        nickname: "ExistingNick",
        bio: "New bio only",
        age: 25,
        gender: "MALE",
        phoneNumber: "+1234567890",
        address: "123 Test St",
        avatarImageId: "img-123",
        preferences: { darkMode: true },
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: { id: "img-123", mediumUrl: "https://example.com/avatar.jpg" },
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateProfile("user-123", updateData);

      expect(result.bio).toBe("New bio only");
      expect(result.preferences).toEqual({ darkMode: true });
    });

    it("should convert age to number if provided", async () => {
      const updateData = {
        age: "35", // String age
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: 35,
        gender: null,
        phoneNumber: null,
        address: null,
        avatarImageId: null,
        preferences: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      await userService.updateProfile("user-123", updateData);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            age: 35, // Should be converted to number
          }),
        }),
      );
    });

    it("should set age to null if not provided", async () => {
      const updateData = {
        name: "Test User",
        age: undefined,
      };

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        avatarImageId: null,
        preferences: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      await userService.updateProfile("user-123", updateData);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            age: undefined, // Prisma handles undefined as "do not update"
          }),
        }),
      );
    });

    it("should handle avatar image update", async () => {
      const updateData = {
        avatarImageId: "new-img-789",
      };

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        avatarImageId: "new-img-789",
        preferences: null,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: { id: "new-img-789", mediumUrl: "https://example.com/new-avatar.jpg" },
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateProfile("user-123", updateData);

      expect(result.avatarImageId).toBe("new-img-789");
      expect(result.avatarImage).toEqual({
        id: "new-img-789",
        mediumUrl: "https://example.com/new-avatar.jpg",
      });
    });

    it("should propagate errors from database", async () => {
      const updateData = {
        name: "Test User",
      };

      (prisma.user.update as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(userService.updateProfile("user-123", updateData)).rejects.toThrow(
        "Database error",
      );

      expect(auditService.logAudit).not.toHaveBeenCalled();
    });

    it("should handle complex preferences object", async () => {
      const updateData = {
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          language: "en",
          timezone: "UTC",
        },
      };

      const mockUpdatedUser = {
        id: "user-123",
        email: "user@test.com",
        name: "Test User",
        nickname: null,
        bio: null,
        age: null,
        gender: null,
        phoneNumber: null,
        address: null,
        avatarImageId: null,
        preferences: updateData.preferences,
        status: "ACTIVE",
        createdAt: new Date(),
        avatarImage: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditService.logAudit as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateProfile("user-123", updateData);

      expect(result.preferences).toEqual(updateData.preferences);
    });
  });
});
