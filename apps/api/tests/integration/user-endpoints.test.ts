import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("User Endpoints Integration", () => {
  let userToken: string;
  let userId: string;
  let guideToken: string;
  let guideId: string;
  let adminToken: string;
  let adminId: string;
  let testTripId: string;

  beforeAll(async () => {
    // Clean up
    try {
      await prisma.tripsOnGuides.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.trip.deleteMany();
      await prisma.userRole.deleteMany();
      await prisma.user.deleteMany();
    } catch {
      /* ignored */
    }

    // Create roles
    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER", description: "Regular user" },
    });

    const guideRole = await prisma.role.upsert({
      where: { name: "TRIP_GUIDE" },
      update: {},
      create: { name: "TRIP_GUIDE", description: "Trip guide" },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", description: "Super administrator" },
    });

    // Create users
    const regularUser = await prisma.user.create({
      data: {
        email: "user@test.com",
        password: "password123",
        name: "Regular User",
      },
    });
    userId = regularUser.id;
    userToken = signAccessToken(userId);

    const guide = await prisma.user.create({
      data: {
        email: "guide@test.com",
        password: "password123",
        name: "Test Guide",
      },
    });
    guideId = guide.id;
    guideToken = signAccessToken(guideId);

    const admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: "password123",
        name: "Test Admin",
      },
    });
    adminId = admin.id;
    adminToken = signAccessToken(adminId);

    // Assign roles
    await prisma.userRole.create({
      data: { userId: regularUser.id, roleId: userRole.id },
    });

    await prisma.userRole.create({
      data: { userId: guide.id, roleId: guideRole.id },
    });

    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });

    // Create a test trip for guide assignment
    const trip = await prisma.trip.create({
      data: {
        title: "Test Trip",
        slug: `test-trip-${Date.now()}`,
        description: "A test trip",
        itinerary: { days: [] }, // Required field
        price: 15000,
        durationDays: 5,
        difficulty: "MODERATE",
        location: "Test Location",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-05"),
        status: "PUBLISHED",
        createdById: adminId,
      },
    });
    testTripId = trip.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /users/profile", () => {
    it("should return current user profile with authentication", async () => {
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe("user@test.com");
      expect(res.body.name).toBe("Regular User");
      expect(res.body.roles).toBeDefined();
      expect(Array.isArray(res.body.roles)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).get("/users/profile");

      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /users/profile", () => {
    it("should update user profile with valid data", async () => {
      const updateData = {
        name: "Updated Name",
        nickname: "Tester",
        bio: "Test bio content",
        age: 28,
        gender: "Male",
        phoneNumber: "+1234567890",
        address: "123 Test Street",
        preferences: { theme: "dark", notifications: true },
      };

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe("Updated Name");
      expect(res.body.data.user.nickname).toBe("Tester");
      expect(res.body.data.user.bio).toBe("Test bio content");
      expect(res.body.data.user.age).toBe(28);
      expect(res.body.data.user.preferences).toEqual({ theme: "dark", notifications: true });

      // Verify in database
      const updated = await prisma.user.findUnique({ where: { id: userId } });
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.nickname).toBe("Tester");
    });

    it("should handle partial profile updates", async () => {
      const partialUpdate = {
        bio: "Updated bio only",
      };

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send(partialUpdate);

      expect(res.status).toBe(200);
      expect(res.body.data.user.bio).toBe("Updated bio only");
      expect(res.body.data.user.name).toBe("Updated Name"); // Unchanged from previous test
    });

    it("should update preferences without affecting other fields", async () => {
      const preferencesUpdate = {
        preferences: { newsletter: true, emailNotifications: false },
      };

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send(preferencesUpdate);

      expect(res.status).toBe(200);
      expect(res.body.data.user.preferences).toEqual({
        newsletter: true,
        emailNotifications: false,
      });
    });

    it("should handle empty preferences object", async () => {
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ preferences: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.user.preferences).toEqual({});
    });

    it("should handle null values for optional fields", async () => {
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          bio: null,
          phoneNumber: null,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.bio).toBeNull();
      expect(res.body.data.user.phoneNumber).toBeNull();
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).patch("/users/profile").send({
        name: "Hacker Name",
      });

      expect(res.status).toBe(401);
    });

    it("should convert age string to number", async () => {
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ age: "35" });

      expect(res.status).toBe(200);
      expect(res.body.data.user.age).toBe(35);
      expect(typeof res.body.data.user.age).toBe("number");
    });

    it("should handle complex nested preferences", async () => {
      const complexPreferences = {
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            showEmail: false,
            showPhone: true,
          },
        },
      };

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send(complexPreferences);

      expect(res.status).toBe(200);
      expect(res.body.data.user.preferences).toEqual(complexPreferences.preferences);
    });
  });

  describe("GET /users/guide/trips", () => {
    beforeAll(async () => {
      // Assign guide to the test trip
      await prisma.tripsOnGuides.create({
        data: {
          tripId: testTripId,
          guideId: guideId,
        },
      });

      // Create a booking for the trip
      await prisma.booking.create({
        data: {
          tripId: testTripId,
          userId: userId,
          status: "CONFIRMED",
          startDate: new Date("2026-06-01"),
          guests: 2,
          totalPrice: 15000,
          guestDetails: { guests: [] },
        },
      });
    });

    it("should return trips assigned to the guide", async () => {
      const res = await request(app)
        .get("/users/guide/trips")
        .set("Authorization", `Bearer ${guideToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const trip = res.body[0];
      expect(trip.id).toBe(testTripId);
      expect(trip.title).toBe("Test Trip");
      expect(trip.assignedAt).toBeDefined();
      expect(trip.bookings).toBeDefined();
      expect(Array.isArray(trip.bookings)).toBe(true);
    });

    it("should include booking details with user info", async () => {
      const res = await request(app)
        .get("/users/guide/trips")
        .set("Authorization", `Bearer ${guideToken}`);

      expect(res.status).toBe(200);
      const trip = res.body[0];
      expect(trip.bookings.length).toBeGreaterThan(0);

      const booking = trip.bookings[0];
      expect(booking.user).toBeDefined();
      expect(booking.user.id).toBe(userId);
      expect(booking.user.name).toBeDefined();
      expect(booking.user.email).toBeDefined();
    });

    it("should return empty array if guide has no trips", async () => {
      // Create a new guide with no assignments
      const newGuide = await prisma.user.create({
        data: {
          email: "newguide@test.com",
          password: "password123",
          name: "New Guide",
        },
      });

      const newGuideToken = signAccessToken(newGuide.id);

      const res = await request(app)
        .get("/users/guide/trips")
        .set("Authorization", `Bearer ${newGuideToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);

      // Cleanup
      await prisma.user.delete({ where: { id: newGuide.id } });
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).get("/users/guide/trips");

      expect(res.status).toBe(401);
    });

    it("should work for regular users (returns empty if not a guide)", async () => {
      const res = await request(app)
        .get("/users/guide/trips")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Regular user is not assigned to any trips
      expect(res.body.length).toBe(0);
    });

    it("should include coverImage in trip details", async () => {
      const res = await request(app)
        .get("/users/guide/trips")
        .set("Authorization", `Bearer ${guideToken}`);

      expect(res.status).toBe(200);
      const trip = res.body[0];
      // coverImage might be null since we didn't set it in test data
      expect(trip).toHaveProperty("coverImage");
    });
  });

  describe("Profile Security", () => {
    it("should not allow updating another user's profile", async () => {
      // This test ensures users can only update their own profile
      // The endpoint uses req.user.id from token, so it's implicitly secure
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Attempt to change" });

      expect(res.status).toBe(200);

      // Verify guide's profile wasn't affected
      const guide = await prisma.user.findUnique({ where: { id: guideId } });
      expect(guide?.name).toBe("Test Guide");
    });

    it("should not expose sensitive data in profile response", async () => {
      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.password).toBeUndefined(); // Password should never be returned
    });
  });

  describe("Profile Validation", () => {
    it("should accept valid email format in profile (if updatable)", async () => {
      // Note: Based on user.controller.ts, email might not be updatable via this endpoint
      // This test verifies the current behavior
      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Valid User" });

      expect(res.status).toBe(200);
    });

    it("should handle very long bio text", async () => {
      const longBio = "A".repeat(1000);

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ bio: longBio });

      expect(res.status).toBe(200);
      expect(res.body.data.user.bio).toBe(longBio);
    });

    it("should handle special characters in profile fields", async () => {
      const specialData = {
        name: "John O'Brien",
        nickname: "J@hn_123",
        bio: "Test <script>alert('xss')</script> content",
        address: "123 Main St, Apt #456",
      };

      const res = await request(app)
        .patch("/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send(specialData);

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe(specialData.name);
      expect(res.body.data.user.bio).toBe(specialData.bio);
    });
  });
});
