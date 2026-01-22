import { z } from "zod";

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    destination: z.string().min(2, "Destination is required"),
    dates: z.string().optional(),
    budget: z.string().optional(),
    details: z.string().optional(),
  }),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
