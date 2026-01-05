import { Router } from "express";
import { getTripReviews } from "../controllers/reviews/getTripReviews.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { createReview } from "../controllers/reviews/createReview.controller";
import { checkReviewEligibility } from "../controllers/reviews/checkReviewEligibility.controller";

const router = Router();

// Public read access
router.get("/:tripId", getTripReviews);

router.get("/check/:tripId", requireAuth, checkReviewEligibility);
router.post("/", requireAuth, createReview); 

export default router;
