import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const razorpayService = {
  /**
   * Create a new Razorpay order
   * @param amount Amount in paise (e.g. 10000 for ₹100)
   * @param receipt Unique identifier (usually booking ID)
   */
  async createOrder(amount: number, receipt: string) {
    try {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
      });
      return order;
    } catch (error) {
      logger.error("Razorpay order creation failed", { error, receipt });
      throw error;
    }
  },

  /**
   * Verify webhook signature
   * @param body Raw request body bundle
   * @param signature The signature from x-razorpay-signature header
   * @param secret The webhook secret
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string = env.RAZORPAY_WEBHOOK_SECRET,
  ) {
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    return expectedSignature === signature;
  },

  /**
   * Verify checkout payment signature
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    const text = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    return expectedSignature === signature;
  },
};

// Also export individual functions for backward compatibility with existing stubs
export const createRazorpayOrder = (args: { amount: number; currency: string; receipt: string }) =>
  razorpayService.createOrder(args.amount, args.receipt);

export const verifyRazorpaySignature = (body: string, signature: string, secret: string) =>
  razorpayService.verifyWebhookSignature(body, signature, secret);
