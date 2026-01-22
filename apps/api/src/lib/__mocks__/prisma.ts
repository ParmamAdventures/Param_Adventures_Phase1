import { PrismaClient } from "../../generated/client";
import { mockDeep } from "jest-mock-extended";

export const prisma = mockDeep<PrismaClient>();
