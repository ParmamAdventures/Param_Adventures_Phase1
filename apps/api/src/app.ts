import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
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

import { errorHandler } from "./middlewares/error.middleware";

import { globalLimiter, authLimiter, paymentLimiter, mediaLimiter } from "./config/rate-limit";

export const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline often needed for dev/some analytics
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
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
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
    credentials: true,
  }),
);
app.use(cookieParser());

// Webhooks must be registered before the JSON parser
app.use("/webhooks", webhooksRoutes);
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }),
);

import { healthCheck } from "./controllers/health.controller";

app.get("/health", healthCheck);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base routes
app.use("/auth", authLimiter, authRoutes);
app.use("/users", authLimiter, userRoutes);
app.use("/trips", tripRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/payments", paymentLimiter, paymentsRoutes);
app.use("/media", mediaLimiter, mediaRoutes);
app.use("/blogs", blogRoutes);
app.use("/metrics", metricsRoutes);
app.use("/content", contentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/inquiries", inquiryRoutes);
app.use("/newsletter", newsletterRoutes);

// Admin routes
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/roles", adminRolesRoutes);
app.use("/admin/trips", adminTripBookingsRoutes);
app.use("/admin/bookings", adminBookingsRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/admin/audit-logs", adminAuditRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/trip-assignments", tripAssignmentRoutes);
app.use("/admin/inquiries", adminInquiryRoutes);

// must be LAST
app.use(errorHandler);
