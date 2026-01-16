import request from "supertest";
import { app } from "../../src/app";

// Mock removed to test real DB connection
// jest.mock("@prisma/client", ...);

describe("GET /health", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.services.database).toBe("up");
  });
});
