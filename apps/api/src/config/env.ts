import { z } from "zod";
import "dotenv/config.js";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),

  RAZORPAY_KEY_ID: z.string().default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().default("placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("placeholder_webhook_secret"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // DB
  DATABASE_URL: z.string(),

  // Frontend
  FRONTEND_URL: z.string().default("*"),

  // SMTP (Email)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Param Adventures <noreply@paramadventures.com>"),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  const fieldErrors = parsed.error.flatten().fieldErrors;
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    console.error(`  - ${field}: ${errors?.join(", ")}`);
  });

  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Continuing in production despite invalid env - monitoring health...");
  }
}

export const env = parsed.success ? parsed.data : (process.env as any);
