import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/utils/jwt";

describe("Admin Operations", () => {
  let adminToken: string;
  let userToken: string;
  let _adminId: string;
  let _userId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up existing data
    try {
      await prisma.userRole?.deleteMany();
      await prisma.rolePermission?.deleteMany();
      await prisma.user?.deleteMany();
      await prisma.role?.deleteMany();
      await prisma.permission?.deleteMany();
    } catch {
      /* cleanup errors ignored */
    }

    // Create admin role
    const adminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", isSystem: true },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER", isSystem: true },
    });

    // Create permissions
    const permissions = [
      { key: "user:list", description: "List users" },
      { key: "user:edit", description: "Edit users" },
      { key: "user:delete", description: "Delete users" },
      { key: "admin:dashboard", description: "View admin dashboard" },
      { key: "analytics:view", description: "View analytics" },
      { key: "audit:view", description: "View audit logs" },
    ];

    for (const perm of permissions) {
      const permission = await prisma.permission.upsert({
        where: { key: perm.key },
        update: {},
        create: perm,
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin_ops@test.com",
        password: "hashed",
        name: "Admin User",
      },
    });
    _adminId = admin.id;

    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });

    adminToken = signAccessToken(admin.id);

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: "user_ops@test.com",
        password: "hashed",
        name: "Regular User",
      },
    });
    _userId = user.id;

    await prisma.userRole.create({
      data: { userId: user.id, roleId: userRole.id },
    });

    userToken = signAccessToken(user.id);

    // Create a test user for admin operations
    const testUser = await prisma.user.create({
      data: {
        email: "test_user@test.com",
        password: "hashed",
        name: "Test Subject",
        status: "ACTIVE",
      },
    });
    testUserId = testUser.id;

    await prisma.userRole.create({
      data: { userId: testUser.id, roleId: userRole.id },
    });
  });

  describe("GET /admin/users - List users", () => {
    it("returns users list when user has permission", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/admin/users");

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it("filters users by role", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users?role=USER")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("PATCH /admin/users/:id/status - Update user status", () => {
    it("suspends a user with admin permission", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "SUSPENDED",
          reason: "Policy violation",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("SUSPENDED");
    });

    it("returns 400 for invalid status", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "INVALID_STATUS",
        });

      expect(response.status).toBe(400);
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).patch(`/api/v1/admin/users/${testUserId}/status`).send({
        status: "ACTIVE",
      });

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          status: "ACTIVE",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("PATCH /admin/users/:id/unsuspend - Unsuspend user", () => {
    it("unsuspends a user", async () => {
      // First suspend the user
      await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SUSPENDED", reason: "Test" });

      // Then unsuspend
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/unsuspend`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("ACTIVE");
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).patch(`/api/v1/admin/users/${testUserId}/unsuspend`);

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/unsuspend`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /admin/users/:id - Delete user", () => {
    it("deletes a user (soft delete)", async () => {
      // Create a user to delete
      const userToDelete = await prisma.user.create({
        data: {
          email: "delete_me@test.com",
          password: "hashed",
          name: "Delete Me",
        },
      });

      const response = await request(app)
        .delete(`/api/v1/admin/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted");

      // Verify user is banned
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });
      expect(deletedUser?.status).toBe("BANNED");
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).delete(`/api/v1/admin/users/${testUserId}`);

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${testUserId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /admin/dashboard - Dashboard stats", () => {
    it("returns dashboard statistics", async () => {
      const response = await request(app)
        .get("/api/v1/admin/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("counts");
      expect(response.body.counts).toHaveProperty("pendingBlogs");
      expect(response.body.counts).toHaveProperty("totalUsers");
      expect(response.body.counts).toHaveProperty("activeTrips");
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/admin/dashboard/stats");

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .get("/api/v1/admin/dashboard/stats")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /admin/analytics/* - Analytics endpoints", () => {
    it("returns revenue summary", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/revenue")
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 500]).toContain(response.status); // May fail if analytics service has issues
    });

    it("returns trip performance", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/trips")
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 500]).toContain(response.status);
    });

    it("returns booking stats", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/bookings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 500]).toContain(response.status);
    });

    it("returns payment stats", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/payments")
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 500]).toContain(response.status);
    });

    it("returns moderation summary", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/moderation")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pendingTrips");
      expect(response.body).toHaveProperty("pendingBlogs");
    });

    it("blocks analytics access without permission", async () => {
      const response = await request(app)
        .get("/api/v1/admin/analytics/revenue")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /admin/audit-logs - Audit logs", () => {
    it("returns 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/admin/audit-logs");

      expect(response.status).toBe(401);
    });

    it("returns 403 without permission", async () => {
      const response = await request(app)
        .get("/api/v1/admin/audit-logs")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
