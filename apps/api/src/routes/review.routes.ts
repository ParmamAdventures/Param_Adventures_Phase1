import { Router } from "express";
import {
  createReview,
  getTripReviews,
  deleteReview,
  getFeaturedReviews,
  checkReviewEligibility,
} from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createReviewSchema, reviewIdSchema, tripReviewsSchema } from "../schemas/review.schema";

const router = Router();

// Public routes
router.get("/featured", getFeaturedReviews);
router.get("/check/:tripId", requireAuth, validate(tripReviewsSchema), checkReviewEligibility);
router.get("/:tripId", validate(tripReviewsSchema), getTripReviews);

// Protected routes
router.post("/", requireAuth, validate(createReviewSchema), createReview);
router.delete("/:id", requireAuth, validate(reviewIdSchema), deleteReview);

export default router;
