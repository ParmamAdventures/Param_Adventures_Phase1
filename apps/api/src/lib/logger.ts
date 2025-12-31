import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, json, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === "production"
          ? combine(timestamp(), json())
          : combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    }),
  ],
});
