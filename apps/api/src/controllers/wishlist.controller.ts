import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Toggle Wishlist (Add/Remove)
export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.body;
    const userId = req.user!.id;

    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required" });
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if already saved using composite key
    const existing = await prisma.savedTrip.findUnique({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
    });

    if (existing) {
      // Remove
      await prisma.savedTrip.delete({
        where: {
          userId_tripId: {
            userId,
            tripId,
          },
        },
      });
      return res.json({ message: "Removed from wishlist", saved: false });
    } else {
      // Add
      await prisma.savedTrip.create({
        data: {
          userId,
          tripId,
        },
      });
      return res.status(201).json({ message: "Added to wishlist", saved: true });
    }
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};

// Get User's Wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const savedTrips = await prisma.savedTrip.findMany({
      where: {
        userId,
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationDays: true,
            price: true,
            location: true,
            coverImage: {
              select: {
                mediumUrl: true,
              },
            },
            category: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to return list of trips
    const trips = savedTrips.map((st) => st.trip);

    res.json(trips);
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};
