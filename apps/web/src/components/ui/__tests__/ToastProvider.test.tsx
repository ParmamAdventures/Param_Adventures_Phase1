"use client";

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ToastProvider, { useToast } from "../ToastProvider";

function TestHarness() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Hello world", "info")}>Trigger</button>
    </div>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  beforeAll(() => {
    // jsdom in Jest may not provide crypto.randomUUID; mock it for tests
    if (!(global as unknown as { crypto?: { randomUUID: () => string } }).crypto) {
      (global as unknown as { crypto: { randomUUID: () => string } }).crypto = {
        randomUUID: () => "test-uuid",
      };
    }
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows a toast and auto-dismisses", async () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    );

    const btn = screen.getByText("Trigger");
    fireEvent.click(btn);

    // toast should appear
    expect(screen.getByText("Hello world")).toBeInTheDocument();

    // advance time to auto-dismiss (4000ms in provider)
    act(() => {
      jest.advanceTimersByTime(4100);
    });

    // toast should be removed or hidden after exit animation
    const el = screen.queryByText("Hello world");
    if (el) {
      expect(el).not.toBeVisible();
    } else {
      expect(el).toBeNull();
    }
  });
});
