import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getTripBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      coverImage: true,
      // @ts-ignore
      heroImage: true,
      gallery: {
        include: {
          image: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", "Trip not found");
  }

  if (trip.status === "PUBLISHED") {
    return ApiResponse.success(res, "Trip Fetched", trip);
  }

  // If not published, check for internal permission
  const user = (req as any).user;
  if (user) {
    // We need to fetch permissions effectively since optionalAuth doesn't hydration them
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (dbUser) {
      const permissions = new Set<string>();
      dbUser.roles.forEach(ur => {
        ur.role.permissions.forEach(rp => {
          permissions.add(rp.permission.key);
        });
      });
      
      if (permissions.has("trip:view:internal") || trip.createdById === user.id) {
         return ApiResponse.success(res, "Trip Fetched (Internal)", trip);
      }
    }
  }

  // Fallback to hiding existence
  throw new HttpError(404, "NOT_FOUND", "Trip not found");
});
