import { z } from "zod";

// Media validation schemas
export const uploadMediaSchema = z.object({
  body: z.object({
    type: z.enum(["IMAGE", "VIDEO"]).optional(),
  }),
});

export const mediaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid media ID"),
  }),
});

export const mediaQuerySchema = z.object({
  query: z.object({
    type: z.enum(["ALL", "IMAGE", "VIDEO"]).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const setTripCoverImageSchema = z.object({
  body: z.object({
    imageId: z.string().uuid("Invalid image ID"),
  }),
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID"),
  }),
});

// Type exports
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type MediaQueryInput = z.infer<typeof mediaQuerySchema>;
export type SetTripCoverImageInput = z.infer<typeof setTripCoverImageSchema>;
