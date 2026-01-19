import { z } from "zod";

export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    durationDays: z.number().int().positive("Duration must be a positive integer"),
    difficulty: z.enum(["EASY", "MODERATE", "DIFFICULT", "EXTREME"]),
    startDate: z.string().datetime({ message: "Invalid date format" }),
    endDate: z.string().datetime({ message: "Invalid date format" }),
    meetingPoint: z.string().optional(),
    maxCapacity: z.number().int().positive().optional(),
    location: z.string().optional(),
    itinerary: z.array(z.any()).optional(), // Can be more specific if structure is known
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    durationDays: z.number().int().positive().optional(),
    difficulty: z.enum(["EASY", "MODERATE", "DIFFICULT", "EXTREME"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "COMPLETED", "CANCELLED"]).optional(),
    meetingPoint: z.string().optional(),
    maxCapacity: z.number().int().positive().optional(),
    location: z.string().optional(),
    itinerary: z.array(z.any()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
  }),
});
