import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip}`);
    res.status(options.statusCode).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
      },
    });
  },
});

import { env } from "./env";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "test" ? 100 : 5, // Strict limit for auth endpoints, relaxed for tests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn(`Auth rate limit exceeded for IP ${req.ip}`);
    res.status(options.statusCode).json({
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts, please try again later.",
      },
    });
  },
});
