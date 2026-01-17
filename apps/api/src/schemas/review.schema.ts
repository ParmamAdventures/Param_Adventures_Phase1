import { z } from "zod";

// Review validation schemas
export const createReviewSchema = z.object({
  body: z.object({
    tripId: z.string().uuid("Invalid trip ID"),
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
});

export const tripReviewsSchema = z.object({
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID"),
  }),
});

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
