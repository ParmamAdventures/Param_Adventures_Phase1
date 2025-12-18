import { BookingStatus } from "@prisma/client";

type Action = "approve" | "reject";

const transitions: Record<
  BookingStatus,
  Partial<Record<Action, BookingStatus>>
> = {
  REQUESTED: {
    approve: "CONFIRMED",
    reject: "REJECTED",
  },
  CONFIRMED: {},
  REJECTED: {},
  CANCELLED: {},
  COMPLETED: {},
};

export function assertBookingTransition(
  from: BookingStatus,
  action: Action
): BookingStatus {
  const next = transitions[from]?.[action];

  if (!next) {
    throw new Error(`INVALID_BOOKING_TRANSITION:${from}:${action}`);
  }

  return next;
}

export type BookingAction = Action;
