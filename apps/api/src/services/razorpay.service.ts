import crypto from "crypto";

// Lazily initialize Razorpay client to avoid throwing on module import
let razorpayClient: any | null = null;
function getRazorpayClient() {
  if (razorpayClient) return razorpayClient;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Return a stub that throws when used, but does not crash on import
    razorpayClient = {
      orders: {
        create: async () => {
          throw new Error("Razorpay keys not configured");
        },
      },
    };
    return razorpayClient;
  }

  // require dynamically to avoid top-level errors in environments without the SDK
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Razorpay = require("razorpay");
  razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayClient;
}

export async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency: "INR";
  receipt: string; // bookingId
}): Promise<any> {
  const client = getRazorpayClient();
  const order = await client.orders.create({
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
