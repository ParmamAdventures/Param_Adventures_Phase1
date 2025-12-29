import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function approveTrip(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.status !== "PENDING_REVIEW")
    return res.status(403).json({ error: "Invalid state transition" });

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_APPROVED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  res.json(updated);
}
