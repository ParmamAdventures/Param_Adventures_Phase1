import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "../../src/generated/client";

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from "../../src/lib/prisma";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
