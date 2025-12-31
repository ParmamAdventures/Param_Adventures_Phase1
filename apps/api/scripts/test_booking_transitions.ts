import { assertBookingTransition } from "../src/domain/booking/bookingTransitions";

function expectEqual(a: any, b: any, msg?: string) {
  if (a !== b) {
    console.error(`FAIL: ${msg || ""} — expected ${b}, got ${a}`);
    process.exitCode = 1;
    process.exit(1);
  }
}

function expectThrows(fn: () => void, msg?: string) {
  try {
    fn();
    console.error(`FAIL: ${msg || ""} — expected throw but did not`);
    process.exitCode = 1;
    process.exit(1);
  } catch (err: any) {
    if (!err || !err.message || !err.message.startsWith("INVALID_BOOKING_TRANSITION")) {
      console.error(`FAIL: ${msg || ""} — unexpected error: ${err}`);
      process.exitCode = 1;
      process.exit(1);
    }
  }
}

console.log("Testing booking transition validator...");

// Valid transitions
expectEqual(
  assertBookingTransition("REQUESTED" as any, "approve" as any),
  "CONFIRMED",
  "REQUESTED -> approve",
);
expectEqual(
  assertBookingTransition("REQUESTED" as any, "reject" as any),
  "REJECTED",
  "REQUESTED -> reject",
);

// Invalid transitions
expectThrows(
  () => assertBookingTransition("CONFIRMED" as any, "approve" as any),
  "CONFIRMED -> approve",
);
expectThrows(
  () => assertBookingTransition("REJECTED" as any, "approve" as any),
  "REJECTED -> approve",
);

console.log("All booking transition tests passed");
