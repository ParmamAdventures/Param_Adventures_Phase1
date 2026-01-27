import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from "../../src/lib/prisma";

describe("Mock Check", () => {
  it("should have a mocked prisma", () => {
    expect(prisma.user.findUnique).toBeDefined();
    expect((prisma.user.findUnique as jest.Mock).mock).toBeDefined();
  });
});
