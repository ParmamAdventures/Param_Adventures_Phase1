import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("Admin RBAC Integration", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Setup Admin and User
    // Check for dependent models and delete safely
    try { await prisma.payment?.deleteMany(); } catch (e) {}
    try { await prisma.booking?.deleteMany(); } catch (e) {}
    // tripGalleryImage is cascade deleted by Trip
    try { await prisma.blog?.deleteMany(); } catch (e) {}
    try { await prisma.trip?.deleteMany(); } catch (e) {}
    try { await prisma.image?.deleteMany(); } catch (e) {}

    try { await prisma.rolePermission?.deleteMany(); } catch (e) {}
    try { await prisma.role.deleteMany(); } catch (e) {}
    try { await prisma.auditLog.deleteMany(); } catch (e) {}
    try { await prisma.userRole?.deleteMany(); } catch (e) {}
    try { await prisma.user.deleteMany(); } catch (e) {}

    // Create Admin Role & Perms
    const perm = await prisma.permission.create({
      data: { key: "users:read", description: "Read users" },
    });
    const adminRole = await prisma.role.create({
      data: { name: "admin" },
    });
    // Create RolePermission
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });

    const admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: "hash",
        name: "Admin",
      },
    });
    // Assign Role
    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });
    adminToken = signAccessToken(admin.id);

    // Create Normal User
    const user = await prisma.user.create({
      data: {
        email: "user@test.com",
        password: "hash",
        name: "User",
      },
    });
    userToken = signAccessToken(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should allow admin to list users", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should forbid normal user", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${userToken}`);
    
    expect(res.status).toBe(403);
  });

  it("should require authentication", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.status).toBe(401);
  });
});
