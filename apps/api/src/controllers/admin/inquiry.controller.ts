import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";

export const listInquiries = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    prisma.tripInquiry.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tripInquiry.count(),
  ]);

  return ApiResponse.success(res, "Inquiries fetched successfully", {
    inquiries,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const updateInquiryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return ApiResponse.error(res, "Status is required", 400);
  }

  const updated = await prisma.tripInquiry.update({
    where: { id },
    data: { status },
  });

  return ApiResponse.success(res, "Inquiry updated successfully", updated);
});
