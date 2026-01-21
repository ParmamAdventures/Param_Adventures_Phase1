import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";
import { notificationQueue } from "../../src/lib/queue";

const prisma = new PrismaClient();

describe("Booking Integration", () => {
  let userToken: string;
  let userId: string;
  let tripId: string;

  beforeAll(async () => {
    // Spy on queue to prevent actual Redis jobs and potential errors
    jest.spyOn(notificationQueue, "add").mockResolvedValue({} as any);

    // Clean up
    try {
      await prisma.review.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.savedTrip.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.blog.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.payment.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.booking.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.trip.deleteMany();
    } catch {
      /* ignored */
    }
    try {
      await prisma.user.deleteMany();
    } catch {
      /* ignored */
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: "booker@test.com",
        password: "Password123!",
        name: "Booker User",
      },
    });
    userId = user.id;
    userToken = signAccessToken(userId);

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        title: "Test Expedition",
        slug: "test-expedition",
        description: "A test trip",
        itinerary: {},
        durationDays: 5,
        difficulty: "MODERATE",
        location: "Himalayas",
        price: 500,
        status: "PUBLISHED",
        capacity: 10,
        createdById: userId,
        startDate: new Date(),
        endDate: new Date(),
      },
    });
    tripId = trip.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    try {
      await notificationQueue.close();
    } catch (e) {
      console.warn("Failed to close queue in tests:", e);
    }
  });

  it("should create a new booking", async () => {
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        tripId,
        startDate: new Date().toISOString(),
        guests: 2,
        notes: "Excited for the trip!",
      });

    if (res.status !== 201) {
      console.log("Create Booking Error:", JSON.stringify(res.body, null, 2));
    }

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.tripId).toBe(tripId);
    expect(res.body.data.guests).toBe(2);
  });

  it("should get user's bookings", async () => {
    const res = await request(app)
      .get("/api/v1/bookings/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.bookings)).toBe(true);
    expect(res.body.data.bookings.length).toBeGreaterThan(0);
    expect(res.body.data.bookings[0].trip.title).toBe("Test Expedition");
  });

  it("should fail to create booking for non-existent trip", async () => {
    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        tripId: "00000000-0000-0000-0000-000000000000",
        startDate: new Date().toISOString(),
        guests: 1,
      });

    if (![400, 404].includes(res.status)) {
      console.log("FAILED validation/not found test. Status:", res.status);
      console.log("Body:", JSON.stringify(res.body, null, 2));
    }
    expect([400, 404]).toContain(res.status);
    // ApiResponse error structure: { error: { code, message } } or { error: message } depending on middleware
    // Based on error.middleware.ts: res.status(status).json({ error: { code, message } })
    // But catchAsync passes errors to middleware. Service checks trip existence and throws HttpError(404...).
    expect(res.body.error).toBeDefined();
  });

  it("should cancel a booking", async () => {
    // First create a booking to cancel
    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        startDate: new Date(),
        guests: 1,
        totalPrice: 500,
      },
    });

    const res = await request(app)
      .post(`/api/v1/bookings/${booking.id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    // Check wrapped response in data
    // The controller returns: { booking: updatedBooking } inside data
    expect(res.body.data.booking.status).toBe("CANCELLED");

    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.status).toBe("CANCELLED");
  });
});
