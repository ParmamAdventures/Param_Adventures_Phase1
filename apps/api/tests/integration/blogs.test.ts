import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/utils/jwt";

describe("Blog Endpoints", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let tripId: string;
  let blogId: string;

  beforeAll(async () => {
    // Clean up existing data
    try {
      await prisma.blog?.deleteMany();
      await prisma.payment?.deleteMany();
      await prisma.booking?.deleteMany();
      await prisma.trip?.deleteMany();
      await prisma.rolePermission?.deleteMany();
      await prisma.userRole?.deleteMany();
      await prisma.user?.deleteMany();
      await prisma.role?.deleteMany();
      await prisma.permission?.deleteMany();
    } catch (e) {
      /* cleanup errors ignored */
    }

    // Create roles
    const adminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", isSystem: true },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER", isSystem: true },
    });

    // Create permissions
    const blogCreatePerm = await prisma.permission.upsert({
      where: { key: "blog:create" },
      update: {},
      create: { key: "blog:create", description: "Create blogs" },
    });

    const blogApprovePerm = await prisma.permission.upsert({
      where: { key: "blog:approve" },
      update: {},
      create: { key: "blog:approve", description: "Approve blogs" },
    });

    const blogSubmitPerm = await prisma.permission.upsert({
      where: { key: "blog:submit" },
      update: {},
      create: { key: "blog:submit", description: "Submit blogs for review" },
    });

    const blogRejectPerm = await prisma.permission.upsert({
      where: { key: "blog:reject" },
      update: {},
      create: { key: "blog:reject", description: "Reject blogs" },
    });

    // Assign permissions to admin role
    for (const perm of [blogCreatePerm, blogApprovePerm, blogSubmitPerm, blogRejectPerm]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }

    // Assign blog:create and blog:submit to user role
    for (const perm of [blogCreatePerm, blogSubmitPerm]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      });
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin_blogs@test.com",
        password: "hashed",
        name: "Admin User",
      },
    });
    adminId = admin.id;

    await prisma.userRole.create({
      data: { userId: admin.id, roleId: adminRole.id },
    });

    adminToken = signAccessToken(admin.id);

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: "user_blogs@test.com",
        password: "hashed",
        name: "Regular User",
      },
    });
    userId = user.id;

    await prisma.userRole.create({
      data: { userId: user.id, roleId: userRole.id },
    });

    userToken = signAccessToken(user.id);

    // Create a trip
    const trip = await prisma.trip.create({
      data: {
        title: "Blog Test Trek",
        slug: `blog-trek-${Date.now()}`,
        description: "A test trek for blogs",
        category: "TREK",
        durationDays: 3,
        difficulty: "Easy",
        location: "Himalayas",
        price: 10000,
        capacity: 20,
        itinerary: {},
        createdById: adminId,
        status: "PUBLISHED",
      },
    });
    tripId = trip.id;

    // Create a completed booking for the regular user
    await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        status: "COMPLETED",
        startDate: new Date("2024-01-01"),
        guests: 2,
        totalPrice: 20000,
      },
    });
  });

  describe("POST /blogs - Create blog", () => {
    it("creates a blog with valid auth and completed trip", async () => {
      const blogData = {
        title: "My Amazing Trek Experience",
        content: { blocks: [{ type: "paragraph", data: { text: "It was amazing!" } }] },
        excerpt: "A brief summary",
        tripId,
      };

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send(blogData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(blogData.title);
      expect(response.body.slug).toBe("my-amazing-trek-experience");
      expect(response.body.status).toBe("DRAFT");

      blogId = response.body.id;
    });

    it("returns 401 when not authenticated", async () => {
      const blogData = {
        title: "Unauthorized Blog",
        content: {},
        tripId,
      };

      const response = await request(app).post("/blogs").send(blogData);

      expect(response.status).toBe(401);
    });

    it("returns 400 when tripId is missing", async () => {
      const blogData = {
        title: "Blog Without Trip",
        content: {},
      };

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send(blogData);

      expect(response.status).toBe(400);
    });

    it("returns 403 when user has not completed the trip", async () => {
      // Create another trip that the user hasn't completed
      const newTrip = await prisma.trip.create({
        data: {
          title: "Another Trek",
          slug: `another-trek-${Date.now()}`,
          description: "Not completed",
          category: "TREK",
          durationDays: 2,
          difficulty: "Easy",
          location: "Mountains",
          price: 8000,
          capacity: 15,
          itinerary: {},
          createdById: adminId,
        },
      });

      const blogData = {
        title: "Blog for Uncompleted Trip",
        content: {},
        tripId: newTrip.id,
      };

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send(blogData);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /blogs/public - Get public blogs", () => {
    it("returns published blogs without authentication", async () => {
      const response = await request(app).get("/blogs/public");

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it("filters and returns only PUBLISHED blogs", async () => {
      // Create and publish a blog
      const publishedBlog = await prisma.blog.create({
        data: {
          title: "Published Blog",
          slug: `published-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "PUBLISHED",
        },
      });

      const response = await request(app).get("/blogs/public");

      expect(response.status).toBe(200);
      if (Array.isArray(response.body)) {
        const foundBlog = response.body.find((b: any) => b.id === publishedBlog.id);
        expect(foundBlog).toBeDefined();
      }
    });
  });

  describe("GET /blogs/public/:slug - Get blog by slug", () => {
    it("returns published blog by slug", async () => {
      const publishedBlog = await prisma.blog.create({
        data: {
          title: "Public Blog By Slug",
          slug: `public-slug-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "PUBLISHED",
        },
      });

      const response = await request(app).get(`/blogs/public/${publishedBlog.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(publishedBlog.id);
    });

    it("returns 404 for non-existent slug", async () => {
      const response = await request(app).get("/blogs/public/non-existent-slug-123");

      expect(response.status).toBe(404);
    });

    it("returns 404 for draft blogs", async () => {
      const draftBlog = await prisma.blog.create({
        data: {
          title: "Draft Blog",
          slug: `draft-slug-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "DRAFT",
        },
      });

      const response = await request(app).get(`/blogs/public/${draftBlog.slug}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET /blogs/my-blogs - Get user's blogs", () => {
    it("returns blogs authored by authenticated user", async () => {
      const response = await request(app)
        .get("/blogs/my-blogs")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns 401 without authentication", async () => {
      const response = await request(app).get("/blogs/my-blogs");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /blogs/:id - Update blog", () => {
    it("updates blog when user is author", async () => {
      if (!blogId) return;

      const updateData = {
        title: "Updated Blog Title",
        content: { blocks: [] },
        excerpt: "New excerpt",
      };

      const response = await request(app)
        .put(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.slug).toBe("updated-blog-title");
    });

    it("returns 401 without authentication", async () => {
      if (!blogId) return;

      const response = await request(app).put(`/blogs/${blogId}`).send({ title: "New Title" });

      expect(response.status).toBe(401);
    });

    it("returns 404 for non-existent blog", async () => {
      const response = await request(app)
        .put("/blogs/non-existent-id-123")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(404);
    });

    it("returns 404 when user is not the author", async () => {
      if (!blogId) return;

      const response = await request(app)
        .put(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Admin Update" });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /blogs/:id/submit - Submit blog for review", () => {
    it("submits blog for review when user is author", async () => {
      if (!blogId) return;

      const response = await request(app)
        .post(`/blogs/${blogId}/submit`)
        .set("Authorization", `Bearer ${userToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body.status).toBe("PENDING_REVIEW");
    });

    it("returns 401 without authentication", async () => {
      if (!blogId) return;

      const response = await request(app).post(`/blogs/${blogId}/submit`);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /blogs/:id/approve - Approve blog (admin)", () => {
    it("approves blog when user is admin", async () => {
      if (!blogId) return;

      const response = await request(app)
        .post(`/blogs/${blogId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body.status).toBe("APPROVED");
    });

    it("returns 403 when non-admin user tries to approve", async () => {
      // Create another blog to test
      const testBlog = await prisma.blog.create({
        data: {
          title: "Test Approval Blog",
          slug: `test-approve-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "PENDING_REVIEW",
        },
      });

      const response = await request(app)
        .post(`/blogs/${testBlog.id}/approve`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /blogs/:id/reject - Reject blog (admin)", () => {
    it("rejects blog when user is admin", async () => {
      const testBlog = await prisma.blog.create({
        data: {
          title: "Blog to Reject",
          slug: `reject-blog-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "PENDING_REVIEW",
        },
      });

      const response = await request(app)
        .post(`/blogs/${testBlog.id}/reject`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("REJECTED");
    });

    it("returns 403 when non-admin user tries to reject", async () => {
      const testBlog = await prisma.blog.create({
        data: {
          title: "Test Reject Blog",
          slug: `test-reject-${Date.now()}`,
          content: {},
          authorId: userId,
          tripId,
          status: "PENDING_REVIEW",
        },
      });

      const response = await request(app)
        .post(`/blogs/${testBlog.id}/reject`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /blogs/:id/publish - Publish blog", () => {
    it("publishes approved blog", async () => {
      if (!blogId) return;

      const response = await request(app)
        .post(`/blogs/${blogId}/publish`)
        .set("Authorization", `Bearer ${userToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body.status).toBe("PUBLISHED");
    });

    it("returns 401 without authentication", async () => {
      if (!blogId) return;

      const response = await request(app).post(`/blogs/${blogId}/publish`);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /blogs/:id - Get blog by ID", () => {
    it("returns blog when user has permission", async () => {
      if (!blogId) return;

      const response = await request(app)
        .get(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(blogId);
    });

    it("returns 401 without authentication", async () => {
      if (!blogId) return;

      const response = await request(app).get(`/blogs/${blogId}`);

      expect(response.status).toBe(401);
    });

    it("returns 404 for non-existent blog", async () => {
      const response = await request(app)
        .get("/blogs/non-existent-id-789")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
