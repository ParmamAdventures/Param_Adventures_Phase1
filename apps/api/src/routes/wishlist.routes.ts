import { Router } from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlist.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { toggleWishlistSchema } from "../schemas/wishlist.schema";

const router = Router();

// Protected routes
router.use(requireAuth);

router.get("/", getWishlist);
router.post("/toggle", validate(toggleWishlistSchema), toggleWishlist);

export default router;
