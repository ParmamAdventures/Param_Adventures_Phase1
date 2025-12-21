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
import tripsRoutes from "./routes/trips.routes";
import adminTripBookingsRoutes from "./routes/admin/trip-bookings.routes";
import bookingsRoutes from "./routes/bookings.routes";
import webhooksRoutes from "./routes/webhooks.routes";
import paymentsRoutes from "./routes/payments.routes";
import metricsRoutes from "./routes/metrics.routes";
import mediaRoutes from "./routes/media.routes";
import { errorHandler } from "./middlewares/error.middleware";

import { globalLimiter } from "./config/rate-limit";

export const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(
  cors({
    // In development reflect the request origin so credentials (cookies)
    // are allowed from the running frontend (Next/Vite). In production
    // replace with a specific origin or a whitelist.
    origin:
      process.env.NODE_ENV === "production" ? "http://your.frontend.url" : true,
    credentials: true,
  })
);
app.use(cookieParser()); // ⬅ MUST be before routes

// Webhooks must be registered before the JSON parser so we can access the raw body
app.use("/webhooks", webhooksRoutes);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }));

import { healthCheck } from "./controllers/health.controller";

app.get("/health", healthCheck);

app.use("/auth", authRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/roles", adminRolesRoutes);
app.use("/admin/roles", adminRoleAssignRoutes);
app.use("/trips", tripsRoutes);
app.use("/admin/trips", adminTripBookingsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/media", mediaRoutes);
app.use("/metrics", metricsRoutes);

// must be LAST
app.use(errorHandler);
