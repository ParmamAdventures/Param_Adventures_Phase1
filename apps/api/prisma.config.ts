// Only load .env in local development, not in CI
if (process.env.CI !== "true" && process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});