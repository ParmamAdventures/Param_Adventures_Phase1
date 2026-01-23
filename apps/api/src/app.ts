// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/express.d.ts" />
import "express-async-errors";
import "./instrument"; // Must be imported before other imports potentially
import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node"; // Still needed for error handler types
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import passport from "./config/passport";
import { logger } from "./lib/logger";

import authRoutes from "./routes/auth.routes";
import adminUsersRoutes from "./routes/admin/users.routes";
import adminRolesRoutes from "./routes/admin/roles.routes";
import tripRoutes from "./routes/trips.routes";
import adminTripBookingsRoutes from "./routes/admin/trip-bookings.routes";
import adminBookingsRoutes from "./routes/admin/bookings.routes";
import bookingsRoutes from "./routes/bookings.routes";
import userRoutes from "./routes/user.routes";
import blogRoutes from "./routes/blogs.routes";
import paymentsRoutes from "./routes/payments.routes";
import webhooksRoutes from "./routes/webhooks.routes";
import metricsRoutes from "./routes/metrics.routes";
import mediaRoutes from "./routes/media.routes";
import adminAnalyticsRoutes from "./routes/admin/analytics.routes";
import adminAuditRoutes from "./routes/admin/audit.routes";
import dashboardRoutes from "./routes/admin/dashboard.routes";
import contentRoutes from "./routes/content.routes";
import tripAssignmentRoutes from "./routes/admin/trip-assignment.routes";
import adminInquiryRoutes from "./routes/admin/inquiry.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import inquiryRoutes from "./routes/inquiry.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import adminRefundRoutes from "./routes/admin/refunds.routes";

import { errorHandler } from "./middlewares/error.middleware";

import { globalLimiter, authLimiter, paymentLimiter, mediaLimiter } from "./config/rate-limit";

export const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
console.log("--> Backend Initialized (v1.2.0) - Restore Route Active <--");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://res.cloudinary.com", "https://*.ingest.sentry.io"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded by frontend
  }),
);

app.use(globalLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isAllowedVercel = origin.endsWith(".vercel.app");
      const isAllowedFrontend =
        origin === process.env.FRONTEND_URL || process.env.FRONTEND_URL === "*";

      if (isAllowedFrontend || isAllowedVercel || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(passport.initialize());

// The request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

// Webhooks must be registered before the JSON parser
app.use("/webhooks", webhooksRoutes);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// The request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

app.use(express.static(path.join(__dirname, "../public")));
app.use(
  morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }),
);

import { healthCheck } from "./controllers/health.controller";

app.get("/health", healthCheck);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API v1 Routes
const API_V1 = "/api/v1";

// Base routes
app.use(`${API_V1}/auth`, authLimiter, authRoutes);
app.use(`${API_V1}/users`, authLimiter, userRoutes);
app.use(`${API_V1}/trips`, tripRoutes);
app.use(`${API_V1}/bookings`, bookingsRoutes);
app.use(`${API_V1}/payments`, paymentLimiter, paymentsRoutes);
app.use(`${API_V1}/media`, mediaLimiter, mediaRoutes);
app.use(`${API_V1}/blogs`, blogRoutes);
app.use(`${API_V1}/metrics`, metricsRoutes);
app.use(`${API_V1}/content`, contentRoutes);
app.use(`${API_V1}/reviews`, reviewRoutes);
app.use(`${API_V1}/wishlist`, wishlistRoutes);
app.use(`${API_V1}/inquiries`, inquiryRoutes);
app.use(`${API_V1}/newsletter`, newsletterRoutes);

// Admin routes
app.use(`${API_V1}/admin/users`, adminUsersRoutes);
app.use(`${API_V1}/admin/roles`, adminRolesRoutes);
app.use(`${API_V1}/admin/trips`, adminTripBookingsRoutes);
app.use(`${API_V1}/admin/bookings`, adminBookingsRoutes);
app.use(`${API_V1}/admin/analytics`, adminAnalyticsRoutes);
app.use(`${API_V1}/admin/audit-logs`, adminAuditRoutes);
app.use(`${API_V1}/admin/dashboard`, dashboardRoutes);
app.use(`${API_V1}/admin/trip-assignments`, tripAssignmentRoutes);
app.use(`${API_V1}/admin/inquiries`, adminInquiryRoutes);
app.use(`${API_V1}/admin/refunds`, adminRefundRoutes);

// 404 handler for unmatched routes
app.use((_req, res) => {
  return ApiResponse.error(res, "NOT_FOUND", "Resource not found", 404);
});

// must be LAST
app.use(errorHandler);
