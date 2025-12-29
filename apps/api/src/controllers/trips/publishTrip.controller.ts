import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function publishTrip(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.status !== "APPROVED")
    return res.status(403).json({ error: "Invalid state transition" });

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_PUBLISHED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  res.json(updated);
}
