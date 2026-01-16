import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../lib/logger";

// Lazy initialization for better testability
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// For testing: allow resetting the instance
export function resetRazorpayInstance() {
  razorpayInstance = null;
}

export const razorpayService = {
  /**
   * Create a new Razorpay order
   * @param amount Amount in paise (e.g. 10000 for ₹100)
   * @param receipt Unique identifier (usually booking ID)
   */
  async createOrder(amount: number, receipt: string) {
    try {
      const razorpay = getRazorpayInstance();
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

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, options?: { amount?: number; notes?: Record<string, string> }) {
    try {
      const razorpay = getRazorpayInstance();
      const refund = await razorpay.payments.refund(paymentId, {
        amount: options?.amount, // Optional amount for partial refund
        speed: "normal",
        notes: options?.notes,
      });
      return refund;
    } catch (error) {
      logger.error("Razorpay refund failed", { error, paymentId });
      throw error;
    }
  },

  /**
   * Fetch payment details from Razorpay
   */
  async fetchPayment(paymentId: string) {
    try {
      const razorpay = getRazorpayInstance();
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
       logger.error("Razorpay fetch payment failed", { error, paymentId });
       throw error;
    }
  }
};

// Also export individual functions for backward compatibility with existing stubs
export const createRazorpayOrder = (args: { amount: number; currency: string; receipt: string }) =>
  razorpayService.createOrder(args.amount, args.receipt);

export const verifyRazorpaySignature = (body: string, signature: string, secret: string) =>
  razorpayService.verifyWebhookSignature(body, signature, secret);
