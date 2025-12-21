import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

import { createBlog } from "../controllers/blogs/createBlog.controller";
import { updateBlog } from "../controllers/blogs/updateBlog.controller";
import { submitBlog } from "../controllers/blogs/submitBlog.controller";
import { approveBlog } from "../controllers/blogs/approveBlog.controller";
import { rejectBlog } from "../controllers/blogs/rejectBlog.controller";
import { getPublicBlogs } from "../controllers/blogs/getPublicBlogs.controller";
import { getBlogBySlug } from "../controllers/blogs/getBlogBySlug.controller";

const router = Router();

// Public routes
router.get("/public", getPublicBlogs);
router.get("/public/:slug", getBlogBySlug);

// Protected routes
router.post("/", requireAuth, requirePermission("blog:create"), createBlog);
router.put("/:id", requireAuth, requirePermission("blog:update"), updateBlog);
router.post("/:id/submit", requireAuth, requirePermission("blog:submit"), submitBlog);

// Admin-only moderation routes
router.post("/:id/approve", requireAuth, requirePermission("blog:approve"), approveBlog);
router.post("/:id/reject", requireAuth, requirePermission("blog:reject"), rejectBlog);

export default router;
