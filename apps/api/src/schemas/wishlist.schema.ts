import { z } from "zod";

// Wishlist validation schemas
export const toggleWishlistSchema = z.object({
  body: z.object({
    tripId: z.string().uuid("Invalid trip ID"),
  }),
});

// Type exports
export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;
