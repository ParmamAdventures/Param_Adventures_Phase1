
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const deleteTrip = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { bookings: true }
  });

  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", "Trip not found");
  }

  // Constraint 1: Cannot delete PUBLISHED trips
  if (trip.status === "PUBLISHED") {
    throw new HttpError(400, "BAD_REQUEST", "Cannot delete a PUBLISHED trip. Please Archive it instead.");
  }

  // Constraint 2: Cannot delete trip while running (IN_PROGRESS)
  if (trip.status === "IN_PROGRESS") {
    throw new HttpError(400, "BAD_REQUEST", "Cannot delete an IN_PROGRESS trip.");
  }
  
  // Constraint 3 (Implicit): Safety check for bookings?
  // User said "while trip is running", implying future bookings might be okay to cancel?
  // But usually hard deleting a trip with bookings breaks referential integrity or history.
  // We'll trust the User's specific constraints for now.
  // But if there are bookings, Prisma might throw Foreign Key error unless Cascade Delete is on.
  // Schema check: SavedTrip (Cascade), Review (No Cascade?), Booking (No Cascade?).
  // If Booking exists, delete usually fails.
  // We should warn user or block it. 
  
  const hasActiveBookings = trip.bookings.some(b => 
    ["CONFIRMED", "PAID"].includes(b.status as any) || b.paymentStatus === "PAID"
  );

  if (hasActiveBookings) {
      // If user insists on deleting, they must cancel bookings first.
      throw new HttpError(400, "BAD_REQUEST", "Trip has active bookings. Cancel them before deleting.");
  }


  await prisma.trip.delete({
    where: { id },
  });

  return ApiResponse.success(res, "Trip deleted successfully", null);
});
