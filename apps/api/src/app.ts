import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import { logger } from "./lib/logger";

import authRoutes from "./routes/auth.routes";
import adminUsersRoutes from "./routes/admin/users.routes";
import adminRolesRoutes from "./routes/admin/roles.routes";
import adminRoleAssignRoutes from "./routes/admin/role-assign.routes";
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

import { errorHandler } from "./middlewares/error.middleware";

import { globalLimiter } from "./config/rate-limit";

export const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(globalLimiter);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? "http://your.frontend.url" : true,
    credentials: true,
  })
);
app.use(cookieParser());

// Webhooks must be registered before the JSON parser
app.use("/webhooks", webhooksRoutes);
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }));

import { healthCheck } from "./controllers/health.controller";

app.get("/health", healthCheck);

// Base routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/trips", tripRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/media", mediaRoutes);
app.use("/blogs", blogRoutes);
app.use("/media", mediaRoutes);
app.use("/blogs", blogRoutes);
app.use("/metrics", metricsRoutes);
app.use("/content", contentRoutes);

// Admin routes
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/roles", adminRolesRoutes);
app.use("/admin/roles", adminRoleAssignRoutes);
app.use("/admin/trips", adminTripBookingsRoutes);
app.use("/admin/bookings", adminBookingsRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/admin/audit-logs", adminAuditRoutes);
app.use("/admin/dashboard", dashboardRoutes);

// must be LAST
app.use(errorHandler);
