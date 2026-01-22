import { PrismaClient } from "../../src/generated/client";

export async function resetDb(prisma: PrismaClient) {
  try {
    await prisma.payment?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing payment:", e.message);
  }
  try {
    await prisma.booking?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing booking:", e.message);
  }
  try {
    await prisma.blog?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing blog:", e.message);
  }
  try {
    await prisma.trip?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing trip:", e.message);
  }
  try {
    await prisma.savedTrip?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing savedTrip:", e.message);
  }
  try {
    await prisma.review?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing review:", e.message);
  }
  try {
    await prisma.image?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing image:", e.message);
  }
  try {
    await prisma.auditLog?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing auditLog:", e.message);
  }
  try {
    await prisma.userRole?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing userRole:", e.message);
  }
  try {
    await prisma.rolePermission?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing rolePermission:", e.message);
  }
  try {
    await prisma.permission?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing permission:", e.message);
  }
  try {
    await prisma.role?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing role:", e.message);
  }
  try {
    await prisma.user?.deleteMany();
  } catch (e: any) {
    console.error("Error clearing user:", e.message);
  }
}
