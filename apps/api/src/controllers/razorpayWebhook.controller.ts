import { Request, Response } from "express";
import { verifyRazorpaySignature } from "../services/razorpay.service";
import { handlePaymentCaptured, handlePaymentFailed } from "./paymentEvents";
import { HttpError } from "../lib/httpError";
import { env } from "../config/env";
import {
  incTotal,
  incFailed,
  incProcessed,
  setLatency,
} from "../metrics/webhookMetrics";
import { logger } from "../lib/logger";

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
    throw new HttpError(
      400,
      "INVALID_SIGNATURE",
      "Signature verification failed"
    );
  }

  let event: any;
  try {
    event = JSON.parse(payloadString);
  } catch (err) {
    throw new HttpError(400, "INVALID_PAYLOAD", "Invalid JSON payload");
  }

  const start = Date.now();
  incTotal();
  logger.info(`Processing Razorpay webhook: ${event.event}`);

  try {
    switch (event.event) {
      case "payment.captured":
      case "order.paid":
        await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
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
