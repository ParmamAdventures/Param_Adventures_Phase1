import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { generateAuthToken } from "./auth_helper";

describe("Admin Analytics Integration", () => {
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean and setup - delete in proper order to avoid FK constraints
    try {
      await prisma.review.deleteMany();
      await prisma.blog.deleteMany();
      await prisma.image.deleteMany();
      await prisma.payment.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.trip.deleteMany();
      await prisma.userRole.deleteMany();
      await prisma.user.deleteMany();
    } catch (e) {
      /* cleanup errors ignored */
    }
    // Create roles and permissions
    const adminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", isSystem: true },
    });

    const viewPerm = await prisma.permission.upsert({
      where: { key: "analytics:view" },
      update: {},
      create: { key: "analytics:view", description: "View analytics" },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: viewPerm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: viewPerm.id,
      },
    });

    // Create admin
    const admin = await prisma.user.create({
      data: {
        email: "admin_analytics@example.com",
        password: "password123",
        name: "Admin Analytics",
        status: "ACTIVE",
      },
    });

    await prisma.userRole.create({
      data: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });

    userId = admin.id;
    adminToken = generateAuthToken(admin.id);

    // Create a trip
    const trip = await prisma.trip.create({
      data: {
        title: "Analytics Expedition",
        description: "Testing analytics",
        price: 1000,
        slug: "analytics-expedition",
        location: "Test",
        durationDays: 3,
        difficulty: "MODERATE",
        itinerary: [],
        status: "PUBLISHED",
        startDate: new Date(),
        endDate: new Date(),
        createdById: userId,
      },
    });

    // Create multiple bookings and payments across different statuses
    const booking1 = await prisma.booking.create({
      data: {
        userId,
        tripId: trip.id,
        status: "CONFIRMED",
        totalPrice: 2000,
        guests: 2,
        startDate: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking1.id,
        amount: 200000, // 2000 INR
        currency: "INR",
        status: "CAPTURED",
        provider: "RAZORPAY" as any,
        providerPaymentId: "pay_1",
        providerOrderId: "order_1",
        method: "CARD",
      },
    });

    await prisma.booking.create({
      data: {
        userId,
        tripId: trip.id,
        status: "CANCELLED",
        totalPrice: 1000,
        guests: 1,
        startDate: new Date(),
      },
    });
  });

  describe("GET /admin/analytics/revenue", () => {
    it("should return revenue stats with growth and potential", async () => {
      const res = await request(app)
        .get("/api/v1/admin/analytics/revenue")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("currentMonthRevenue");
      expect(res.body).toHaveProperty("potentialRevenue");
      expect(res.body).toHaveProperty("growthPercentage");
      expect(Array.isArray(res.body.monthlyChart)).toBe(true);

      // Based on our setup: 2000 INR confirmed, 2000 INR captured
      expect(res.body.currentMonthRevenue).toBe(2000);
      expect(res.body.potentialRevenue).toBe(2000); // Only confirmed/requested
    });
  });

  describe("GET /admin/analytics/bookings", () => {
    it("should return booking stats and success rate", async () => {
      const res = await request(app)
        .get("/api/v1/admin/analytics/bookings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("total", 2);
      expect(res.body).toHaveProperty("confirmed", 1);
      expect(res.body).toHaveProperty("cancelled", 1);
      expect(res.body).toHaveProperty("successRate");
      expect(res.body.successRate).toBeGreaterThan(0);
    });
  });

  describe("GET /admin/analytics/trips", () => {
    it("should return trip performance with impact labels", async () => {
      const res = await request(app)
        .get("/api/v1/admin/analytics/trips")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].title).toBe("Analytics Expedition");
      expect(res.body[0].bookingCount).toBe(2);
      expect(res.body[0].revenue).toBe(2000);
      expect(res.body[0]).toHaveProperty("impact");
    });
  });
});
