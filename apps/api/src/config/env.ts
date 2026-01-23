import { z } from "zod";
import "dotenv/config.js";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // DB
  DATABASE_URL: z.string(),

  // Frontend
  FRONTEND_URL: z.string(),

  // SMTP (Email)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Param Adventures <noreply@paramadventures.com>"),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  const fieldErrors = parsed.error.flatten().fieldErrors;
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    console.error(`  - ${field}: ${errors?.join(", ")}`);
  });

  // Always exit if environment is invalid, regardless of NODE_ENV
  // This prevents the app from starting in an unstable state
  process.exit(1);
}

export const env = parsed.data;
