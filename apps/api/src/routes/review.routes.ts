import { Router } from "express";
import { createReview, getTripReviews, deleteReview, getFeaturedReviews, checkReviewEligibility } from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/featured", getFeaturedReviews);
router.get("/check/:tripId", requireAuth, checkReviewEligibility); // Check eligibility
router.get("/:tripId", getTripReviews);

// Protected routes
router.post("/", requireAuth, createReview);
router.delete("/:id", requireAuth, deleteReview);

export default router;
