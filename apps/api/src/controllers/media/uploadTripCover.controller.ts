import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import path from "path";
import { processAndSaveImage } from "../../media/image.processor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripCover(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "NO_FILE", "No image uploaded");
  }

  const { tripId } = req.params;
  const filename = `${uuid()}.webp`;

  const outputPath = path.join(
    process.cwd(),
    "uploads",
    "trips",
    tripId,
    "cover",
    filename
  );

  await processAndSaveImage(req.file.buffer, outputPath, 1200);

  // Save path to DB
  const imagePath = `/uploads/trips/${tripId}/cover/${filename}`;
  const prisma = new (require("@prisma/client").PrismaClient)(); // Use shared instance in real app
  
  await prisma.trip.update({
    where: { id: tripId },
    data: { coverImage: imagePath },
  });

  res.status(201).json({
    image: imagePath,
  });
}
