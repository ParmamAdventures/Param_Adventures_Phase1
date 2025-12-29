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

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn(`Payment rate limit exceeded for IP ${req.ip}`);
    res.status(options.statusCode).json({
      error: {
        code: "PAYMENT_RATE_LIMIT_EXCEEDED",
        message: "Too many payment attempts, please contact support.",
      },
    });
  },
});

export const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Max 50 uploads per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn(`Media upload rate limit exceeded for IP ${req.ip}`);
    res.status(options.statusCode).json({
      error: {
        code: "MEDIA_RATE_LIMIT_EXCEEDED",
        message: "Too many uploads, please slow down.",
      },
    });
  },
});
