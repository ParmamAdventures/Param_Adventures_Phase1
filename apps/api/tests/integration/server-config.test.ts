import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";
import { signAccessToken } from "../../src/utils/jwt";

describe("Admin Server Configuration API", () => {
  const prisma = new PrismaClient();
  let adminToken: string;

  beforeAll(async () => {
    // Clean relevant tables (order matters due to foreign keys)
    await prisma.auditLog.deleteMany();
    await prisma.serverConfiguration.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();

    // Create permission + role + user
    const adminPermission = await prisma.permission.create({
      data: { key: "admin:settings", description: "Manage server settings" },
    });

    const superAdminRole = await prisma.role.create({
      data: { name: "SUPER_ADMIN", description: "Super administrator" },
    });

    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: adminPermission.id },
    });

    const admin = await prisma.user.create({
      data: {
        email: "super.admin+test@paramadventures.com",
        password: "hashed-password",
        name: "Super Admin",
      },
    });

    await prisma.userRole.create({ data: { userId: admin.id, roleId: superAdminRole.id } });

    adminToken = signAccessToken(admin.id);

    // Seed configs (one editable, one env-locked)
    await prisma.serverConfiguration.createMany({
      data: [
        {
          category: "smtp",
          key: "smtp_host",
          value: "smtp.initial.test",
          description: "SMTP host",
          dataType: "string",
          isEncrypted: false,
          isEnvironmentVar: false,
          updatedBy: admin.id,
        },
        {
          category: "smtp",
          key: "smtp_port",
          value: "587",
          description: "SMTP port",
          dataType: "number",
          isEncrypted: false,
          isEnvironmentVar: true,
          updatedBy: admin.id,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns grouped configs for an authorized admin", async () => {
    const res = await request(app)
      .get("/api/v1/admin/server-config")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.smtp).toBeDefined();
    const smtpHost = res.body.data.smtp.find((c: { key: string }) => c.key === "smtp_host");
    expect(smtpHost.isEnvironmentVar).toBe(false);
  });

  it("updates a non-env config and persists the value", async () => {
    const newHost = "smtp.gmail.com";

    const res = await request(app)
      .put("/api/v1/admin/server-config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: "smtp",
        key: "smtp_host",
        value: newHost,
        dataType: "string",
        isEncrypted: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.value).toBe(newHost);

    const dbConfig = await prisma.serverConfiguration.findUnique({
      where: { category_key: { category: "smtp", key: "smtp_host" } },
    });

    expect(dbConfig?.value).toBe(newHost);
    expect(dbConfig?.isEnvironmentVar).toBe(false);
  });

  it("rejects updates to environment-controlled configs", async () => {
    const res = await request(app)
      .put("/api/v1/admin/server-config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: "smtp",
        key: "smtp_port",
        value: "465",
        dataType: "number",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe("FORBIDDEN");
  });
});
