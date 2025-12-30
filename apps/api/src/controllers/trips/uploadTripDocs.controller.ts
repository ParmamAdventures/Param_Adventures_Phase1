import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";

export const uploadTripDocs = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  // Expecting body: { type: "GROUP_PHOTO" | "REPORT" | "OTHER", url: string, description?: string }
  const { type, url, description } = req.body;

  if (!url || !type) {
    throw new HttpError(400, "INVALID_REQUEST", "URL and Type are required");
  }

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", "Trip not found");
  }

  // Authz: Guide assigned to trip OR Manager/Admin
  const isAssignedGuide = await prisma.tripsOnGuides.findUnique({
      where: { tripId_guideId: { tripId: id, guideId: userId } }
  });
  
  const isManager = trip.managerId === userId;
  const isAdmin = req.user?.roles.includes("ADMIN") || req.user?.roles.includes("SUPER_ADMIN");

  if (!isAssignedGuide && !isManager && !isAdmin) {
      throw new HttpError(403, "FORBIDDEN", "You are not authorized to upload docs for this trip");
  }

  // Append to existing docs safely
  let existingDocs: any[] = [];
  if (Array.isArray(trip.documentation)) {
      existingDocs = trip.documentation as any[];
  } else if (trip.documentation) {
      // If it exists but isn't an array (unexpected), wrap it or ignore?
      console.warn(`[UploadDocs] Warning: trip.documentation is not an array:`, trip.documentation);
      // existingDocs = [trip.documentation]; // Optional recovery
  }
  
  const newDoc = {
      id: Date.now().toString(), // Simple ID
      type,
      url,
      description,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
  };

  const updatedDocs = [...existingDocs, newDoc];

  const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { documentation: updatedDocs }
  });

  logger.info("Trip Doc Uploaded", { tripId: id, userId, type });

  res.json({ success: true, documentation: updatedDocs });
};
