// Global teardown hook - skip Prisma instantiation in spawned process
// Database cleanup is not required for Jest teardown
export default async function globalTeardown() {
  console.log("\nRunning global teardown...");
  // No cleanup needed - Jest will handle test cleanup
  console.log("Global teardown complete.");
}
