import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("User Profile Integration", () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up
    try {
      await prisma.user.deleteMany();
    } catch (_e) { /* ignored */ }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: "profile@test.com",
        password: "password123",
        name: "Profile User",
      },
    });
    userId = user.id;
    userToken = signAccessToken(userId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should update user profile (preferences and bio)", async () => {
    const res = await request(app)
      .patch("/users/profile")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        nickname: "Pro",
        bio: "Adventure enthusiast",
        preferences: { theme: "dark", notifications: true },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.nickname).toBe("Pro");
    expect(res.body.data.user.bio).toBe("Adventure enthusiast");
    expect(res.body.data.user.preferences).toEqual({ theme: "dark", notifications: true });

    // Verify DB
    const updated = await prisma.user.findUnique({ where: { id: userId } });
    expect(updated?.nickname).toBe("Pro");
    expect(updated?.preferences).toEqual({ theme: "dark", notifications: true });
  });

  it("should return 401 if unauthorized", async () => {
    const res = await request(app).patch("/users/profile").send({
      nickname: "Hacker",
    });

    expect(res.status).toBe(401);
  });
});
