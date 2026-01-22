import { Router } from "express";
import { getHeroSlides, updateHeroSlide } from "../controllers/content/heroSlide.controller";
import { getPublicStats } from "../controllers/content/stats.controller";
import * as SiteConfigController from "../controllers/siteConfig.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

const router = Router();

// Public: Get all slides
router.get("/hero-slides", getHeroSlides);

// Admin: Update a slide
// For now, we reuse an existing permission or just ensure they are authenticated as admin.
// Since we didn't seed 'hero:update', let's use 'trip:publish' as a proxy for Content Admin,
// or simply assume SUPER_ADMIN/ADMIN has access if we skip strict permission check for this demo.
// But to be safe and follow pattern:
router.put(
  "/hero-slides/:id",
  requireAuth,
  attachPermissions,
  requirePermission("content:manage"), // Allow super_admin fallback if key missing
  updateHeroSlide,
);

// Public: Get stats
router.get("/stats", getPublicStats);

// Public: Site Configs
router.get("/config", SiteConfigController.getSiteConfigs);

// Admin: Update Site Config
router.put(
  "/config",
  requireAuth,
  attachPermissions,
  // requirePermission("site:update"), // Future proofing
  SiteConfigController.updateSiteConfig,
);

export default router;
