import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Auth Integration", () => {
  beforeAll(async () => {
    // Clean up DB before tests - respecting FKs
    // Delete join tables first if they exist (assuming schema structure)
    // Or simpler: delete everything.
    // Safe order based on schema:
    await prisma.auditLog.deleteMany();
    await prisma.userRole?.deleteMany();
    await prisma.rolePermission?.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    if (res.status !== 201) {
      require("fs").writeFileSync("auth-debug.log", `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
    }

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("test@example.com");

    // Verify DB
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    expect(user).toBeTruthy();
  });

  it("should fail on duplicate email", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User 2",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("should fail on invalid email (Zod)", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "invalid-email",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
