import request from "supertest";
import { app } from "../../src/app";
import { prismaMock } from "../helpers/prisma.mock";
import { generateAuthToken } from "./auth_helper";

describe("Trip Creation Flow (Mocked)", () => {
  const userId = "admin-123";
  const token = generateAuthToken(userId);

  it("should create a new trip successfully", async () => {
    const tripData = {
      title: "Adventure Trip",
      slug: "adventure-trip",
      description: "Exciting adventure",
      price: 1000,
    };

    const createdTrip = {
      id: "trip-123",
      ...tripData,
      status: "DRAFT",
      createdById: userId,
      createdAt: new Date(),
    };

    // Mock permission check (dbUser lookup)
    prismaMock.user.findUnique.mockResolvedValue({
      id: userId,
      status: "ACTIVE",
      roles: [
        {
          role: {
            name: "ADMIN",
            permissions: [
              {
                permission: {
                  key: "trip:create",
                },
              },
            ],
          },
        },
      ],
    } as any);

    // Mock trip creation
    prismaMock.trip.create.mockResolvedValue(createdTrip as any);

    // Mock audit log
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-123" } as any);

    const res = await request(app)
      .post("/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(tripData);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id", "trip-123");
    expect(res.body.data.title).toBe("Adventure Trip");
  });

  it("should fail without permission", async () => {
    // Mock user without required permission
    prismaMock.user.findUnique.mockResolvedValue({
      id: userId,
      status: "ACTIVE",
      roles: [],
    } as any);

    const res = await request(app)
      .post("/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "No Permission Trip" });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain("permission");
  });
});
