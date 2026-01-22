import { PrismaClient } from "../src/generated/client";
import { bookingService } from "../src/services/booking.service";
import { tripService } from "../src/services/trip.service";
import { auditService, AuditActions, AuditTargetTypes } from "../src/services/audit.service";
import { EntityStatus } from "../src/constants/status";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Verification Script...");

  // 1. Setup Data - Role
  console.log("\n--- Setting up Test Data ---");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Super Admin" },
  });
  console.log(`✅ Ensured Role: SUPER_ADMIN (${superAdminRole.id})`);

  // 1. Setup Data - Users
  const uniqueId = Date.now();
  const adminEmail = `admin_verify_${uniqueId}@example.com`;

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Verification Admin",
      password: "hash",
      status: "ACTIVE",
      roles: {
        create: {
          roleId: superAdminRole.id,
        },
      },
    },
  });
  console.log(`✅ Created Admin User: ${admin.id}`);

  const trip = await prisma.trip.create({
    data: {
      title: "Verification Trip",
      slug: `verify-trip-${uniqueId}`,
      description: "Test Description for Verification Trip",
      location: "Test Location",
      price: 1000,
      durationDays: 5,
      difficulty: "MODERATE", // Matched Enum
      status: EntityStatus.DRAFT, // Using Constant
      createdById: admin.id,
      itinerary: {}, // Required JSON
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 5),
    },
  });
  console.log(`✅ Created Trip: ${trip.id} (Status: ${trip.status})`);

  const bookingUser = await prisma.user.create({
    data: {
      email: `user_verify_${uniqueId}@example.com`,
      name: "Verification User",
      password: "hash",
      status: "ACTIVE",
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId: bookingUser.id,
      tripId: trip.id,
      startDate: new Date(),
      guests: 2,
      totalPrice: 2000,
      status: "REQUESTED",
    },
  });
  console.log(`✅ Created Booking: ${booking.id} (Status: ${booking.status})`);

  // 2. data Verification - Trip Approval (Constants & Service)
  console.log("\n--- Verifying Trip Approval ---");
  await tripService.approveTrip(trip.id, admin.id);

  const updatedTrip = await prisma.trip.findUnique({ where: { id: trip.id } });
  if (updatedTrip?.status === EntityStatus.APPROVED) {
    console.log("✅ Trip Status Updated to APPROVED");
  } else {
    console.error("❌ Trip Status Update Failed:", updatedTrip?.status);
  }

  const tripAudit = await prisma.auditLog.findFirst({
    where: { targetId: trip.id, action: "TRIP_APPROVED" },
  });
  if (tripAudit) {
    console.log("✅ Trip Audit Log Found");
  } else {
    console.error("❌ Trip Audit Log Missing");
  }

  // 3. Verification - Booking Approval (Service Refactor)
  console.log("\n--- Verifying Booking Approval ---");
  try {
    await bookingService.approveBooking(booking.id, admin.id);
    console.log("✅ bookingService.approveBooking executed without error");
  } catch (error) {
    console.error("❌ bookingService.approveBooking Failed:", error);
  }

  const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
  if (updatedBooking?.status === "CONFIRMED") {
    console.log("✅ Booking Status Updated to CONFIRMED");
  } else {
    console.error("❌ Booking Status Update Failed:", updatedBooking?.status);
  }

  const bookingAudit = await prisma.auditLog.findFirst({
    where: {
      targetId: booking.id,
      action: AuditActions.BOOKING_CONFIRMED,
      actorId: admin.id,
    },
  });
  if (bookingAudit) {
    console.log("✅ Booking Audit Log Found");
  } else {
    console.error("❌ Booking Audit Log Missing");
    const allLogs = await prisma.auditLog.findMany({ where: { targetId: booking.id } });
    console.log("Found logs count:", allLogs.length);
    allLogs.forEach((log) => {
      console.log(`Log Action: '${log.action}' (Expected: '${AuditActions.BOOKING_CONFIRMED}')`);
      console.log(`Log Actor: '${log.actorId}' (Expected: '${admin.id}')`);
      console.log(`Log Target: '${log.targetType}' (Expected: 'BOOKING')`);
    });
    console.log("DEBUG: Expected ActorId:", admin.id);
  }

  // Cleanup
  console.log("\n--- Cleanup ---");
  await prisma.auditLog.deleteMany({ where: { actorId: admin.id } });
  await prisma.auditLog.deleteMany({ where: { actorId: bookingUser.id } }); // User creation log
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.trip.delete({ where: { id: trip.id } });
  await prisma.user.delete({ where: { id: admin.id } });
  await prisma.user.delete({ where: { id: bookingUser.id } });
  console.log("✅ Cleanup Complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
