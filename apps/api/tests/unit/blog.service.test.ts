jest.mock("../../src/lib/prisma");
jest.mock("../../src/services/audit.service");

import { prisma } from "../../src/lib/prisma";
import { auditService } from "../../src/services/audit.service";
import { BlogService } from "../../src/services/blog.service";
import { HttpError } from "../../src/utils/httpError";

describe("BlogService", () => {
  let blogService: BlogService;

  beforeEach(() => {
    jest.clearAllMocks();
    blogService = new BlogService();
    (auditService.logAudit as jest.Mock).mockResolvedValue({ id: "audit_123" });
  });

  describe("createBlog", () => {
    it("creates a blog with valid data", async () => {
      const userId = "user_123";
      const blogData = {
        title: "My Amazing Trek Experience",
        content: { blocks: [{ type: "paragraph", data: { text: "It was great!" } }] },
        excerpt: "A brief summary",
        tripId: "trip_123",
        coverImageId: "img_123",
      };

      const mockBooking = {
        id: "booking_123",
        userId,
        tripId: "trip_123",
        status: "COMPLETED",
      };

      const mockBlog = {
        id: "blog_123",
        title: blogData.title,
        slug: "my-amazing-trek-experience",
        content: blogData.content,
        excerpt: blogData.excerpt,
        tripId: blogData.tripId,
        coverImageId: blogData.coverImageId,
        authorId: userId,
        status: "DRAFT",
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.blog.create as jest.Mock).mockResolvedValue(mockBlog);

      const result = await blogService.createBlog(blogData, userId);

      expect(prisma.booking.findFirst as jest.Mock).toHaveBeenCalledWith({
        where: {
          userId,
          tripId: "trip_123",
          status: "COMPLETED",
        },
      });

      expect(prisma.blog.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: blogData.title,
            slug: "my-amazing-trek-experience",
            authorId: userId,
          }),
        }),
      );

      expect(result.id).toBe("blog_123");
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: userId,
          action: "BLOG_CREATED",
          targetType: "BLOG",
          targetId: "blog_123",
        }),
      );
    });

    it("throws error when tripId is missing", async () => {
      const userId = "user_123";
      const blogData = {
        title: "My Blog",
        content: {},
      };

      await expect(blogService.createBlog(blogData, userId)).rejects.toThrow(
        "Blogs must be linked to a completed adventure.",
      );
    });

    it("throws error when user has not completed the trip", async () => {
      const userId = "user_123";
      const blogData = {
        title: "My Blog",
        content: {},
        tripId: "trip_123",
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(blogService.createBlog(blogData, userId)).rejects.toThrow(
        "You can only write blogs for trips you have completed.",
      );
    });

    it("generates slug from title", async () => {
      const userId = "user_123";
      const blogData = {
        title: "Amazing Trek To Himalayas!",
        content: {},
        tripId: "trip_123",
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: "booking_123" });
      (prisma.blog.create as jest.Mock).mockResolvedValue({
        id: "blog_123",
        slug: "amazing-trek-to-himalayas",
      });

      await blogService.createBlog(blogData, userId);

      expect(prisma.blog.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: "amazing-trek-to-himalayas",
          }),
        }),
      );
    });

    it("logs audit event after successful creation", async () => {
      const userId = "user_audit";
      const blogData = {
        title: "Audit Blog",
        content: {},
        tripId: "trip_123",
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: "booking_123" });
      (prisma.blog.create as jest.Mock).mockResolvedValue({
        id: "blog_audit",
        status: "DRAFT",
      });

      await blogService.createBlog(blogData, userId);

      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith({
        actorId: userId,
        action: "BLOG_CREATED",
        targetType: "BLOG",
        targetId: "blog_audit",
        metadata: { status: "DRAFT" },
      });
    });

    it("propagates creation errors", async () => {
      const userId = "user_123";
      const blogData = { title: "Bad Blog", content: {}, tripId: "trip_123" };
      const error = new Error("Database constraint violation");

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: "booking_123" });
      (prisma.blog.create as jest.Mock).mockRejectedValue(error);

      await expect(blogService.createBlog(blogData, userId)).rejects.toThrow(
        "Database constraint violation",
      );
    });
  });

  describe("getBlogById", () => {
    it("retrieves blog by ID with all relations", async () => {
      const blogId = "blog_123";
      const mockBlog = {
        id: blogId,
        title: "My Blog",
        slug: "my-blog",
        status: "PUBLISHED",
        author: { id: "user_1", name: "John Doe" },
        coverImage: { id: "img_1", url: "cover.jpg" },
        trip: { id: "trip_1", title: "Trek", slug: "trek" },
      };

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue(mockBlog);

      const result = await blogService.getBlogById(blogId);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: blogId }),
        include: {
          author: { select: { id: true, name: true } },
          coverImage: true,
          trip: { select: { id: true, title: true, slug: true } },
        },
      });
      expect(result!.id).toBe(blogId);
    });

    it("filters by PUBLISHED status for public users", async () => {
      const blogId = "blog_123";

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue(null);

      await blogService.getBlogById(blogId);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
          }),
        }),
      );
    });

    it("allows author to view own drafts", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.getBlogById(blogId, userId);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ status: "PUBLISHED" }, { authorId: userId }],
          }),
        }),
      );
    });

    it("allows admin to view all blogs", async () => {
      const blogId = "blog_123";
      const permissions = ["blog:approve"];

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.getBlogById(blogId, undefined, permissions);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: blogId },
        }),
      );
    });
  });

  describe("getBlogBySlug", () => {
    it("retrieves blog by slug", async () => {
      const slug = "my-trek-blog";
      const mockBlog = {
        id: "blog_123",
        slug,
        status: "PUBLISHED",
      };

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue(mockBlog);

      const result = await blogService.getBlogBySlug(slug);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ slug }),
        }),
      );
      expect(result!.slug).toBe(slug);
    });

    it("filters by PUBLISHED status for public users", async () => {
      const slug = "my-blog";

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue(null);

      await blogService.getBlogBySlug(slug);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
          }),
        }),
      );
    });

    it("allows admin to view all statuses", async () => {
      const slug = "draft-blog";
      const permissions = ["blog:view:internal"];

      (prisma.blog.findFirst as jest.Mock).mockResolvedValue({ id: "blog_123" });

      await blogService.getBlogBySlug(slug, undefined, permissions);

      expect(prisma.blog.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug },
        }),
      );
    });

    it("returns null for invalid slug", async () => {
      (prisma.blog.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await blogService.getBlogBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateBlog", () => {
    it("updates blog with new data", async () => {
      const blogId = "blog_update_1";
      const userId = "user_123";
      const updateData = {
        title: "Updated Blog Title",
        content: { blocks: [] },
        excerpt: "New excerpt",
      };

      const mockBlog = {
        id: blogId,
        authorId: userId,
        title: "Old Title",
        status: "DRAFT",
      };

      const mockUpdatedBlog = {
        id: blogId,
        ...updateData,
        slug: "updated-blog-title",
        status: "DRAFT",
      };

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue(mockBlog);
      (prisma.blog.update as jest.Mock).mockResolvedValue(mockUpdatedBlog);

      const result = await blogService.updateBlog(blogId, updateData, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
        data: expect.objectContaining({
          title: updateData.title,
          content: updateData.content,
          excerpt: updateData.excerpt,
        }),
      });
      expect(result.title).toBe("Updated Blog Title");
    });

    it("regenerates slug when title changes", async () => {
      const blogId = "blog_123";
      const userId = "user_123";
      const updateData = { title: "New Title Here!" };

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: userId,
        title: "Old Title",
        status: "DRAFT",
      });
      (prisma.blog.update as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.updateBlog(blogId, updateData, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: "new-title-here",
          }),
        }),
      );
    });

    it("reverts to PENDING_REVIEW if blog was APPROVED", async () => {
      const blogId = "blog_123";
      const userId = "user_123";
      const updateData = { title: "Updated" };

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: userId,
        title: "Original",
        status: "APPROVED",
      });
      (prisma.blog.update as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.updateBlog(blogId, updateData, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING_REVIEW",
          }),
        }),
      );
    });

    it("throws error when blog not found or not owned by user", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(blogService.updateBlog(blogId, {}, userId)).rejects.toThrow("Blog not found");
    });

    it("propagates update errors", async () => {
      const blogId = "blog_123";
      const userId = "user_123";
      const error = new Error("Update failed");

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: userId,
      });
      (prisma.blog.update as jest.Mock).mockRejectedValue(error);

      await expect(blogService.updateBlog(blogId, { title: "Test" }, userId)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("submitForReview", () => {
    it("changes status to PENDING_REVIEW", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: userId,
        status: "DRAFT",
      });
      (prisma.blog.update as jest.Mock).mockResolvedValue({
        id: blogId,
        status: "PENDING_REVIEW",
      });

      const result = await blogService.submitForReview(blogId, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
        data: { status: "PENDING_REVIEW" },
      });
      expect(result.status).toBe("PENDING_REVIEW");
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "BLOG_SUBMITTED",
        }),
      );
    });

    it("validates author ownership", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: "different_user",
      });

      await expect(blogService.submitForReview(blogId, userId)).rejects.toThrow("Blog not found");
    });
  });

  describe("approveBlog", () => {
    it("changes status to APPROVED", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";

      (prisma.blog.update as jest.Mock).mockResolvedValue({
        id: blogId,
        status: "APPROVED",
      });

      const result = await blogService.approveBlog(blogId, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
        data: { status: "APPROVED" },
      });
      expect(result.status).toBe("APPROVED");
    });

    it("logs audit event", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";

      (prisma.blog.update as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.approveBlog(blogId, userId);

      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith({
        actorId: userId,
        action: "BLOG_APPROVED",
        targetType: "BLOG",
        targetId: blogId,
      });
    });

    it("propagates errors", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";
      const error = new Error("Blog not found");

      (prisma.blog.update as jest.Mock).mockRejectedValue(error);

      await expect(blogService.approveBlog(blogId, userId)).rejects.toThrow("Blog not found");
    });
  });

  describe("rejectBlog", () => {
    it("changes status to REJECTED", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";
      const reason = "Content needs improvement";

      (prisma.blog.update as jest.Mock).mockResolvedValue({
        id: blogId,
        status: "REJECTED",
      });

      const result = await blogService.rejectBlog(blogId, userId, reason);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
        data: { status: "REJECTED" },
      });
      expect(result.status).toBe("REJECTED");
    });

    it("logs rejection reason in audit", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";
      const reason = "Inappropriate content";

      (prisma.blog.update as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.rejectBlog(blogId, userId, reason);

      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { reason },
        }),
      );
    });
  });

  describe("publishBlog", () => {
    it("changes status to PUBLISHED", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        status: "APPROVED",
      });
      (prisma.blog.update as jest.Mock).mockResolvedValue({
        id: blogId,
        status: "PUBLISHED",
      });

      const result = await blogService.publishBlog(blogId, userId);

      expect(prisma.blog.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
        data: { status: "PUBLISHED" },
      });
      expect(result.status).toBe("PUBLISHED");
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "BLOG_PUBLISHED",
        }),
      );
    });

    it("throws error when blog not found", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(blogService.publishBlog(blogId, userId)).rejects.toThrow("Blog not found");
    });
  });

  describe("deleteBlog", () => {
    it("deletes blog when user is author", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: userId,
      });
      (prisma.blog.delete as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.deleteBlog(blogId, userId);

      expect(prisma.blog.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: blogId },
      });
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "BLOG_DELETED",
        }),
      );
    });

    it("deletes blog when user is admin", async () => {
      const blogId = "blog_123";
      const userId = "admin_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: "different_user",
      });
      (prisma.blog.delete as jest.Mock).mockResolvedValue({ id: blogId });

      await blogService.deleteBlog(blogId, userId, true);

      expect(prisma.blog.delete as jest.Mock).toHaveBeenCalled();
    });

    it("throws error when user is not author or admin", async () => {
      const blogId = "blog_123";
      const userId = "user_123";

      (prisma.blog.findUnique as jest.Mock).mockResolvedValue({
        id: blogId,
        authorId: "different_user",
      });

      await expect(blogService.deleteBlog(blogId, userId, false)).rejects.toThrow(
        "You can only delete your own blogs",
      );
    });
  });

  describe("listBlogs", () => {
    it("returns paginated blog list", async () => {
      const mockBlogs = [
        { id: "blog_1", title: "Blog 1" },
        { id: "blog_2", title: "Blog 2" },
      ];

      (prisma.blog.findMany as jest.Mock).mockResolvedValue(mockBlogs);
      (prisma.blog.count as jest.Mock).mockResolvedValue(2);

      const result = await blogService.listBlogs({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("filters by status when provided", async () => {
      (prisma.blog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.blog.count as jest.Mock).mockResolvedValue(0);

      await blogService.listBlogs({ status: "PUBLISHED" });

      expect(prisma.blog.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
          }),
        }),
      );
    });

    it("filters by authorId when provided", async () => {
      const authorId = "user_123";

      (prisma.blog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.blog.count as jest.Mock).mockResolvedValue(0);

      await blogService.listBlogs({ authorId });

      expect(prisma.blog.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId,
          }),
        }),
      );
    });

    it("allows admin to view all blogs", async () => {
      const permissions = ["blog:approve"];

      (prisma.blog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.blog.count as jest.Mock).mockResolvedValue(0);

      await blogService.listBlogs({}, undefined, permissions);

      expect(prisma.blog.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });
});
