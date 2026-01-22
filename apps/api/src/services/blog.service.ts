import { prisma } from "../lib/prisma";
import { logAudit, AuditAction } from "../utils/audit.helper";
import { HttpError } from "../utils/httpError";
import { slugify } from "../utils/slugify";
import { EntityStatus } from "../constants/status";
import { applyPublicOrAuthorFilter } from "../utils/queryHelpers";

export class BlogService {
  /**
   * Creates a new blog post.
   * @param data The blog data (title, content, excerpt, tripId, coverImageId).
   * @param userId The ID of the user creating the blog.
   * @returns The created blog object.
   */
  async createBlog(data: any, userId: string) {
    const { title, content, excerpt, tripId, coverImageId } = data;

    if (!tripId) {
      throw new HttpError(400, "INVALID_REQUEST", "Blogs must be linked to a completed adventure.");
    }

    // Verify user has completed the trip
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        tripId,
        status: "COMPLETED",
      },
    });

    if (!booking) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "You can only write blogs for trips you have completed.",
      );
    }

    const slug = slugify(title);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        tripId,
        coverImageId,
        authorId: userId,
      },
    });

    await logAudit({ id: userId }, AuditAction.BLOG_CREATED, "BLOG", blog.id, {
      status: blog.status,
    });

    return blog;
  }

  /**
   * Fetches a blog by ID with permission-based access.
   * @param id The blog ID.
   * @param userId Optional user ID for ownership checks.
   * @param permissions Optional permission array.
   * @returns The blog object or null if not found/unauthorized.
   */
  async getBlogById(id: string, userId?: string, permissions: string[] = []) {
    const canViewInternal =
      permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

    const whereCondition: any = { id };

    applyPublicOrAuthorFilter(whereCondition, userId, canViewInternal);

    return prisma.blog.findFirst({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        coverImage: true,
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Fetches a blog by slug with permission-based access.
   * @param slug The blog slug.
   * @param userId Optional user ID for ownership checks.
   * @param permissions Optional permission array.
   * @returns The blog object or null if not found/unauthorized.
   */
  async getBlogBySlug(slug: string, userId?: string, permissions: string[] = []) {
    const canViewInternal =
      permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

    const whereCondition: any = { slug };

    applyPublicOrAuthorFilter(whereCondition, userId, canViewInternal);

    return prisma.blog.findFirst({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        coverImage: true,
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Lists blogs with pagination and filtering.
   * @param filters Filter options (status, authorId, page, limit).
   * @param userId Optional user ID for ownership checks.
   * @param permissions Optional permission array.
   * @returns Paginated blog list.
   */
  async listBlogs(filters: any = {}, userId?: string, permissions: string[] = []) {
    const { status, authorId, page = 1, limit = 10 } = filters;
    const canViewInternal =
      permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (authorId) {
      whereCondition.authorId = authorId;
    }

    applyPublicOrAuthorFilter(whereCondition, userId, canViewInternal);

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              // avatarUrl: true, // If needed
            },
          },
          coverImage: true,
          trip: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.blog.count({ where: whereCondition }),
    ]);

    return {
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates an existing blog.
   * @param id The blog ID.
   * @param data The updated blog data.
   * @param userId The ID of the user updating the blog.
   * @returns The updated blog object.
   */
  async updateBlog(id: string, data: any, userId: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.authorId !== userId) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    const { title, content, excerpt, tripId, coverImageId } = data;

    const updateData: any = {
      title,
      content,
      excerpt,
      tripId,
      coverImageId,
      updatedAt: new Date(),
    };

    // If editing an approved or published blog, revert to pending review
    if ([EntityStatus.APPROVED, EntityStatus.PUBLISHED].includes(blog.status as any)) {
      updateData.status = EntityStatus.PENDING_REVIEW;
    }

    if (title && title !== blog.title) {
      updateData.slug = slugify(title);
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: updateData,
    });

    await logAudit({ id: userId }, AuditAction.BLOG_UPDATED, "BLOG", blog.id);

    return updated;
  }

  /**
   * Deletes a blog.
   * @param id The blog ID.
   * @param userId The ID of the user deleting the blog.
   * @param isAdmin Whether the user is an admin.
   * @returns The deleted blog object.
   */
  async deleteBlog(id: string, userId: string, isAdmin: boolean = false) {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    if (!isAdmin && blog.authorId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "You can only delete your own blogs");
    }

    const deleted = await prisma.blog.delete({ where: { id } });

    await logAudit({ id: userId }, AuditAction.BLOG_DELETED, "BLOG", id);

    return deleted;
  }

  /**
   * Submits a blog for review.
   * @param id The blog ID.
   * @param userId The ID of the user submitting the blog.
   * @returns The updated blog object.
   */
  async submitForReview(id: string, userId: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.authorId !== userId) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    if (blog.status !== EntityStatus.DRAFT && blog.status !== EntityStatus.REJECTED) {
      throw new HttpError(403, "INVALID_STATE", "Cannot submit blog in its current state");
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { status: EntityStatus.PENDING_REVIEW },
    });

    await logAudit({ id: userId }, AuditAction.BLOG_SUBMITTED, "BLOG", id);

    return updated;
  }

  /**
   * Approves a blog (admin only).
   * @param id The blog ID.
   * @param userId The ID of the admin approving the blog.
   * @returns The updated blog object.
   */
  async approveBlog(id: string, userId: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    if (blog.status !== EntityStatus.PENDING_REVIEW) {
      throw new HttpError(403, "INVALID_STATE", "Only blogs in review can be approved");
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { status: EntityStatus.APPROVED },
    });

    await logAudit({ id: userId }, AuditAction.BLOG_APPROVED, "BLOG", id);

    return updated;
  }

  /**
   * Rejects a blog (admin only).
   * @param id The blog ID.
   * @param userId The ID of the admin rejecting the blog.
   * @param reason Optional rejection reason.
   * @returns The updated blog object.
   */
  async rejectBlog(id: string, userId: string, reason?: string) {
    const updated = await prisma.blog.update({
      where: { id },
      data: { status: EntityStatus.REJECTED },
    });

    await logAudit({ id: userId }, AuditAction.BLOG_REJECTED, "BLOG", id, { reason });

    return updated;
  }

  /**
   * Publishes a blog.
   * @param id The blog ID.
   * @param userId The ID of the user publishing the blog.
   * @returns The updated blog object.
   */
  async publishBlog(id: string, userId: string) {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        status: EntityStatus.PUBLISHED,
      },
    });

    await logAudit({ id: userId }, AuditAction.BLOG_PUBLISHED, "BLOG", id);

    return updated;
  }
}

export const blogService = new BlogService();
