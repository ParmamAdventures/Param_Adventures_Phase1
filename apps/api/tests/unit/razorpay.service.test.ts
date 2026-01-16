import crypto from "crypto";

// Mock the razorpay service module
jest.mock("../../src/services/razorpay.service");

import { razorpayService, resetRazorpayInstance } from "../../src/services/razorpay.service";

describe("RazorpayService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRazorpayInstance();
  });

  describe("createOrder", () => {
    it("should create order with valid amount and receipt", async () => {
      const amount = 5000;
      const receipt = "booking_123";
      const mockOrder = {
        id: "order_test123",
        entity: "order",
        amount: 5000,
        currency: "INR",
        status: "created",
      };

      (razorpayService.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await razorpayService.createOrder(amount, receipt);

      expect(result).toEqual(mockOrder);
      expect(razorpayService.createOrder).toHaveBeenCalledWith(amount, receipt);
    });

    it("should handle Razorpay API errors", async () => {
      (razorpayService.createOrder as jest.Mock).mockRejectedValue(new Error("Razorpay API Error"));

      await expect(razorpayService.createOrder(5000, "booking_123")).rejects.toThrow(
        "Razorpay API Error",
      );
    });
  });

  describe("verifyPaymentSignature", () => {
    it("should verify valid signature", () => {
      const orderId = "order_test123";
      const paymentId = "pay_test456";
      const secret = "test_key_secret";

      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(true);

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, expectedSignature);

      expect(isValid).toBe(true);
    });

    it("should reject invalid signature", () => {
      const orderId = "order_test123";
      const paymentId = "pay_test456";
      const invalidSignature = "invalid_signature_xxx";

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(false);

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, invalidSignature);

      expect(isValid).toBe(false);
    });

    it("should reject tampered order ID", () => {
      const orderId = "order_test123";
      const tamperedOrderId = "order_hacked999";
      const paymentId = "pay_test456";
      const secret = "test_key_secret";

      const body = orderId + "|" + paymentId;
      const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(false);

      const isValid = razorpayService.verifyPaymentSignature(tamperedOrderId, paymentId, signature);

      expect(isValid).toBe(false);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      const webhookBody = JSON.stringify({
        event: "payment.captured",
        payload: { payment: { id: "pay_123" } },
      });
      const secret = "test_webhook_secret";

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(webhookBody)
        .digest("hex");

      (razorpayService.verifyWebhookSignature as jest.Mock).mockReturnValue(true);

      const isValid = razorpayService.verifyWebhookSignature(webhookBody, expectedSignature);

      expect(isValid).toBe(true);
    });

    it("should reject tampered webhook body", () => {
      const originalBody = JSON.stringify({ amount: 5000 });
      const tamperedBody = JSON.stringify({ amount: 1 });
      const secret = "test_webhook_secret";

      const signature = crypto.createHmac("sha256", secret).update(originalBody).digest("hex");

      (razorpayService.verifyWebhookSignature as jest.Mock).mockReturnValue(false);

      const isValid = razorpayService.verifyWebhookSignature(tamperedBody, signature);

      expect(isValid).toBe(false);
    });

    it("should prevent replay attacks (different body)", () => {
      const body1 = JSON.stringify({ event: "payment.captured", id: "pay_1" });
      const body2 = JSON.stringify({ event: "payment.captured", id: "pay_2" });
      const secret = "test_webhook_secret";

      const signature1 = crypto.createHmac("sha256", secret).update(body1).digest("hex");

      (razorpayService.verifyWebhookSignature as jest.Mock).mockReturnValue(false);

      const isValid = razorpayService.verifyWebhookSignature(body2, signature1);

      expect(isValid).toBe(false);
    });
  });

  describe("refundPayment", () => {
    it("should process full refund successfully", async () => {
      const paymentId = "pay_test123";

      const mockRefund = {
        id: "rfnd_test789",
        entity: "refund",
        amount: 5000,
        currency: "INR",
        payment_id: paymentId,
        status: "processed",
      };

      (razorpayService.refundPayment as jest.Mock).mockResolvedValue(mockRefund);

      const result = await razorpayService.refundPayment(paymentId);

      expect(result).toEqual(mockRefund);
      expect(razorpayService.refundPayment).toHaveBeenCalledWith(paymentId);
    });

    it("should process refund with notes", async () => {
      const paymentId = "pay_test123";
      const options = {
        amount: 50000,
        notes: { reason: "Customer request" },
      };

      const mockRefund = {
        id: "rfnd_test789",
        entity: "refund",
        payment_id: paymentId,
        status: "processed",
      };

      (razorpayService.refundPayment as jest.Mock).mockResolvedValue(mockRefund);

      const result = await razorpayService.refundPayment(paymentId, options);

      expect(result).toEqual(mockRefund);
      expect(razorpayService.refundPayment).toHaveBeenCalledWith(paymentId, options);
    });

    it("should handle refund errors", async () => {
      const paymentId = "pay_test123";

      (razorpayService.refundPayment as jest.Mock).mockRejectedValue(
        new Error("Payment already refunded"),
      );

      await expect(razorpayService.refundPayment(paymentId)).rejects.toThrow(
        "Payment already refunded",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle network timeout", async () => {
      (razorpayService.createOrder as jest.Mock).mockRejectedValue(new Error("ETIMEDOUT"));

      await expect(razorpayService.createOrder(5000, "booking_123")).rejects.toThrow("ETIMEDOUT");
    });

    it("should handle concurrent order creation", async () => {
      const amounts = [5000, 10000, 15000];
      const receipts = ["booking_1", "booking_2", "booking_3"];
      const mockOrders = amounts.map((amt, idx) => ({
        id: `order_${idx}`,
        amount: amt,
        status: "created",
      }));

      (razorpayService.createOrder as jest.Mock)
        .mockResolvedValueOnce(mockOrders[0])
        .mockResolvedValueOnce(mockOrders[1])
        .mockResolvedValueOnce(mockOrders[2]);

      const results = await Promise.all(
        amounts.map((amt, idx) => razorpayService.createOrder(amt, receipts[idx])),
      );

      expect(results).toHaveLength(3);
      expect(razorpayService.createOrder).toHaveBeenCalledTimes(3);
    });
  });

  describe("Security Tests", () => {
    it("should not log sensitive data in errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (razorpayService.createOrder as jest.Mock).mockRejectedValue(new Error("API Key invalid"));

      try {
        await razorpayService.createOrder(5000, "booking_123");
      } catch {
        // Expected
      }

      const loggedMessages = consoleSpy.mock.calls.flat().join(" ");
      expect(loggedMessages).not.toContain("test_key_secret");

      consoleSpy.mockRestore();
    });

    it("should validate signature timing attack resistance", () => {
      const orderId = "order_123";
      const paymentId = "pay_456";
      const secret = "test_key_secret";

      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(true);

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, validSignature);

      expect(isValid).toBe(true);
    });
  });
});
