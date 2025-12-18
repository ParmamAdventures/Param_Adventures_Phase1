const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const base = "http://localhost:3000";

async function login(email, password = "Password123!") {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { status: res.status, body: data };
}

async function apiCall(path, token, method = "GET", body) {
  const opts = { method, headers: {} };
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${base}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, body: data };
}

(async () => {
  try {
    console.log(
      "1) Ensure ADMIN role exists and has assign/remove permissions"
    );
    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "Admin role", isSystem: false },
    });
    const assignPerm = await prisma.permission.findUnique({
      where: { key: "user:assign-role" },
    });
    const removePerm = await prisma.permission.findUnique({
      where: { key: "user:remove-role" },
    });
    if (assignPerm)
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: assignPerm.id,
          },
        },
        update: {},
        create: { roleId: adminRole.id, permissionId: assignPerm.id },
      });
    if (removePerm)
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: removePerm.id,
          },
        },
        update: {},
        create: { roleId: adminRole.id, permissionId: removePerm.id },
      });
    console.log("  ADMIN role ensured");

    // pick accounts
    const superEmail = "test+1766053638.10583@example.com";
    // create two new users: one to become ADMIN, one to act as target
    const adminEmail = `admin+${Date.now()}@example.com`;
    const targetEmail = `target+${Date.now()}@example.com`;
    console.log("2) Create admin user:", adminEmail);
    await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: "Password123!",
        name: "AdminAuto",
      }),
    });
    console.log("   Create target user:", targetEmail);
    await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: targetEmail,
        password: "Password123!",
        name: "TargetAuto",
      }),
    });

    // login super admin
    const sup = await login(superEmail);
    if (!sup.body || !sup.body.accessToken) {
      console.error("Super admin login failed", sup);
      process.exit(1);
    }
    const superToken = sup.body.accessToken;
    console.log("  Super admin logged in");

    // get users list to find ids
    const users = await apiCall("/admin/users", superToken);
    const allUsers = users.body;
    const adminUser = allUsers.find((u) => u.email === adminEmail);
    const targetUser = allUsers.find((u) => u.email === targetEmail);
    if (!adminUser || !targetUser) {
      console.error("Created users not visible in admin users list; aborting");
      process.exit(1);
    }
    const adminUserId = adminUser.id;
    const targetUserRec = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    console.log("3) Super admin assigns ADMIN to", adminEmail);
    let r = await apiCall("/admin/roles/assign", superToken, "POST", {
      userId: adminUserId,
      roleName: "ADMIN",
    });
    console.log("  assign ADMIN status", r.status, r.body);

    // login as newly created admin user
    const admLogin = await login(adminEmail);
    if (!admLogin.body || !admLogin.body.accessToken) {
      console.error("Admin login failed", admLogin);
      process.exit(1);
    }
    const adminToken = admLogin.body.accessToken;
    console.log(
      "4) Admin logged in, will assign CONTENT_MANAGER to new user (non-system)"
    );
    // ensure CONTENT_MANAGER exists
    const cm = await prisma.role.findUnique({
      where: { name: "CONTENT_MANAGER" },
    });
    if (!cm) {
      console.log("Creating CONTENT_MANAGER role");
      await prisma.role.create({
        data: {
          name: "CONTENT_MANAGER",
          description: "Content manager",
          isSystem: false,
        },
      });
    }
    r = await apiCall("/admin/roles/assign", adminToken, "POST", {
      userId: targetUserRec.id,
      roleName: "CONTENT_MANAGER",
    });
    console.log("  assign CONTENT_MANAGER by ADMIN status", r.status, r.body);

    console.log("5) Admin tries to assign SUPER_ADMIN to target (should fail)");
    r = await apiCall("/admin/roles/assign", adminToken, "POST", {
      userId: targetUserRec.id,
      roleName: "SUPER_ADMIN",
    });
    console.log("  assign SUPER_ADMIN by ADMIN status", r.status, r.body);

    console.log(
      "6) Admin tries to remove SUPER_ADMIN from existing super admin (should fail)"
    );
    // find super admin id
    const superUser = allUsers.find(
      (u) => u.roles && u.roles.includes("SUPER_ADMIN")
    );
    r = await apiCall("/admin/roles/revoke", adminToken, "POST", {
      userId: superUser.id,
      roleName: "SUPER_ADMIN",
    });
    console.log("  revoke SUPER_ADMIN by ADMIN status", r.status, r.body);

    console.log(
      "9) Super admin assigns SUPER_ADMIN to target (should succeed)"
    );
    let r2 = await apiCall("/admin/roles/assign", superToken, "POST", {
      userId: targetUserRec.id,
      roleName: "SUPER_ADMIN",
    });
    console.log("  super assign SUPER_ADMIN status", r2.status, r2.body);

    console.log("7) User attempts to assign role to self (should fail)");
    const userLogin = await login(targetEmail);
    const userToken = userLogin.body.accessToken;
    r = await apiCall("/admin/roles/assign", userToken, "POST", {
      userId: targetUserRec.id,
      roleName: "CONTENT_MANAGER",
    });
    console.log("  self-assign status", r.status, r.body);

    console.log("8) Check audit logs for ROLE_ASSIGNED entries");
    const logs = await prisma.auditLog.findMany({
      where: { action: "ROLE_ASSIGNED" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    console.log(
      "  recent ROLE_ASSIGNED logs:",
      logs.map((l) => ({
        actorId: l.actorId,
        targetId: l.targetId,
        metadata: l.metadata,
      }))
    );

    console.log("\nALL TESTS COMPLETE");
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e);
    process.exit(1);
  }
})();
