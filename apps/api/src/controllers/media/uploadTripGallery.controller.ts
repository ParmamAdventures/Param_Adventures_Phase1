import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import path from "path";
import { processAndSaveImage } from "../../media/image.processor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripGallery(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new HttpError(400, "NO_FILES", "No images uploaded");
  }

  const { tripId } = req.params;
  const uploadedPaths: string[] = [];

  // Parallel processing
  await Promise.all(
    req.files.map(async (file: Express.Multer.File) => {
      const filename = `${uuid()}.webp`;
      const outputPath = path.join(
        process.cwd(),
        "uploads",
        "trips",
        tripId,
        "gallery",
        filename
      );

      // Process image
      await processAndSaveImage(file.buffer, outputPath, 1600); // 1600px for gallery
      
      uploadedPaths.push(`/uploads/trips/${tripId}/gallery/${filename}`);
    })
  );

  // Update DB (Push to array)
  // Note: Prisma currently doesn't support atomic push easily on arrays in simple update.
  // We need to fetch, concat, and update, OR use raw query if concurrency is high.
  // For MVP, fetch-modify-save is okay, or just set if we want to append.
  // Actually, let's use a transaction to be safe or just simple update since it's admin only.
  
  const prisma = new (require("@prisma/client").PrismaClient)();

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { gallery: true } });
  if (!trip) throw new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");

  const newGallery = [...trip.gallery, ...uploadedPaths];

  await prisma.trip.update({
    where: { id: tripId },
    data: { gallery: newGallery },
  });

  res.status(201).json({
    images: uploadedPaths,
  });
}
