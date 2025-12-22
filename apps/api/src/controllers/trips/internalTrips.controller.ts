
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInternalTrips = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const sortOptions: any = {};
    if (sortBy && sortOrder) {
      sortOptions[String(sortBy)] = sortOrder;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: sortOptions,
        skip,
        take: limitNumber,
        include: {
          coverImage: true,
        },
      }),
      prisma.trip.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: trips,
      metadata: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching internal trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};
