import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "../../src/generated/client";
import { writeFileSync } from "fs";
import { resetDb } from "../utils/test-db";

const prisma = new PrismaClient();

describe("Auth Integration", () => {
  beforeAll(async () => {
    // Clean up DB before tests - respecting FKs
    // Delete join tables first if they exist (assuming schema structure)
    // Or simpler: delete everything.
    // Safe order based on schema:
    // Dependent models first
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    });

    if (res.status !== 201) {
      writeFileSync("auth-debug.log", `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
    }

    expect(res.status).toBe(201);
    expect(res.body.data.user).toHaveProperty("id");
    expect(res.body.data.user.email).toBe("test@example.com");

    // Verify DB
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    expect(user).toBeTruthy();
  });

  it("should fail on duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
      name: "Test User 2",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Email already registered");
  });

  it("should fail on invalid email (Zod)", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "invalid-email",
      password: "Password123!",
      name: "Test User",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  describe("Session & Refresh", () => {
    const credentials = {
      email: "session@example.com",
      password: "Password123!",
      name: "Session User",
    };

    beforeAll(async () => {
      await request(app).post("/api/v1/auth/register").send(credentials);
    });

    it("should login successfully and return access token + user", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: credentials.email,
        password: credentials.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data.user.email).toBe(credentials.email);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: credentials.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain("Invalid credentials");
    });

    it("should get current user profile with valid token", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: credentials.email,
        password: credentials.password,
      });
      const token = loginRes.body.data.accessToken;

      const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(credentials.email);
    });

    it("should refresh access token using cookie", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: credentials.email,
        password: credentials.password,
      });
      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("accessToken");
    });
  });
});
