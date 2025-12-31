import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { tripId, rating, comment } = req.body;
    const userId = req.user!.id; // AuthenticatedUser uses 'id' not 'userId'

    // Validate inputs
    if (!tripId || !rating) {
      return res.status(400).json({ message: "Trip ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user has a completed booking for this trip
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        tripId,
        status: "COMPLETED",
      },
    });

    if (!booking) {
      return res.status(403).json({ message: "You can only review trips you have completed." });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this trip." });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        tripId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarImage: {
              select: {
                thumbUrl: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

// Get reviews for a trip
export const getTripReviews = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        tripId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarImage: {
              select: {
                thumbUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Delete a review (Admin or Owner)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id; // AuthenticatedUser uses 'id' not 'userId'
    const userRoles = req.user!.roles;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Allow deletion if admin or if own review
    if (review.userId !== userId && !userRoles.includes("ADMIN")) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await prisma.review.delete({ where: { id } });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
