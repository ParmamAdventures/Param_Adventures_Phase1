// Central export file for all validation schemas

export * from "./auth.schema";
export * from "./user.schema";
export * from "./trip.schema";
export * from "./blog.schema";
export * from "./booking.schema";
export * from "./review.schema";
export * from "./media.schema";

// Common validation schemas
import { z } from "zod";

// UUID parameter validation
export const uuidParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID format"),
  }),
});

// Pagination query validation
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  }),
});

// Search query validation
export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query required"),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

// Type exports
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
