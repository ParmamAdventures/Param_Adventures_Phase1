import { execSync } from "child_process";
import path from "path";

process.env.PORT = "3000";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/param_adventures_test";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.FRONTEND_URL = "http://localhost:3001";

try {
  execSync("npx prisma migrate deploy --schema prisma/schema.prisma", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
} catch (err) {
  console.warn("Prisma migrate deploy skipped in tests:", err);
}

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
    on: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));
