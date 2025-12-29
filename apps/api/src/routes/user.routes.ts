import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { updateProfile } from "../controllers/user.controller";
import { getGuideTrips } from "../controllers/admin/getGuideTrips.controller";

const router = Router();

router.get("/profile", requireAuth, (req, res) => {
  res.json(req.user);
});

router.patch("/profile", requireAuth, updateProfile);
router.get("/guide/trips", requireAuth, getGuideTrips);

export default router;
