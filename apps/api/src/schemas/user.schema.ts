import { z } from "zod";

// User validation schemas
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    nickname: z.string().optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    age: z.number().int().min(13, "Must be at least 13 years old").max(120).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
      .optional(),
    address: z.string().max(200).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    nickname: z.string().optional(),
    bio: z.string().max(500).optional(),
    age: z.number().int().min(13).max(120).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    address: z.string().max(200).optional(),
    avatarImageId: z.string().uuid().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
