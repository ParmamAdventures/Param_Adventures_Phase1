import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    paymentId: z.string().min(1, "Payment ID is required"),
    signature: z.string().min(1, "Signature is required"),
  }),
});

export const createManualPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
    amount: z
      .number()
      .positive("Amount must be positive")
      .or(
        z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .transform(Number),
      ),
    method: z.enum(["UPI", "CASH", "BANK_TRANSFER"]),
    transactionId: z.string().optional(),
    proofUrl: z.string().url("Invalid URL").optional(),
  }),
});
