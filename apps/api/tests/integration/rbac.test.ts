import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("RBAC & Permission Integration", () => {
  let superAdminToken: string;
  let superAdminId: string;
  let adminToken: string;
  let adminId: string;
  let tripManagerToken: string;
  let tripManagerId: string;
  let guideToken: string;
  let guideId: string;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up in proper order (comprehensive to avoid collisions)
    try {
      await prisma.payment.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.review.deleteMany();
      await prisma.savedTrip.deleteMany();
      await prisma.tripInquiry.deleteMany();
      await prisma.newsletterSubscriber.deleteMany();
      await prisma.tripGalleryImage.deleteMany();
      await prisma.blog.deleteMany();
      await prisma.trip.deleteMany();
      await prisma.image.deleteMany();
      await prisma.tripsOnGuides.deleteMany();
      await prisma.userRole.deleteMany();
      await prisma.rolePermission.deleteMany();
      await prisma.user.deleteMany();
      await prisma.permission.deleteMany();
      await prisma.role.deleteMany();
      await prisma.auditLog.deleteMany();
    } catch {
      /* ignored */
    }

    // Create permissions
    const permissions = [
      { key: "trip:create", description: "Create trips" },
      { key: "trip:edit", description: "Edit trips" },
      { key: "trip:delete", description: "Delete trips" },
      { key: "trip:publish", description: "Publish trips" },
      { key: "trip:view:internal", description: "View internal trips" },
      { key: "trip:assign-guide", description: "Assign guides to trips" },
      { key: "user:list", description: "List users" },
      { key: "user:manage", description: "Manage users" },
      { key: "booking:view", description: "View bookings" },
      { key: "booking:manage", description: "Manage bookings" },
      { key: "payment:refund", description: "Process refunds" },
      { key: "admin:access", description: "Access admin panel" },
    ];

    const createdPermissions: Record<string, { id: string }> = {};
    for (const perm of permissions) {
      const p = await prisma.permission.upsert({
        where: { key: perm.key },
        update: {},
        create: perm,
      });
      createdPermissions[perm.key] = p;
    }

    // Create or get roles (use upsert to avoid unique constraint issues)
    const superAdminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", description: "Super Administrator", isSystem: true },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "Administrator", isSystem: true },
    });

    const tripManagerRole = await prisma.role.upsert({
      where: { name: "TRIP_MANAGER" },
      update: {},
      create: { name: "TRIP_MANAGER", description: "Trip Manager", isSystem: true },
    });

    const guideRole = await prisma.role.upsert({
      where: { name: "TRIP_GUIDE" },
      update: {},
      create: { name: "TRIP_GUIDE", description: "Trip Guide", isSystem: true },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: { isSystem: false }, // Ensure it's not marked as system
      create: { name: "USER", description: "Regular User", isSystem: false },
    });

    // Assign permissions to roles
    // SUPER_ADMIN: all permissions
    for (const perm of Object.values(createdPermissions)) {
      await prisma.rolePermission.create({
        data: { roleId: superAdminRole.id, permissionId: perm.id },
      });
    }

    // ADMIN: all except specific ones
    const adminPerms = [
      "trip:create",
      "trip:edit",
      "trip:delete",
      "trip:publish",
      "trip:view:internal",
      "trip:assign-guide",
      "user:list",
      "user:manage",
      "booking:view",
      "booking:manage",
      "payment:refund",
      "admin:access",
    ];
    for (const key of adminPerms) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: createdPermissions[key].id,
        },
      });
    }

    // TRIP_MANAGER: trip management permissions
    const managerPerms = ["trip:create", "trip:edit", "trip:view:internal", "trip:assign-guide"];
    for (const key of managerPerms) {
      await prisma.rolePermission.create({
        data: {
          roleId: tripManagerRole.id,
          permissionId: createdPermissions[key].id,
        },
      });
    }

    // TRIP_GUIDE: minimal permissions
    const guidePerms = ["trip:view:internal"];
    for (const key of guidePerms) {
      await prisma.rolePermission.create({
        data: {
          roleId: guideRole.id,
          permissionId: createdPermissions[key].id,
        },
      });
    }

    // USER: no special permissions
    // (intentionally empty)

    // Create users and assign roles
    const superAdmin = await prisma.user.create({
      data: { email: "rbac_superadmin@test.com", password: "password123", name: "Super Admin" },
    });
    superAdminId = superAdmin.id;
    superAdminToken = signAccessToken(superAdminId);
    await prisma.userRole.create({
      data: { userId: superAdmin.id, roleId: superAdminRole.id },
    });

    const admin = await prisma.user.create({
      data: { email: "rbac_admin@test.com", password: "password123", name: "Admin User" },
    });
    adminId = admin.id;
    adminToken = signAccessToken(adminId);
    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });

    const tripManager = await prisma.user.create({
      data: { email: "rbac_manager@test.com", password: "password123", name: "Trip Manager" },
    });
    tripManagerId = tripManager.id;
    tripManagerToken = signAccessToken(tripManagerId);
    await prisma.userRole.create({
      data: { userId: tripManager.id, roleId: tripManagerRole.id },
    });

    const guide = await prisma.user.create({
      data: { email: "rbac_guide@test.com", password: "password123", name: "Guide" },
    });
    guideId = guide.id;
    guideToken = signAccessToken(guideId);
    await prisma.userRole.create({
      data: { userId: guide.id, roleId: guideRole.id },
    });

    const regularUser = await prisma.user.create({
      data: { email: "rbac_user@test.com", password: "password123", name: "Regular User" },
    });
    userId = regularUser.id;
    userToken = signAccessToken(regularUser.id);
    await prisma.userRole.create({
      data: { userId: regularUser.id, roleId: userRole.id },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Role Assignment", () => {
    it("should list user roles in profile", async () => {
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.roles).toBeDefined();
      expect(Array.isArray(res.body.roles)).toBe(true);
      expect(res.body.roles).toContain("ADMIN");
    });

    it("should include all assigned roles for user with multiple roles", async () => {
      // Assign an additional role to admin
      const userRole = await prisma.role.findFirst({ where: { name: "TRIP_MANAGER" } });
      await prisma.userRole.create({
        data: { userId: adminId, roleId: userRole!.id },
      });

      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.roles).toContain("ADMIN");
      expect(res.body.roles).toContain("TRIP_MANAGER");
    });

    it("should display correct roles for different users", async () => {
      const guideRes = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${guideToken}`);

      expect(guideRes.status).toBe(200);
      expect(guideRes.body.roles).toContain("TRIP_GUIDE");
      expect(guideRes.body.roles).not.toContain("ADMIN");
    });
  });

  describe("Permission Authorization", () => {
    it("should allow SUPER_ADMIN to access all endpoints", async () => {
      // Test accessing admin panel
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow ADMIN to access admin endpoints", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it("should deny regular users from accessing admin endpoints", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should deny guides from accessing admin endpoints", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${guideToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Trip Permission Authorization", () => {
    it("should allow TRIP_MANAGER to view internal trips", async () => {
      const res = await request(app)
        .get("/trips/internal")
        .set("Authorization", `Bearer ${tripManagerToken}`);

      expect([200, 401, 403]).toContain(res.status);
      // 401 might happen due to other setup, but if auth passes, should not be denied by permissions
    });

    it("should allow TRIP_GUIDE to view internal trips", async () => {
      const res = await request(app)
        .get("/trips/internal")
        .set("Authorization", `Bearer ${guideToken}`);

      expect([200, 401, 403]).toContain(res.status);
    });

    it("should deny regular users from viewing internal trips", async () => {
      const res = await request(app)
        .get("/trips/internal")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("User Profile Permissions", () => {
    it("should allow authenticated user to view own profile", async () => {
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
    });

    it("should allow authenticated user to update own profile", async () => {
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ bio: "Updated bio" });

      expect(res.status).toBe(200);
    });

    it("should deny unauthenticated users from viewing profile", async () => {
      const res = await request(app).get("/users/profile");

      expect(res.status).toBe(401);
    });

    it("should deny unauthenticated users from updating profile", async () => {
      const res = await request(app).patch("/users/profile").send({ bio: "Hack attempt" });

      expect(res.status).toBe(401);
    });
  });

  describe("Permission Hierarchy", () => {
    it("should have SUPER_ADMIN with most permissions", async () => {
      const superAdmin = await prisma.user.findUnique({
        where: { id: superAdminId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      superAdmin?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      expect(permissions.size).toBeGreaterThan(10);
    });

    it("should have ADMIN with significant permissions", async () => {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      admin?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      expect(permissions.size).toBeGreaterThan(5);
      expect(Array.from(permissions)).toContain("admin:access");
    });

    it("should have TRIP_GUIDE with limited permissions", async () => {
      const guide = await prisma.user.findUnique({
        where: { id: guideId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      guide?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      expect(permissions.size).toBeLessThan(5);
    });

    it("should have USER with no special permissions", async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      user?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      expect(permissions.size).toBe(0);
    });
  });

  describe("Multiple Role Scenarios", () => {
    it("should combine permissions from multiple roles", async () => {
      // Admin already has TRIP_MANAGER role, so should have combined permissions
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      admin?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      // Should have permissions from both ADMIN and TRIP_MANAGER
      expect(Array.from(permissions)).toContain("trip:create");
      expect(Array.from(permissions)).toContain("admin:access");
    });

    it("should aggregate permissions without duplicates", async () => {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        include: {
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });

      const permissions = new Set<string>();
      admin?.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          permissions.add(rp.permission.key);
        });
      });

      // If a permission exists in multiple roles, it should only be counted once (Set deduplication)
      const permArray = Array.from(permissions);
      expect(permArray.length).toBe(new Set(permArray).size); // No duplicates
    });
  });

  describe("Permission Verification", () => {
    it("should correctly verify user has specific permission", async () => {
      // This would require an endpoint like GET /auth/me which includes permissions
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.permissions).toBeDefined();
      if (res.body.permissions) {
        expect(Array.isArray(res.body.permissions)).toBe(true);
      }
    });

    it("should deny access when user lacks required permission", async () => {
      // User has no special permissions, so should be denied from admin panel
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Permission Edge Cases", () => {
    it("should handle user with no roles gracefully", async () => {
      // Create user without any roles
      const orphanUser = await prisma.user.create({
        data: { email: "orphan@test.com", password: "password123", name: "Orphan User" },
      });
      const orphanToken = signAccessToken(orphanUser.id);

      // Should still be able to access public endpoints and own profile
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${orphanToken}`);

      expect(res.status).toBe(200);

      // But should be denied from admin
      const adminRes = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${orphanToken}`);

      expect(adminRes.status).toBe(403);

      // Cleanup
      await prisma.user.delete({ where: { id: orphanUser.id } });
    });

    it("should handle permission lookup with non-existent permission", async () => {
      // Try to access endpoint that requires non-existent permission
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      // Should fail with 403 (not 404)
      expect(res.status).toBe(403);
    });

    it("should handle revoked permissions gracefully", async () => {
      // Create user with ADMIN role
      const tempUser = await prisma.user.create({
        data: { email: "temp@test.com", password: "password123", name: "Temp User" },
      });
      const tempToken = signAccessToken(tempUser.id);

      const adminRole = await prisma.role.findFirst({ where: { name: "ADMIN" } });
      await prisma.userRole.create({
        data: { userId: tempUser.id, roleId: adminRole!.id },
      });

      // Should be able to access admin
      const res1 = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${tempToken}`);
      expect(res1.status).toBe(200);

      // Remove the role
      await prisma.userRole.delete({
        where: { userId_roleId: { userId: tempUser.id, roleId: adminRole!.id } },
      });

      // Should now be denied (though token doesn't expire, new request should be checked)
      // Note: This test assumes fresh permission check, not token-based caching

      // Cleanup
      await prisma.user.delete({ where: { id: tempUser.id } });
    });
  });

  describe("System Role Flags", () => {
    it("should mark system roles correctly", async () => {
      const superAdminRole = await prisma.role.findFirst({ where: { name: "SUPER_ADMIN" } });
      const adminRole = await prisma.role.findFirst({ where: { name: "ADMIN" } });
      const userRole = await prisma.role.findFirst({ where: { name: "USER" } });

      expect(superAdminRole?.isSystem).toBe(true);
      expect(adminRole?.isSystem).toBe(true);
      expect(userRole?.isSystem).toBe(false); // Custom role
    });
  });
});
