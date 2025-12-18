import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import adminUsersRoutes from "./routes/admin/users.routes";
import adminRolesRoutes from "./routes/admin/roles.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(helmet());
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
app.use(express.json());
app.use(cookieParser()); // ⬅ MUST be before routes

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/roles", adminRolesRoutes);

// must be LAST
app.use(errorHandler);
