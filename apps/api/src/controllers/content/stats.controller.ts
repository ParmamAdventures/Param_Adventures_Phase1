import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getPublicStats = async (_req: Request, res: Response) => {
  try {
    const [userCount, tripCount] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count({ where: { status: "PUBLISHED" } }),
    ]);

    // For "Years of Experience" and "Safety Record", we'll keep them static or
    // fetch from a config if we had one. For now, hardcode the static ones here
    // so the frontend receives a unified object.

    // NOTE: userCount might be small (e.g. 5) so we might want to fake it for demo
    // if the user requested "Happy Travelers" which implies a lot.
    // But the user asked for "dynamic", so I will return real numbers.
    // If they look too small, the user might ask to "fake" them or use a multiplier.
    // For now, I'll return real numbers.

    res.json({
      travelers: userCount,
      destinations: tripCount,
      years: 12, // Static
      safety: 100, // Static
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
