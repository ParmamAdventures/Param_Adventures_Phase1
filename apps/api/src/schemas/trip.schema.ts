import { z } from "zod";

// Trip validation schemas
export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.enum(["TREK", "EXPEDITION", "ADVENTURE", "CULTURAL", "WILDLIFE"]),
    durationDays: z.number().int().min(1, "Duration must be at least 1 day").max(365),
    difficulty: z.string().min(1),
    location: z.string().min(3),
    price: z.number().int().min(0, "Price must be non-negative"),
    capacity: z.number().int().min(1, "Capacity must be at least 1"),
    itinerary: z.record(z.any()),
    coverImageId: z.string().uuid().optional(),
    highlights: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(20).optional(),
    category: z.enum(["TREK", "EXPEDITION", "ADVENTURE", "CULTURAL", "WILDLIFE"]).optional(),
    durationDays: z.number().int().min(1).max(365).optional(),
    difficulty: z.string().optional(),
    location: z.string().min(3).optional(),
    price: z.number().int().min(0).optional(),
    capacity: z.number().int().min(1).optional(),
    itinerary: z.record(z.any()).optional(),
    coverImageId: z.string().uuid().optional(),
    highlights: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
});

export const tripIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
});

export const tripQuerySchema = z.object({
  query: z.object({
    category: z.enum(["TREK", "EXPEDITION", "ADVENTURE", "CULTURAL", "WILDLIFE"]).optional(),
    difficulty: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

// Type exports
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type TripQueryInput = z.infer<typeof tripQuerySchema>;
