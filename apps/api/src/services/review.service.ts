import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

export class ReviewService {
  /**
   * Creates a new review for a trip.
   * @param data The review data (tripId, rating, comment).
   * @param userId The ID of the user creating the review.
   * @returns The created review object.
   */
  async createReview(data: any, userId: string) {
    const { tripId, rating, comment } = data;

    // Validate required fields
    if (!tripId || rating === undefined || rating === null) {
      throw new HttpError(400, "INVALID_REQUEST", "Trip ID and rating are required");
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new HttpError(400, "INVALID_REQUEST", "Rating must be between 1 and 5");
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
      throw new HttpError(403, "FORBIDDEN", "You can only review trips you have completed.");
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
      throw new HttpError(409, "CONFLICT", "You have already reviewed this trip.");
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

    return review;
  }

  /**
   * Fetches all reviews for a specific trip.
   * @param tripId The ID of the trip.
   * @returns Array of reviews for the trip.
   */
  async getTripReviews(tripId: string) {
    return prisma.review.findMany({
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
  }

  /**
   * Fetches featured reviews (high rated, recent) for home page.
   * @param limit Optional limit for number of reviews (default: 3).
   * @returns Array of featured reviews.
   */
  async getFeaturedReviews(limit: number = 3) {
    return prisma.review.findMany({
      where: {
        rating: {
          gte: 4,
        },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            avatarImage: {
              select: {
                thumbUrl: true,
              },
            },
          },
        },
        trip: {
          select: {
            title: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Deletes a review.
   * @param id The review ID.
   * @param userId The ID of the user requesting deletion.
   * @param isAdmin Whether the user is an admin.
   * @returns The deleted review object.
   */
  async deleteReview(id: string, userId: string, isAdmin: boolean = false) {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new HttpError(404, "NOT_FOUND", "Review not found");
    }

    // Allow deletion if admin or if own review
    if (review.userId !== userId && !isAdmin) {
      throw new HttpError(403, "FORBIDDEN", "Not authorized to delete this review");
    }

    return prisma.review.delete({ where: { id } });
  }

  /**
   * Checks if a user is eligible to review a trip.
   * @param tripId The ID of the trip.
   * @param userId The ID of the user.
   * @returns Eligibility status and reason.
   */
  async checkEligibility(tripId: string, userId: string) {
    // 1. Check for Completed Booking
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        tripId,
        status: "COMPLETED",
      },
    });

    if (!booking) {
      return {
        eligible: false,
        reason: "You typically need to complete a trip to review it.",
      };
    }

    // 2. Check for Existing Review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
    });

    if (existingReview) {
      return {
        eligible: false,
        reason: "You have already reviewed this trip.",
      };
    }

    return { eligible: true };
  }
}

export const reviewService = new ReviewService();
