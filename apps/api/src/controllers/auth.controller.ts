import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register({ email, password, name });
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    res.status(error.message === "Email already registered" ? 409 : 500).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.login(email, password);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/auth/refresh",
    });

    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

export async function loginPage(_req: Request, res: Response) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>API Login</title>
    <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem}form{max-width:360px;margin:0 auto}label{display:block;margin-top:1rem}input{width:100%;padding:.5rem;margin-top:.25rem}</style>
  </head>
  <body>
    <h1>API Login</h1>
    <form method="post" action="/auth/login">
      <label>email
        <input name="email" type="email" value="admin@local.test" required />
      </label>
      <label>password
        <input name="password" type="password" value="password123" required />
      </label>
      <div style="margin-top:1rem">
        <button type="submit">Log in</button>
      </div>
    </form>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const { accessToken } = await authService.refresh(token);
    res.json({ accessToken });
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refresh_token", {
    path: "/auth/refresh",
  });
  res.json({ message: "Logged out successfully" });
}

export async function me(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { prisma } = await import("../lib/prisma");

  const user = await (prisma.user as any).findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      bio: true,
      status: true,
      createdAt: true,
      avatarImage: true,
      preferences: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const userRoles = (user?.roles ?? []).map((r: any) => r.role.name);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: { name: { in: userRoles } } },
    include: { permission: true },
  });

  const permissions = Array.from(
    new Set(rolePermissions.map((rp) => rp.permission.key))
  );

  res.set("Cache-Control", "no-store");
  res.json({ ...user, roles: userRoles, permissions });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({ message: "If an account exists, a reset link has been sent." });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  try {
    await authService.resetPassword(token, password);
    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user.id;

  try {
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}

