import request from "supertest";
import { app } from "../../src/app";
import { signAccessToken } from "../../src/utils/jwt";
import { razorpayService } from "../../src/services/razorpay.service";
import { prisma } from "../../src/lib/prisma";

// Mock Razorpay service
jest.mock("../../src/services/razorpay.service", () => ({
  razorpayService: {
    createOrder: jest.fn(),
    verifyPaymentSignature: jest.fn(),
    refundPayment: jest.fn(),
  },
}));

// Mock notification queue to avoid real Redis/BullMQ usage in tests
jest.mock("../../src/lib/queue", () => ({
  notificationQueue: {
    add: jest.fn(),
    close: jest.fn(),
    quit: jest.fn(),
  },
  notificationWorker: {
    close: jest.fn(),
    stop: jest.fn(),
  },
}));

describe("Payment Integration Tests", () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let tripId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Clean up database in proper order (images before users due to FK)
    await prisma.image.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: "paymentuser@test.com",
        password: "hashedPassword",
        name: "Payment User",
      },
    });
    userId = user.id;
    userToken = signAccessToken(userId);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "paymentadmin@test.com",
        password: "hashedPassword",
        name: "Payment Admin",
      },
    });
    adminId = admin.id;
    adminToken = signAccessToken(adminId);

    // Assign admin role
    const superAdminRole = await prisma.role.upsert({
      where: { name: "super_admin" },
      update: {},
      create: {
        name: "super_admin",
        description: "Super Admin role for refunds",
        isSystem: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminId, roleId: superAdminRole.id } },
      update: {},
      create: { userId: adminId, roleId: superAdminRole.id },
    });

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        title: "Payment Test Trip",
        slug: "payment-test-trip",
        description: "Trip for testing payments",
        itinerary: [],
        price: 5000,
        status: "PUBLISHED",
        location: "Test Destination",
        durationDays: 3,
        difficulty: "EASY",
        capacity: 10,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-04"),
        createdById: userId,
      },
    });
    tripId = trip.id;
  });

  afterAll(async () => {
    await prisma.image.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
  });

  describe("POST /bookings/:id/initiate-payment", () => {
    it("should create Razorpay order for pending booking", async () => {
      // Arrange - Create pending booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 2,
          totalPrice: 10000, // ₹100.00
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });
      bookingId = booking.id;

      const amountInPaise = booking.totalPrice * 100;
      const mockOrder = {
        id: "order_test123",
        amount: amountInPaise,
        currency: "INR",
        status: "created",
      };

      (razorpayService.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${bookingId}/initiate-payment`)
        .set("Authorization", `Bearer ${userToken}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.orderId).toBe("order_test123");
      expect(res.body.data.amount).toBe(amountInPaise);
      expect(razorpayService.createOrder).toHaveBeenCalledWith(amountInPaise, bookingId);

      // Verify payment record created
      const payment = await prisma.payment.findFirst({
        where: { bookingId },
      });
      expect(payment).toBeTruthy();
      expect(payment?.providerOrderId).toBe("order_test123");
      expect(payment?.amount).toBe(amountInPaise);
      expect(payment?.status).toBe("CREATED");
    });

    it("should reject payment for non-existent booking", async () => {
      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/invalid-booking-id/initiate-payment`)
        .set("Authorization", `Bearer ${userToken}`);

      // Assert
      expect(res.status).toBe(404);
    });

    it("should reject payment for already paid booking", async () => {
      // Arrange - Create paid booking
      const paidBooking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CONFIRMED",
          startDate: new Date("2024-12-01"),
          paymentStatus: "PAID",
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: paidBooking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_existing",
          amount: 5000,
          status: "CAPTURED",
          method: "CARD",
        },
      });

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${paidBooking.id}/initiate-payment`)
        .set("Authorization", `Bearer ${userToken}`);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("already paid");
    });

    it("should reject payment for cancelled booking", async () => {
      // Arrange
      const cancelledBooking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CANCELLED",
          startDate: new Date("2024-12-01"),
        },
      });

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${cancelledBooking.id}/initiate-payment`)
        .set("Authorization", `Bearer ${userToken}`);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("cancelled");
    });

    it("should handle Razorpay order creation failure", async () => {
      // Arrange
      const failBooking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });

      (razorpayService.createOrder as jest.Mock).mockRejectedValue(new Error("Razorpay API Error"));

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${failBooking.id}/initiate-payment`)
        .set("Authorization", `Bearer ${userToken}`);

      // Assert
      expect(res.status).toBe(500);
    });
  });

  describe("POST /bookings/:id/verify-payment", () => {
    it("should verify and confirm payment with valid signature", async () => {
      // Arrange - Create booking with pending payment
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_verify123",
          amount: 5000,
          status: "CREATED",
          method: "CARD",
        },
      });

      // Mock signature verification
      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(true);

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/verify-payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderId: "order_verify123",
          paymentId: "pay_verify456",
          signature: "valid_signature_xxx",
        });

      // Assert
      expect(res.status).toBe(200);

      // Verify payment updated
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe("CAPTURED");
      expect(updatedPayment?.providerPaymentId).toBe("pay_verify456");

      // Verify booking updated
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(updatedBooking?.status).toBe("CONFIRMED");
    });

    it("should reject payment with invalid signature", async () => {
      // Arrange
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_invalid123",
          amount: 5000,
          status: "CREATED",
          method: "CARD",
        },
      });

      // Mock signature verification failure
      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(false);

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/verify-payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderId: "order_invalid123",
          paymentId: "pay_hacked999",
          signature: "tampered_signature",
        });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("verification failed");

      // Verify booking still requested
      const booking2 = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(booking2?.status).toBe("REQUESTED");
    });

    it("should reject payment with missing fields", async () => {
      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${bookingId}/verify-payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderId: "order_123",
          // Missing paymentId and signature
        });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("POST /bookings/:id/refund", () => {
    it("should process refund for confirmed booking (admin only)", async () => {
      // Arrange - Create confirmed booking with successful payment
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CONFIRMED",
          startDate: new Date("2024-12-01"),
        },
      });

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_refund123",
          providerPaymentId: "pay_refund456",
          amount: 5000,
          status: "CAPTURED",
          method: "CARD",
        },
      });

      const mockRefund = {
        id: "rfnd_test789",
        amount: 5000,
        status: "processed",
      };

      (razorpayService.refundPayment as jest.Mock).mockResolvedValue(mockRefund);

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/refund`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "User request" });

      // Assert
      expect(res.status).toBe(200);
      expect(razorpayService.refundPayment).toHaveBeenCalledWith(
        "pay_refund456",
        expect.objectContaining({
          amount: 5000,
          notes: expect.objectContaining({ reason: "User request" }),
        }),
      );

      // Verify payment status updated
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe("REFUNDED");

      // Verify booking cancelled
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(updatedBooking?.status).toBe("CANCELLED");
    });

    it("should reject refund by non-admin user", async () => {
      // Arrange
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CONFIRMED",
          startDate: new Date("2024-12-01"),
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_nonadmin",
          providerPaymentId: "pay_nonadmin",
          amount: 5000,
          status: "CAPTURED",
          method: "CARD",
        },
      });

      // Act - Use regular user token
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/refund`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ reason: "User request" });

      // Assert
      expect(res.status).toBe(403);
    });

    it("should reject refund for already refunded payment", async () => {
      // Arrange
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CANCELLED",
          startDate: new Date("2024-12-01"),
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_alreadyrefund",
          providerPaymentId: "pay_alreadyrefund",
          amount: 5000,
          status: "REFUNDED",
          method: "CARD",
        },
      });

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/refund`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Duplicate request" });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("No refundable payment");
    });

    it("should handle Razorpay refund failure", async () => {
      // Arrange
      const booking = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "CONFIRMED",
          startDate: new Date("2024-12-01"),
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerOrderId: "order_failrefund",
          providerPaymentId: "pay_failrefund",
          amount: 5000,
          status: "CAPTURED",
          method: "CARD",
        },
      });

      (razorpayService.refundPayment as jest.Mock).mockRejectedValue(
        new Error("Razorpay refund failed"),
      );

      // Act
      const res = await request(app)
        .post(`/api/v1/bookings/${booking.id}/refund`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Test failure" });

      // Assert
      expect(res.status).toBe(502);
    });
  });

  describe("Security Tests", () => {
    it("should prevent signature replay attack", async () => {
      // Arrange - Create two bookings
      const booking1 = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });

      const booking2 = await prisma.booking.create({
        data: {
          userId,
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-02"),
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking1.id,
          provider: "RAZORPAY",
          providerOrderId: "order_replay1",
          amount: 5000,
          status: "CREATED",
          method: "CARD",
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking2.id,
          provider: "RAZORPAY",
          providerOrderId: "order_replay2",
          amount: 5000,
          status: "CREATED",
          method: "CARD",
        },
      });

      // Mock - First verification succeeds, second fails (different order)
      (razorpayService.verifyPaymentSignature as jest.Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      // Act 1 - Confirm first booking
      const res1 = await request(app)
        .post(`/api/v1/bookings/${booking1.id}/verify-payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderId: "order_replay1",
          paymentId: "pay_replay",
          signature: "signature_xyz",
        });

      expect(res1.status).toBe(200);

      // Act 2 - Try to reuse same payment on second booking
      const res2 = await request(app)
        .post(`/api/v1/bookings/${booking2.id}/verify-payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderId: "order_replay2", // Different order!
          paymentId: "pay_replay", // Same payment!
          signature: "signature_xyz", // Same signature!
        });

      // Assert - Second attempt should fail
      expect(res2.status).toBe(400);
    });

    it("should prevent unauthorized user from accessing others' payments", async () => {
      // Arrange - Create booking for user1
      const user2 = await prisma.user.create({
        data: {
          email: "hacker@test.com",
          password: "hashedPassword",
          name: "Hacker",
        },
      });
      const hackerToken = signAccessToken(user2.id);

      const victimBooking = await prisma.booking.create({
        data: {
          userId, // Belongs to original user
          tripId,
          guests: 1,
          totalPrice: 5000,
          status: "REQUESTED",
          startDate: new Date("2024-12-01"),
        },
      });

      // Act - Try to initiate payment as different user
      const res = await request(app)
        .post(`/api/v1/bookings/${victimBooking.id}/initiate-payment`)
        .set("Authorization", `Bearer ${hackerToken}`);

      // Assert
      expect(res.status).toBe(403);
    });
  });
});
