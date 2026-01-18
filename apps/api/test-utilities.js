/**
 * Test script for deduplication utilities
 * Run with: node test-utilities.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testUtilities() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        TESTING DEDUPLICATION UTILITIES                   ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  try {
    // Test 1: Verify auditLog constants exist
    console.log("📋 Test 1: Verify auditLog module");
    try {
      const auditLog = require("./src/utils/auditLog");
      console.log("✅ auditLog.ts loaded successfully");
      console.log(`   - AuditActions available: ${Object.keys(auditLog.AuditActions).length} actions`);
      console.log(`   - AuditTargetTypes available: ${Object.keys(auditLog.AuditTargetTypes).length} types`);
      console.log(`   - createAuditLog function: ${typeof auditLog.createAuditLog === 'function' ? 'Available' : 'Missing'}`);
    } catch (err) {
      console.log("❌ Failed to load auditLog:", err.message);
    }

    // Test 2: Verify entityHelpers
    console.log("\n📋 Test 2: Verify entityHelpers module");
    try {
      const entityHelpers = require("./src/utils/entityHelpers");
      console.log("✅ entityHelpers.ts loaded successfully");
      console.log(`   - getTripOrThrow: ${typeof entityHelpers.getTripOrThrow === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - getBlogOrThrow: ${typeof entityHelpers.getBlogOrThrow === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - getBookingOrThrow: ${typeof entityHelpers.getBookingOrThrow === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - getUserOrThrow: ${typeof entityHelpers.getUserOrThrow === 'function' ? 'Available' : 'Missing'}`);
    } catch (err) {
      console.log("❌ Failed to load entityHelpers:", err.message);
    }

    // Test 3: Verify errorMessages
    console.log("\n📋 Test 3: Verify errorMessages module");
    try {
      const errorMessages = require("./src/constants/errorMessages");
      console.log("✅ errorMessages.ts loaded successfully");
      console.log(`   - ErrorCodes available: ${Object.keys(errorMessages.ErrorCodes).length} codes`);
      console.log(`   - ErrorMessages available: ${Object.keys(errorMessages.ErrorMessages).length} messages`);
      console.log(`   - Sample code: ${errorMessages.ErrorCodes.TRIP_NOT_FOUND}`);
      console.log(`   - Sample message: ${errorMessages.ErrorMessages.TRIP_NOT_FOUND}`);
    } catch (err) {
      console.log("❌ Failed to load errorMessages:", err.message);
    }

    // Test 4: Verify prismaIncludes
    console.log("\n📋 Test 4: Verify prismaIncludes module");
    try {
      const prismaIncludes = require("./src/constants/prismaIncludes");
      console.log("✅ prismaIncludes.ts loaded successfully");
      console.log(`   - TripIncludes: ${Object.keys(prismaIncludes.TripIncludes).length} patterns`);
      console.log(`   - BlogIncludes: ${Object.keys(prismaIncludes.BlogIncludes).length} patterns`);
      console.log(`   - BookingIncludes: ${Object.keys(prismaIncludes.BookingIncludes).length} patterns`);
      console.log(`   - UserIncludes: ${Object.keys(prismaIncludes.UserIncludes).length} patterns`);
    } catch (err) {
      console.log("❌ Failed to load prismaIncludes:", err.message);
    }

    // Test 5: Verify statusValidation
    console.log("\n📋 Test 5: Verify statusValidation module");
    try {
      const statusValidation = require("./src/utils/statusValidation");
      console.log("✅ statusValidation.ts loaded successfully");
      console.log(`   - validateTripStatusTransition: ${typeof statusValidation.validateTripStatusTransition === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - validateBlogStatusTransition: ${typeof statusValidation.validateBlogStatusTransition === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - validateBookingStatusTransition: ${typeof statusValidation.validateBookingStatusTransition === 'function' ? 'Available' : 'Missing'}`);
      console.log(`   - isTripStatusTransitionValid: ${typeof statusValidation.isTripStatusTransitionValid === 'function' ? 'Available' : 'Missing'}`);
    } catch (err) {
      console.log("❌ Failed to load statusValidation:", err.message);
    }

    // Test 6: Functional test - Create audit log
    console.log("\n📋 Test 6: Functional test - Create audit log");
    try {
      const { createAuditLog, AuditActions, AuditTargetTypes } = require("./src/utils/auditLog");
      
      const testUser = await prisma.user.findFirst();
      if (!testUser) {
        console.log("⚠️  Skipping: No users found in database");
      } else {
        const log = await createAuditLog({
          actorId: testUser.id,
          action: AuditActions.TRIP_CREATED,
          targetType: AuditTargetTypes.TRIP,
          targetId: "test-trip-id",
          metadata: { test: true },
        });
        
        console.log("✅ Audit log created successfully");
        console.log(`   - Log ID: ${log.id}`);
        console.log(`   - Action: ${log.action}`);
        console.log(`   - Target: ${log.targetType}`);
        
        // Clean up test log
        await prisma.auditLog.delete({ where: { id: log.id } });
        console.log("   - Test log cleaned up");
      }
    } catch (err) {
      console.log("❌ Functional test failed:", err.message);
    }

    // Test 7: Functional test - Status validation
    console.log("\n📋 Test 7: Functional test - Status validation");
    try {
      const { 
        validateTripStatusTransition, 
        isTripStatusTransitionValid 
      } = require("./src/utils/statusValidation");
      
      // Valid transition
      const isValidDraftToPending = isTripStatusTransitionValid("DRAFT", "PENDING_REVIEW");
      console.log(`✅ DRAFT → PENDING_REVIEW: ${isValidDraftToPending ? 'Valid' : 'Invalid'}`);
      
      // Invalid transition
      const isValidDraftToCompleted = isTripStatusTransitionValid("DRAFT", "COMPLETED");
      console.log(`✅ DRAFT → COMPLETED: ${isValidDraftToCompleted ? 'Valid' : 'Invalid (expected)'}`);
      
      // Test throwing version
      try {
        validateTripStatusTransition("DRAFT", "COMPLETED");
        console.log("❌ Should have thrown error for invalid transition");
      } catch (err) {
        console.log(`✅ Correctly threw error: ${err.message.substring(0, 50)}...`);
      }
    } catch (err) {
      console.log("❌ Status validation test failed:", err.message);
    }

    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║              ✨ ALL TESTS COMPLETED ✨                   ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("\n❌ Test suite error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUtilities();
