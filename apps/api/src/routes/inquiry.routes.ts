import { Router } from "express";
import { createInquiry } from "../controllers/inquiry.controller";

import { validate } from "../middlewares/validate.middleware";
import { createInquirySchema } from "../schemas/inquiry.schema";

const router = Router();

router.post("/", validate(createInquirySchema), createInquiry);

export default router;
