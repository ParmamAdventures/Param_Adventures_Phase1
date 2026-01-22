import { PrismaClient } from "../../src/generated/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

const prismaMockObject = mockDeep<PrismaClient>();

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: prismaMockObject,
}));

export const prismaMock = prismaMockObject as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
