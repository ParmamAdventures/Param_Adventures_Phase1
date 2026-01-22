import { z } from "zod";

// Booking validation schemas
const baseBookingSchema = z.object({
  guests: z.number().int().min(1, "At least 1 guest required").max(50),
  guestDetails: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email().optional(),
        age: z.number().int().min(1).max(120).optional(),
        gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
      }),
    )
    .optional(),
  notes: z.string().max(500).optional(),
});

export const createBookingSchema = z.object({
  body: baseBookingSchema.extend({
    tripId: z.string().uuid("Invalid trip ID"),
    startDate: z.string().datetime("Invalid date format"),
  }),
});

export const updateBookingSchema = z.object({
  body: baseBookingSchema.partial().extend({
    startDate: z.string().datetime().optional(),
    status: z.enum(["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid booking ID"),
  }),
});

export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid booking ID"),
  }),
});

// Type exports
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
