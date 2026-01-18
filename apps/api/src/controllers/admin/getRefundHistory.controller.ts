import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ApiResponse } from "../../utils/ApiResponse";

export const getRefundHistory = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Optional Filters
  const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
  const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  // Build where clause
  const where: any = {
    status: "REFUNDED", // or we could look for 'razorpayRefundId' not null
  };

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = minAmount;
    if (maxAmount) where.amount.lte = maxAmount;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [refunds, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            trip: { select: { title: true } },
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return ApiResponse.success(
    res,
    {
      refunds: refunds.map((p) => ({
        id: p.id,
        amount: p.amount,
        refundId: p.providerPaymentId, // In refund flow, we might store refund ID here or in rawPayload
        date: p.createdAt,
        bookingId: p.bookingId,
        user: p.booking?.user?.name,
        email: p.booking?.user?.email,
        trip: p.booking?.trip?.title,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Refund history retrieved",
  );
};
