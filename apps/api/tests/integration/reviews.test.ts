import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/utils/jwt";

describe("Review Endpoints", () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let tripId: string;
  let reviewId: string;

  beforeAll(async () => {
    // Clean up existing data
    try {
      await prisma.review?.deleteMany();
      await prisma.booking?.deleteMany();
      await prisma.trip?.deleteMany();
      await prisma.rolePermission?.deleteMany();
      await prisma.userRole?.deleteMany();
      await prisma.user?.deleteMany();
      await prisma.role?.deleteMany();
      await prisma.permission?.deleteMany();
    } catch (e) {
      /* cleanup errors ignored */
    }

    // Create roles
    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", isSystem: true },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER", isSystem: true },
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin_reviews@test.com",
        password: "hashed",
        name: "Admin User",
      },
    });
    adminId = admin.id;

    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });

    adminToken = signAccessToken(admin.id);

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: "user_reviews@test.com",
        password: "hashed",
        name: "Regular User",
      },
    });
    userId = user.id;

    await prisma.userRole.create({
      data: { userId: user.id, roleId: userRole.id },
    });

    userToken = signAccessToken(user.id);

    // Create a trip
    const trip = await prisma.trip.create({
      data: {
        title: "Review Test Trek",
        slug: `review-trek-${Date.now()}`,
        description: "A test trek for reviews",
        category: "TREK",
        durationDays: 3,
        difficulty: "EASY",
        location: "Himalayas",
        price: 10000,
        capacity: 20,
        itinerary: {},
        createdById: adminId,
        status: "PUBLISHED",
        startDate: new Date(),
        endDate: new Date(),
      },
    });
    tripId = trip.id;

    // Create a completed booking for the regular user
    await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        status: "COMPLETED",
        startDate: new Date("2024-01-01"),
        guests: 2,
        totalPrice: 20000,
      },
    });
  });

  describe("POST /reviews - Create review", () => {
    it("creates a review with valid auth and completed trip", async () => {
      const reviewData = {
        tripId,
        rating: 5,
        comment: "Amazing trek! Highly recommended.",
      };

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe(reviewData.comment);
      expect(response.body.tripId).toBe(tripId);

      reviewId = response.body.id;
    });

    it("returns 401 when not authenticated", async () => {
      const reviewData = {
        tripId,
        rating: 5,
      };

      const response = await request(app).post("/api/v1/reviews").send(reviewData);

      expect(response.status).toBe(401);
    });

    it("returns 400 when rating is missing", async () => {
      const reviewData = {
        tripId,
      };

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(400);
    });

    it("returns 400 when rating is out of range", async () => {
      const reviewData = {
        tripId,
        rating: 6,
      };

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(400);
    });

    it("returns 403 when user has not completed the trip", async () => {
      // Create another trip without a completed booking
      const newTrip = await prisma.trip.create({
        data: {
          title: "Uncompleted Trek",
          slug: `uncompleted-trek-${Date.now()}`,
          description: "Not completed",
          category: "TREK",
          durationDays: 2,
          difficulty: "EASY",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const reviewData = {
        tripId: newTrip.id,
        rating: 5,
      };

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(403);
    });

    it("returns 409 when user has already reviewed the trip", async () => {
      const reviewData = {
        tripId,
        rating: 4,
        comment: "Second review attempt",
      };

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(409);
    });
  });

  describe("GET /reviews/:tripId - Get trip reviews", () => {
    it("returns reviews for a specific trip", async () => {
      const response = await request(app).get(`/api/v1/reviews/${tripId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("rating");
      expect(response.body[0]).toHaveProperty("user");
    });

    it("returns empty array for trip with no reviews", async () => {
      const newTrip = await prisma.trip.create({
        data: {
          title: "No Reviews Trek",
          slug: `no-reviews-${Date.now()}`,
          description: "No reviews yet",
          category: "TREK",
          durationDays: 2,
          difficulty: "EASY",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const response = await request(app).get(`/api/v1/reviews/${newTrip.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("GET /reviews/featured - Get featured reviews", () => {
    it("returns featured reviews without authentication", async () => {
      const response = await request(app).get("/api/v1/reviews/featured");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns high-rated reviews", async () => {
      const response = await request(app).get("/api/v1/reviews/featured");

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        expect(response.body[0].rating).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe("GET /reviews/check/:tripId - Check review eligibility", () => {
    it("returns eligible when user completed trip and not reviewed", async () => {
      // Create a new trip and booking without review
      const eligibleTrip = await prisma.trip.create({
        data: {
          title: "Eligible Trek",
          slug: `eligible-trek-${Date.now()}`,
          description: "Eligible for review",
          category: "TREK",
          durationDays: 2,
          difficulty: "EASY",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      await prisma.booking.create({
        data: {
          userId,
          tripId: eligibleTrip.id,
          status: "COMPLETED",
          startDate: new Date("2024-01-15"),
          guests: 1,
          totalPrice: 8000,
        },
      });

      const response = await request(app)
        .get(`/api/v1/reviews/check/${eligibleTrip.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.eligible).toBe(true);
    });

    it("returns not eligible when user has not completed trip", async () => {
      const ineligibleTrip = await prisma.trip.create({
        data: {
          title: "Ineligible Trek",
          slug: `ineligible-trek-${Date.now()}`,
          description: "Not completed",
          category: "TREK",
          durationDays: 2,
          difficulty: "EASY",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const response = await request(app)
        .get(`/api/v1/reviews/check/${ineligibleTrip.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.eligible).toBe(false);
      expect(response.body).toHaveProperty("reason");
    });

    it("returns not eligible when user already reviewed trip", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/check/${tripId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.eligible).toBe(false);
      expect(response.body.reason).toContain("already reviewed");
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).get(`/api/v1/reviews/check/${tripId}`);

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /reviews/:id - Delete review", () => {
    it("deletes review when user is the author", async () => {
      if (!reviewId) return;

      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect([200, 204]).toContain(response.status);
    });

    it("deletes review when user is admin", async () => {
      // Create a new review to delete
      const testTrip = await prisma.trip.create({
        data: {
          title: "Admin Delete Trek",
          slug: `admin-delete-${Date.now()}`,
          description: "Trek for admin delete test",
          category: "TREK",
          durationDays: 2,
          difficulty: "EASY",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      await prisma.booking.create({
        data: {
          userId,
          tripId: testTrip.id,
          status: "COMPLETED",
          startDate: new Date("2024-01-20"),
          guests: 1,
          totalPrice: 8000,
        },
      });

      const testReview = await prisma.review.create({
        data: {
          userId,
          tripId: testTrip.id,
          rating: 4,
          comment: "To be deleted by admin",
        },
      });

      const response = await request(app)
        .delete(`/api/v1/reviews/${testReview.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 204]).toContain(response.status);
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).delete("/api/v1/reviews/some-id");

      expect(response.status).toBe(401);
    });

    it("returns 404 for non-existent review", async () => {
      const response = await request(app)
        .delete("/api/v1/reviews/non-existent-id-123")
        .set("Authorization", `Bearer ${userToken}`);

      expect([400, 404]).toContain(response.status);
    });
  });
});
