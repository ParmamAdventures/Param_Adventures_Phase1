import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      roles: u.roles.map((r) => r.role.name),
      createdAt: u.createdAt,
    }))
  );
}
