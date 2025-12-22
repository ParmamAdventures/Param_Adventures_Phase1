import { Router } from "express";
import { upload as legacyUpload } from "../utils/multer.config";
import { upload } from "../middlewares/upload.middleware";
import { uploadTripCover } from "../controllers/media/uploadTripCover.controller";
import { uploadTripGallery } from "../controllers/media/uploadTripGallery.controller";
import { setTripCoverImage } from "../controllers/media/setTripCoverImage.controller";
import { addTripGalleryImage } from "../controllers/media/addTripGalleryImage.controller";
import { setTripGallery } from "../controllers/media/setTripGallery.controller";
import { uploadImage } from "../controllers/mediaUpload.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

const router = Router();

/**
 * POST /media/upload
 * multipart/form-data
 * field: file
 */
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  uploadImage
);

router.post(
  "/trips/:tripId/cover",
  requireAuth,
  requirePermission("trip:edit"),
  legacyUpload.single("image"),
  uploadTripCover
);

router.post(
  "/trips/:tripId/gallery",
  requireAuth,
  requirePermission("trip:edit"),
  legacyUpload.array("images", 6), // Max 6 images
  uploadTripGallery
);

// New attachment endpoints
router.post(
  "/trips/:tripId/cover/attach",
  requireAuth,
  requirePermission("trip:edit"),
  setTripCoverImage
);

router.post(
  "/trips/:tripId/gallery/attach",
  requireAuth,
  requirePermission("trip:edit"),
  addTripGalleryImage
);

router.post(
  "/trips/:tripId/gallery",
  requireAuth,
  requirePermission("trip:edit"),
  setTripGallery
);

export default router;
