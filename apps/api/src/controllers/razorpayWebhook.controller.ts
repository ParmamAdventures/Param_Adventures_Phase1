import { Request, Response } from "express";
import { verifyRazorpaySignature } from "../services/razorpay.service";
import { handlePaymentCaptured, handlePaymentFailed } from "./paymentEvents";
import { HttpError } from "../lib/httpError";

export async function razorpayWebhookHandler(req: Request, res: Response) {
  const signature = (req.headers["x-razorpay-signature"] as string) || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    throw new HttpError(400, "INVALID_WEBHOOK", "Missing signature or secret");
  }

  // req.body is a Buffer because rawBodyMiddleware was applied
  const payloadBuffer = req.body as Buffer;
  const payloadString = payloadBuffer.toString("utf8");

  const valid = verifyRazorpaySignature(payloadString, signature, secret);

  if (!valid) {
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

  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
        break;
      default:
        // ignore other events
        break;
    }
  } catch (err) {
    // Ensure any error is surfaced as 5xx so Razorpay can retry
    throw err;
  }

  return res.status(200).json({ received: true });
}
