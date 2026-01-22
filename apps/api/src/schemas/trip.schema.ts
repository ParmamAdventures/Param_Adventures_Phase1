import { z } from "zod";

const baseTripSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  durationDays: z.number().int().positive("Duration must be a positive integer"),
  difficulty: z.enum(["EASY", "MODERATE", "HARD", "EXTREME"]),
  startDate: z.string().datetime({ message: "Invalid date format" }),
  endDate: z.string().datetime({ message: "Invalid date format" }),
  meetingPoint: z.string().optional(),
  maxCapacity: z.number().int().positive().optional(),
  location: z.string().optional(),
  itinerary: z
    .array(
      z.object({
        day: z.number().int().positive(),
        title: z.string().min(3),
        description: z.string().min(10),
        activities: z.array(z.string()).optional(),
        accommodation: z.string().optional(),
        meals: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  thingsToPack: z.array(z.string()).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(10),
      }),
    )
    .optional(),
  seasons: z.array(z.string()).optional(),
});

export const createTripSchema = z.object({
  body: baseTripSchema,
});

export const updateTripSchema = z.object({
  body: baseTripSchema.partial().extend({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "COMPLETED", "CANCELLED"]).optional(),
  }),
});
