import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency: "INR";
  receipt: string; // bookingId
}): Promise<any> {
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    // SDK typings expect boolean but Razorpay accepts 1 for auto-capture
    payment_capture: 1 as any,
  });

  return order as any;
}

export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expected === signature;
}
