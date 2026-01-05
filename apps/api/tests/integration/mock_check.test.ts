import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { prismaMock } from "../helpers/prisma.mock";
import { prisma } from "../../src/lib/prisma";

describe("Mock Check", () => {
  it("should have a mocked prisma", () => {
    expect(prisma.user.findUnique).toBeDefined();
    expect((prisma.user.findUnique as any).mock).toBeDefined();
  });
});
