import { prismaMock } from "../helpers/prisma.mock";
import { prisma } from "../../src/lib/prisma";

describe("Mock Check", () => {
  it("should have a mocked prisma", () => {
    expect(prisma.user.findUnique).toBeDefined();
    expect((prisma.user.findUnique as any).mock).toBeDefined();
  });
});
