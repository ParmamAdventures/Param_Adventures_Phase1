jest.mock("../../src/lib/prisma");

import { prisma } from "../../src/lib/prisma";
import { ReviewService } from "../../src/services/review.service";

describe("ReviewService", () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    jest.clearAllMocks();
    reviewService = new ReviewService();
  });

  describe("createReview", () => {
    it("creates a review with valid data", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
        rating: 5,
        comment: "Amazing trek! Highly recommended.",
      };

      const mockBooking = {
        id: "booking_123",
        userId,
        tripId: reviewData.tripId,
        status: "COMPLETED",
      };

      const mockReview = {
        id: "review_123",
        userId,
        tripId: reviewData.tripId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date(),
        user: {
          id: userId,
          name: "Test User",
          avatarImage: null,
        },
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.review.create as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewService.createReview(reviewData, userId);

      expect(prisma.booking.findFirst as jest.Mock).toHaveBeenCalledWith({
        where: {
          userId,
          tripId: reviewData.tripId,
          status: "COMPLETED",
        },
      });

      expect(prisma.review.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: {
          userId_tripId: {
            userId,
            tripId: reviewData.tripId,
          },
        },
      });

      expect(prisma.review.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            tripId: reviewData.tripId,
            rating: 5,
            comment: reviewData.comment,
          }),
        }),
      );

      expect(result.id).toBe("review_123");
      expect(result.rating).toBe(5);
    });

    it("throws error when tripId is missing", async () => {
      const userId = "user_123";
      const reviewData = {
        rating: 5,
      };

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "Trip ID and rating are required",
      );
    });

    it("throws error when rating is missing", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
      };

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "Trip ID and rating are required",
      );
    });

    it("throws error when rating is too high", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
        rating: 6,
      };

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "Rating must be between 1 and 5",
      );
    });

    it("throws error when rating is too low", async () => {
      const userId = "user_123";
      const reviewDataLow = {
        tripId: "trip_123",
        rating: 0,
      };

      await expect(reviewService.createReview(reviewDataLow, userId)).rejects.toThrow(
        "Rating must be between 1 and 5",
      );
    });

    it("throws error when user has not completed the trip", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
        rating: 5,
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "You can only review trips you have completed.",
      );
    });

    it("throws error when user has already reviewed the trip", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
        rating: 5,
      };

      const mockBooking = { id: "booking_123" };
      const mockExistingReview = {
        id: "review_existing",
        userId,
        tripId: reviewData.tripId,
        rating: 4,
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockExistingReview);

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "You have already reviewed this trip.",
      );
    });

    it("propagates creation errors", async () => {
      const userId = "user_123";
      const reviewData = {
        tripId: "trip_123",
        rating: 5,
      };
      const error = new Error("Database error");

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: "booking_123" });
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.review.create as jest.Mock).mockRejectedValue(error);

      await expect(reviewService.createReview(reviewData, userId)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getTripReviews", () => {
    it("retrieves all reviews for a trip", async () => {
      const tripId = "trip_123";
      const mockReviews = [
        {
          id: "review_1",
          tripId,
          rating: 5,
          comment: "Great trek!",
          user: { id: "user_1", name: "User One", avatarImage: null },
          createdAt: new Date("2024-01-02"),
        },
        {
          id: "review_2",
          tripId,
          rating: 4,
          comment: "Good experience",
          user: { id: "user_2", name: "User Two", avatarImage: null },
          createdAt: new Date("2024-01-01"),
        },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await reviewService.getTripReviews(tripId);

      expect(prisma.review.findMany as jest.Mock).toHaveBeenCalledWith({
        where: { tripId },
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

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("review_1");
      expect(result[1].id).toBe("review_2");
    });

    it("returns empty array when no reviews exist", async () => {
      const tripId = "trip_no_reviews";

      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);

      const result = await reviewService.getTripReviews(tripId);

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedReviews", () => {
    it("retrieves featured reviews with default limit", async () => {
      const mockReviews = [
        {
          id: "review_1",
          rating: 5,
          user: { name: "User One", avatarImage: null },
          trip: { title: "Trek 1", location: "Himalayas" },
        },
        {
          id: "review_2",
          rating: 4,
          user: { name: "User Two", avatarImage: null },
          trip: { title: "Trek 2", location: "Alps" },
        },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await reviewService.getFeaturedReviews();

      expect(prisma.review.findMany as jest.Mock).toHaveBeenCalledWith({
        where: {
          rating: {
            gte: 4,
          },
        },
        take: 3,
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

      expect(result).toHaveLength(2);
    });

    it("retrieves featured reviews with custom limit", async () => {
      const mockReviews = [
        { id: "review_1", rating: 5 },
        { id: "review_2", rating: 5 },
        { id: "review_3", rating: 4 },
        { id: "review_4", rating: 5 },
        { id: "review_5", rating: 4 },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      await reviewService.getFeaturedReviews(5);

      expect(prisma.review.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });
  });

  describe("deleteReview", () => {
    it("deletes review when user is the author", async () => {
      const reviewId = "review_123";
      const userId = "user_123";

      const mockReview = {
        id: reviewId,
        userId,
        tripId: "trip_123",
        rating: 5,
      };

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (prisma.review.delete as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewService.deleteReview(reviewId, userId);

      expect(prisma.review.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: reviewId },
      });
      expect(result.id).toBe(reviewId);
    });

    it("deletes review when user is admin", async () => {
      const reviewId = "review_123";
      const userId = "admin_456";

      const mockReview = {
        id: reviewId,
        userId: "different_user",
        tripId: "trip_123",
        rating: 5,
      };

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (prisma.review.delete as jest.Mock).mockResolvedValue(mockReview);

      await reviewService.deleteReview(reviewId, userId, true);

      expect(prisma.review.delete as jest.Mock).toHaveBeenCalled();
    });

    it("throws error when user is not author or admin", async () => {
      const reviewId = "review_123";
      const userId = "unauthorized_user";

      const mockReview = {
        id: reviewId,
        userId: "different_user",
        tripId: "trip_123",
        rating: 5,
      };

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      await expect(reviewService.deleteReview(reviewId, userId, false)).rejects.toThrow(
        "Not authorized to delete this review",
      );
    });

    it("throws error when review not found", async () => {
      const reviewId = "non_existent";
      const userId = "user_123";

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.deleteReview(reviewId, userId)).rejects.toThrow(
        "Review not found",
      );
    });
  });

  describe("checkEligibility", () => {
    it("returns eligible when user has completed trip and not reviewed", async () => {
      const tripId = "trip_123";
      const userId = "user_123";

      const mockBooking = {
        id: "booking_123",
        userId,
        tripId,
        status: "COMPLETED",
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await reviewService.checkEligibility(tripId, userId);

      expect(result).toEqual({ eligible: true });
    });

    it("returns not eligible when user has not completed trip", async () => {
      const tripId = "trip_123";
      const userId = "user_123";

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await reviewService.checkEligibility(tripId, userId);

      expect(result).toEqual({
        eligible: false,
        reason: "You typically need to complete a trip to review it.",
      });
    });

    it("returns not eligible when user has already reviewed trip", async () => {
      const tripId = "trip_123";
      const userId = "user_123";

      const mockBooking = { id: "booking_123" };
      const mockReview = {
        id: "review_123",
        userId,
        tripId,
        rating: 5,
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewService.checkEligibility(tripId, userId);

      expect(result).toEqual({
        eligible: false,
        reason: "You have already reviewed this trip.",
      });
    });
  });
});
