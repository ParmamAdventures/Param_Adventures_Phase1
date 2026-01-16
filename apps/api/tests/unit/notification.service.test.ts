jest.mock("nodemailer");

import nodemailer from "nodemailer";
import { notificationService } from "../../src/services/notification.service";

describe("notificationService", () => {
  let mockSendMail: jest.Mock;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the cached transporter
    (notificationService as any).transporter = null;
    
    mockSendMail = jest.fn().mockResolvedValue({ messageId: "msg_123" });
    mockTransporter = { sendMail: mockSendMail };
    
    // Mock nodemailer methods
    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue({
      user: "test@ethereal.email",
      pass: "testpass",
    });
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue("http://ethereal.test/preview");
  });

  describe("sendEmail", () => {
    it("sends email with provided options", async () => {
      const result = await notificationService.sendEmail({
        to: "user@test.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Test Email",
          html: "<p>Test content</p>",
        }),
      );
      expect(result.messageId).toBe("msg_123");
    });

    it("throws error on send failure", async () => {
      const error = new Error("SMTP error");
      mockSendMail.mockRejectedValue(error);

      await expect(
        notificationService.sendEmail({
          to: "user@test.com",
          subject: "Test",
          html: "<p>Test</p>",
        }),
      ).rejects.toThrow("SMTP error");
    });
  });

  describe("sendBookingConfirmation", () => {
    it("sends booking confirmation email with trip details", async () => {
      const details = {
        userName: "John Doe",
        tripTitle: "Mount Everest Trek",
        bookingId: "booking_abc123def456",
        startDate: "2024-12-01",
        status: "PENDING",
      };

      await notificationService.sendBookingConfirmation("john@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@test.com",
          subject: expect.stringContaining("Mount Everest Trek"),
          html: expect.stringContaining("Adventure Awaits"),
        }),
      );
    });
  });

  describe("sendPaymentSuccess", () => {
    it("sends payment success email with booking confirmation", async () => {
      const details = {
        userName: "Jane Smith",
        tripTitle: "Kilimanjaro Climb",
        amount: 50000,
      };

      await notificationService.sendPaymentSuccess("jane@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "jane@test.com",
          subject: expect.stringContaining("Kilimanjaro Climb"),
          html: expect.stringContaining("Payment Confirmed"),
        }),
      );
    });
  });

  describe("sendRefundEmail", () => {
    it("sends refund notification with amount and reference", async () => {
      const details = {
        userName: "Bob Wilson",
        tripTitle: "Alaska Expedition",
        amount: 100000,
        refundId: "rfnd_xyz789",
      };

      await notificationService.sendRefundEmail("bob@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "bob@test.com",
          subject: expect.stringContaining("Alaska Expedition"),
          html: expect.stringContaining("Refund Processed"),
        }),
      );
    });
  });

  describe("sendPaymentInitiated", () => {
    it("sends payment initiated notification with order details", async () => {
      const details = {
        userName: "Alice Johnson",
        tripTitle: "Swiss Alps Hike",
        amount: 75000,
        orderId: "order_test123",
      };

      await notificationService.sendPaymentInitiated("alice@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "alice@test.com",
          subject: expect.stringContaining("Swiss Alps Hike"),
          html: expect.stringContaining("Payment Initiated"),
        }),
      );
    });
  });

  describe("sendPaymentFailed", () => {
    it("sends payment failed notification with failure reason", async () => {
      const details = {
        userName: "Charlie Brown",
        tripTitle: "Iceland Adventure",
        amount: 60000,
        reason: "Insufficient funds",
      };

      await notificationService.sendPaymentFailed("charlie@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "charlie@test.com",
          subject: expect.stringContaining("Payment Failed"),
          html: expect.stringContaining("Insufficient funds"),
        }),
      );
    });
  });

  describe("sendAssignmentNotification", () => {
    it("sends assignment notification with role details", async () => {
      const details = {
        userName: "Dave Guide",
        tripTitle: "Nepal Trek",
        role: "GUIDE",
      };

      await notificationService.sendAssignmentNotification("dave@test.com", details);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "dave@test.com",
          subject: expect.stringContaining("New Assignment"),
          html: expect.stringContaining("GUIDE"),
        }),
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("sends password reset email with reset link", async () => {
      const resetLink = "https://app.test.com/reset?token=abc123";

      await notificationService.sendPasswordResetEmail("user@test.com", resetLink);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: expect.stringContaining("Reset Your Password"),
          html: expect.stringContaining(resetLink),
        }),
      );
    });
  });
});
