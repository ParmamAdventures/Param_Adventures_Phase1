import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:8080", // frontend later
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // ⬅ MUST be before routes

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

// must be LAST
app.use(errorHandler);
