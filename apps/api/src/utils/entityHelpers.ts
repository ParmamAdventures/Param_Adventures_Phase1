import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "./ApiResponse";
import { HttpError } from "./httpError";
import { Trip, Blog, Booking, User } from "@prisma/client";

/**
 * Fetches a trip or returns 404 error (for use in controllers with Response)
 * Consolidates 17+ duplicate trip fetch/validation patterns
 */

type EntityQueryOptions = {
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
};

/**
 * Fetches a trip or returns 404 error (for use in controllers with Response)
 * Consolidates 17+ duplicate trip fetch/validation patterns
 */
export async function getTripOrThrow(
  tripId: string,
  res: Response,
  options?: EntityQueryOptions,
): Promise<Trip | null> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!trip) {
    ApiResponse.error(res, "TRIP_NOT_FOUND", "Trip not found", 404);
    return null;
  }

  return trip as Trip;
}

/**
 * Fetches a trip or throws HttpError (for use in services)
 */
export async function getTripOrThrowError(
  tripId: string,
  options?: EntityQueryOptions,
): Promise<Trip> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!trip) {
    throw new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");
  }

  return trip as Trip;
}

/**
 * Fetches a blog or returns 404 error (for use in controllers)
 */
export async function getBlogOrThrow(
  blogId: string,
  res: Response,
  options?: EntityQueryOptions,
): Promise<Blog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!blog) {
    ApiResponse.error(res, "BLOG_NOT_FOUND", "Blog not found", 404);
    return null;
  }

  return blog as Blog;
}

/**
 * Fetches a blog or throws HttpError (for use in services)
 */
export async function getBlogOrThrowError(
  blogId: string,
  options?: EntityQueryOptions,
): Promise<Blog> {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!blog) {
    throw new HttpError(404, "BLOG_NOT_FOUND", "Blog not found");
  }

  return blog as Blog;
}

/**
 * Fetches a booking or returns 404 error (for use in controllers)
 */
export async function getBookingOrThrow(
  bookingId: string,
  res: Response,
  options?: EntityQueryOptions,
): Promise<Booking | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!booking) {
    ApiResponse.error(res, "BOOKING_NOT_FOUND", "Booking not found", 404);
    return null;
  }

  return booking as Booking;
}

/**
 * Fetches a booking or throws HttpError (for use in services)
 */
export async function getBookingOrThrowError(
  bookingId: string,
  options?: EntityQueryOptions,
): Promise<Booking> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!booking) {
    throw new HttpError(404, "BOOKING_NOT_FOUND", "Booking not found");
  }

  return booking as Booking;
}

/**
 * Fetches a user or returns 404 error (for use in controllers)
 */
export async function getUserOrThrow(
  userId: string,
  res: Response,
  options?: EntityQueryOptions,
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!user) {
    ApiResponse.error(res, "USER_NOT_FOUND", "User not found", 404);
    return null;
  }

  return user as User;
}

/**
 * Fetches a user or throws HttpError (for use in services)
 */
export async function getUserOrThrowError(
  userId: string,
  options?: EntityQueryOptions,
): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "User not found");
  }

  return user as User;
}

interface PrismaModelDelegate<T> {
  findUnique(args: { where: { id: string } } & EntityQueryOptions): Promise<T | null>;
}

/**
 * Generic entity fetch helper (for advanced use cases)
 */
export async function getEntityOrThrow<T>(
  model: PrismaModelDelegate<T>,
  id: string,
  res: Response,
  errorCode: string,
  errorMessage: string,
  options?: EntityQueryOptions,
): Promise<T | null> {
  const entity = await model.findUnique({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as any),
  });

  if (!entity) {
    ApiResponse.error(res, errorCode, errorMessage, 404);
    return null;
  }

  return entity as T;
}
