import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
