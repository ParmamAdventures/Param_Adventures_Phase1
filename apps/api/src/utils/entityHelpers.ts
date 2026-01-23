import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "./ApiResponse";
import { HttpError } from "./httpError";
import { Trip, Blog, Booking, User } from "@prisma/client";

/**
 * Fetches a trip or returns 404 error (for use in controllers with Response)
 * Consolidates 17+ duplicate trip fetch/validation patterns
 */
export async function getTripOrThrow(
  tripId: string,
  res: Response,
  options?: { include?: any; select?: any },
): Promise<Trip | null> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<Trip> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<Blog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<Blog> {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<Booking | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<Booking> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    ...options,
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
  options?: { include?: any; select?: any },
): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    ...options,
  });

  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "User not found");
  }

  return user as User;
}

/**
 * Generic entity fetch helper (for advanced use cases)
 */
export async function getEntityOrThrow<T>(
  model: any, // Prisma model
  id: string,
  res: Response,
  errorCode: string,
  errorMessage: string,
  options?: { include?: any; select?: any },
): Promise<T | null> {
  const entity = await model.findUnique({
    where: { id },
    ...options,
  });

  if (!entity) {
    ApiResponse.error(res, errorCode, errorMessage, 404);
    return null;
  }

  return entity as T;
}
