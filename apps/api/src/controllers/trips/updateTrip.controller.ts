import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateTrip(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.status !== "DRAFT")
    return res.status(403).json({ error: "Only drafts can be edited" });
  if (trip.createdById !== user.id)
    return res.status(403).json({ error: "Not owner" });

  const updated = await prisma.trip.update({
    where: { id },
    data: req.body,
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_UPDATED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  res.json(updated);
}
