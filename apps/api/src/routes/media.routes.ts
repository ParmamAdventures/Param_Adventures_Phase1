import { Router } from "express";
import { upload } from "../media/multer.config";
import { uploadTripCover } from "../controllers/media/uploadTripCover.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

const router = Router();

router.post(
  "/trips/:tripId/cover",
  requireAuth,
  requirePermission("trip:update"),
  upload.single("image"),
  uploadTripCover
);

router.post(
  "/trips/:tripId/gallery",
  requireAuth,
  requirePermission("trip:update"),
  upload.array("images", 6), // Max 6 images
  uploadTripGallery
);

export default router;
