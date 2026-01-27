import { Router } from "express";
import {
  getServerConfigurations,
  getConfigByCategory,
  updateServerConfiguration,
  validateConfiguration,
} from "../../controllers/admin/server-config.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

/**
 * Get all server configurations (grouped by category)
 * GET /admin/server-config
 * Permission: admin:settings
 */
router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("admin:settings"),
  getServerConfigurations,
);

/**
 * Get configurations by category
 * GET /admin/server-config/:category
 * Permission: admin:settings
 */
router.get(
  "/:category",
  requireAuth,
  attachPermissions,
  requirePermission("admin:settings"),
  getConfigByCategory,
);

/**
 * Update a configuration
 * PUT /admin/server-config
 * Permission: admin:settings
 * Body: { category, key, value, description?, dataType?, isEncrypted? }
 */
router.put(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("admin:settings"),
  updateServerConfiguration,
);

/**
 * Validate configuration (test connectivity)
 * POST /admin/server-config/validate
 * Permission: admin:settings
 * Body: { category, configs: {...} }
 */
router.post(
  "/validate",
  requireAuth,
  attachPermissions,
  requirePermission("admin:settings"),
  validateConfiguration,
);

export default router;
