import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

import { createBlog } from "../controllers/blogs/createBlog.controller";
import { updateBlog } from "../controllers/blogs/updateBlog.controller";
import { submitBlog } from "../controllers/blogs/submitBlog.controller";
import { approveBlog } from "../controllers/blogs/approveBlog.controller";
import { publishBlog } from "../controllers/blogs/publishBlog.controller";
import { rejectBlog } from "../controllers/blogs/rejectBlog.controller";
import { getPublicBlogs } from "../controllers/blogs/getPublicBlogs.controller";
import { getBlogBySlug } from "../controllers/blogs/getBlogBySlug.controller";
import { getBlogs } from "../controllers/blogs/getBlogs.controller";
import { getBlogById } from "../controllers/blogs/getBlogById.controller";
import { getMyBlogs } from "../controllers/blogs/getMyBlogs.controller";

const router = Router();

// Public routes
router.get("/public", getPublicBlogs);
router.get("/public/:slug", getBlogBySlug);

// Protected routes
router.get("/my-blogs", requireAuth, attachPermissions, getMyBlogs);
router.post("/", requireAuth, attachPermissions, requirePermission("blog:create"), createBlog);
router.put("/:id", requireAuth, attachPermissions, requirePermission("blog:update"), updateBlog);
router.post("/:id/submit", requireAuth, attachPermissions, requirePermission("blog:submit"), submitBlog);

// Admin-only moderation routes
router.get("/", requireAuth, attachPermissions, requirePermission("blog:approve"), getBlogs);
router.post("/:id/approve", requireAuth, attachPermissions, requirePermission("blog:approve"), approveBlog);
router.post("/:id/publish", requireAuth, attachPermissions, requirePermission("blog:publish"), publishBlog);
router.post("/:id/reject", requireAuth, attachPermissions, requirePermission("blog:reject"), rejectBlog);

// General authenticated route (permission checked in controller)
router.get("/:id", requireAuth, attachPermissions, getBlogById);

export default router;
