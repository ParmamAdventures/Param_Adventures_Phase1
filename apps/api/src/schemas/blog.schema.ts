import { z } from "zod";

// Blog validation schemas
export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(10, "Title must be at least 10 characters").max(150),
    content: z.record(z.string(), z.any()), // Editor.js JSON content
    excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
    tripId: z.string().uuid("Invalid trip ID").optional(),
    coverImageId: z.string().uuid("Invalid image ID").optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(150).optional(),
    content: z.record(z.string(), z.any()).optional(),
    excerpt: z.string().max(300).optional(),
    tripId: z.string().uuid().optional(),
    coverImageId: z.string().uuid().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid blog ID"),
  }),
});

export const blogIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid blog ID"),
  }),
});

export const blogSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
});

export const blogQuerySchema = z.object({
  query: z.object({
    status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"]).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

// Type exports
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogQueryInput = z.infer<typeof blogQuerySchema>;
