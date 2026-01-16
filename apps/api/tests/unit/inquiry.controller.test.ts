import { Request, Response } from "express";
import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

// 1. Setup Mock
const prismaMock = mockDeep<PrismaClient>();

jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: prismaMock,
}));

// 2. Import Controller (Must be after mock definition if using doMock, but jest.mock should hoist.
// However, separating it helps clarity and safety with internal modules)
import { createInquiry } from "../../src/controllers/inquiry.controller";

// Mocking Response methods
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mocking Request properties
const mockRequest = (body: any) => {
  return {
    body,
  } as Request;
};

describe("InquiryController", () => {
  describe("createInquiry", () => {
    it("should return 400 if required fields are missing", async () => {
      const req = mockRequest({ name: "Akash" }); // Missing email, destination
      const res = mockResponse();

      await createInquiry(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Name, Email and Destination are required",
        }),
      );
    });

    it("should create inquiry and return 201 on success", async () => {
      const data = {
        name: "Akash",
        email: "akash@example.com",
        phoneNumber: "9876543210",
        destination: "Himalayas",
        dates: "Next Month",
        budget: "50000",
        details: "Looking for fun",
      };

      const req = mockRequest(data);
      const res = mockResponse();

      const createdInquiry = { id: "1", ...data, status: "NEW", createdAt: new Date() };

      // Fix: Typescript might complain if prismaMock isn't typed correctly in setup,
      // but assuming prisma.mock.ts is correct:
      // We need to ensure logic in controller matches.
      // Controller uses: prisma.tripInquiry.create({ data: ... })

      // We need to cast prismaMock to any or ensure it covers TripInquiry which might be new.
      // If generated client is old in node_modules, tests might fail TS check.
      // But we just moved to `feature/phase-9-testing` and assume generate ran.

      (prismaMock.tripInquiry.create as jest.Mock).mockResolvedValue(createdInquiry);

      await createInquiry(req, res, jest.fn());

      expect(prismaMock.tripInquiry.create).toHaveBeenCalledWith({
        data: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          destination: data.destination,
          dates: data.dates,
          budget: data.budget,
          details: data.details,
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdInquiry,
        }),
      );
    });
  });
});
