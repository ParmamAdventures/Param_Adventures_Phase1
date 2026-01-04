import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("Booking Integration", () => {
  let userToken: string;
  let userId: string;
  let tripId: string;

  beforeAll(async () => {
    // Clean up
    try {
      await prisma.payment.deleteMany();
    } catch (e) {}
    try {
      await prisma.booking.deleteMany();
    } catch (e) {}
    try {
      await prisma.trip.deleteMany();
    } catch (e) {}
    try {
      await prisma.user.deleteMany();
    } catch (e) {}

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
        difficulty: "Moderate",
        location: "Himalayas",
        price: 500,
        status: "PUBLISHED",
        capacity: 10,
        createdById: userId,
      },
    });
    tripId = trip.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new booking", async () => {
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        tripId,
        startDate: new Date().toISOString(),
        guests: 2,
        notes: "Excited for the trip!",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.tripId).toBe(tripId);
    expect(res.body.guests).toBe(2);
  });

  it("should get user's bookings", async () => {
    const res = await request(app)
      .get("/bookings/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].trip.title).toBe("Test Expedition");
  });

  it("should fail to create booking for non-existent trip", async () => {
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        tripId: "non-existent-id",
        startDate: new Date().toISOString(),
        guests: 1,
      });

    expect(res.status).toBe(404);
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
      .post(`/bookings/${booking.id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.status).toBe("CANCELLED");
  });
});
