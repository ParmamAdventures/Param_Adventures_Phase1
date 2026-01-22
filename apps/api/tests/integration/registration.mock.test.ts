import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "../../src/generated/client";

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import request from "supertest";
import { app } from "../../src/app";
import { prismaMock } from "../helpers/prisma.mock";

describe("User Registration Flow (Mocked)", () => {
  it("should register a new user successfully", async () => {
    const userData = {
      id: "user-123",
      email: "newuser@example.com",
      name: "New User",
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock finding existing user (null means not found, OK to register)
    prismaMock.user.findUnique.mockResolvedValue(null);

    // Mock user creation
    prismaMock.user.create.mockResolvedValue(userData as any);

    // Mock audit log creation
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-123" } as any);

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "newuser@example.com",
      password: "Password123!",
      name: "New User",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toHaveProperty("id", "user-123");
    expect(res.body.data.user.email).toBe("newuser@example.com");
  });

  it("should fail if email is already registered", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing-123" } as any);

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "existing@example.com",
      password: "Password123!",
      name: "Existing User",
    });

    expect(res.status).toBe(409);
  });
});
