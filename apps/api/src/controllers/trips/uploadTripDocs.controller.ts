import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrowError } from "../../utils/entityHelpers";

export const uploadTripDocs = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Expecting body: { type: "GROUP_PHOTO" | "REPORT" | "OTHER", url: string, description?: string }
  const { type, url, description } = req.body;

  if (!url || !type) {
    throw new HttpError(400, "INVALID_REQUEST", "URL and Type are required");
  }

  const trip = (await getTripOrThrowError(id)) as any;

  // Authz: Guide assigned to trip OR Manager/Admin
  const isAssignedGuide = await prisma.tripsOnGuides.findUnique({
    where: { tripId_guideId: { tripId: id, guideId: userId } },
  });

  const isManager = trip.managerId === userId;
  const isAdmin = req.user?.roles.includes("ADMIN") || req.user?.roles.includes("SUPER_ADMIN");

  if (!isAssignedGuide && !isManager && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "You are not authorized to upload docs for this trip");
  }

  // Append to existing docs safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let existingDocs: any[] = [];

  if (Array.isArray(trip.documentation)) {
    existingDocs = trip.documentation as any[];
  }

  const newDoc = {
    id: Date.now().toString(), // Simple ID
    type,
    url,
    description,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
  };

  const updatedDocs = [...existingDocs, newDoc];

  await prisma.trip.update({
    where: { id },
    data: { documentation: updatedDocs as Prisma.InputJsonValue },
  });

  logger.info("Trip Doc Uploaded", { tripId: id, userId, type });

  return ApiResponse.success(res, { documentation: updatedDocs }, "Document uploaded");
});
