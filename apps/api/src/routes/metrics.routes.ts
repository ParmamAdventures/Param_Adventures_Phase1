import { Router } from "express";
import { getWebhookMetrics } from "../metrics/webhookMetrics";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";

const router = Router();

router.get(
  "/webhooks",
  requireAuth,
  attachPermissions,
  requirePermission("metrics:read"),
  (_req, res) => {
    res.json(getWebhookMetrics());
  },
);

export default router;
