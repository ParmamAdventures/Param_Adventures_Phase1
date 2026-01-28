import { Request, Response } from "express";
import { verifyRazorpaySignature } from "../services/razorpay.service";
import { handlePaymentCaptured, handlePaymentFailed, handleRefundProcessed } from "./paymentEvents";
import { HttpError } from "../utils/httpError";
import { env } from "../config/env";
import { incTotal, incFailed, incProcessed, setLatency } from "../metrics/webhookMetrics";
import { logger } from "../lib/logger";

/**
 * Razorpay Webhook Handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function razorpayWebhookHandler(req: Request, res: Response) {
  const signature = (req.headers["x-razorpay-signature"] as string) || "";
  const secret = env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature) {
    throw new HttpError(400, "INVALID_WEBHOOK", "Missing x-razorpay-signature header");
  }

  // req.body is a Buffer because rawBodyMiddleware was applied
  const payloadBuffer = req.body as Buffer;
  const payloadString = payloadBuffer.toString("utf8");

  const valid = verifyRazorpaySignature(payloadString, signature, secret);

  if (!valid) {
    logger.warn("Razorpay webhook signature verification failed", { signature });
    throw new HttpError(400, "INVALID_SIGNATURE", "Signature verification failed");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(payloadString);
  } catch {
    throw new HttpError(400, "INVALID_PAYLOAD", "Invalid JSON payload");
  }

  const start = Date.now();
  incTotal();
  logger.info(`Processing Razorpay webhook: ${event.event}`);

  try {
    switch (event.event) {
      case "order.paid":
      case "payment.captured":
        await handlePaymentCaptured(
          event as import("../types/razorpay.types").PaymentCapturedEvent,
        );
        break;
      case "payment.failed":
        await handlePaymentFailed(event as import("../types/razorpay.types").PaymentFailedEvent);
        break;
      case "refund.processed":
        await handleRefundProcessed(
          event as import("../types/razorpay.types").RefundProcessedEvent,
        );
        break;
      case "payment.dispute.created":
        await import("./paymentEvents").then((m) =>
          m.handleDisputeCreated(event as import("../types/razorpay.types").DisputeCreatedEvent),
        );
        break;
      case "payment.dispute.won":
        await import("./paymentEvents").then((m) =>
          m.handleDisputeWon(event as import("../types/razorpay.types").DisputeClosedEvent),
        );
        break;
      case "payment.dispute.lost":
        await import("./paymentEvents").then((m) =>
          m.handleDisputeLost(event as import("../types/razorpay.types").DisputeClosedEvent),
        );
        break;
      default:
        logger.info(`Ignoring Razorpay webhook event: ${event.event}`);
        break;
    }
    incProcessed();
  } catch (err) {
    incFailed();
    logger.error("Error handling Razorpay webhook", { error: err, event: event.event });
    throw err;
  } finally {
    setLatency(Date.now() - start);
  }

  return res.status(200).json({ received: true });
}
