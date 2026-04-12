import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";

import { useReducedMotion } from "../useReducedMotion";

// Helper to create a mock MediaQueryList
function makeMockMq(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mq = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: jest.fn((_type: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.push(listener);
    }),
    removeEventListener: jest.fn((_type: string, listener: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    dispatchEvent: jest.fn(),
    /** Simulate the OS setting changing */
    _fire: (newMatches: boolean) => {
      (mq as unknown as { matches: boolean }).matches = newMatches;
      listeners.forEach((l) =>
        l({ matches: newMatches } as MediaQueryListEvent)
      );
    },
  };

  return mq;
}

describe("useReducedMotion", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
  });

  it("returns false when matchMedia is not available (SSR)", () => {
    // Remove matchMedia to simulate SSR / environments without it
    Object.defineProperty(window, "matchMedia", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when matchMedia reports prefers-reduced-motion: reduce", () => {
    const mq = makeMockMq(true);
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn().mockReturnValue(mq),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when matchMedia reports no reduced-motion preference", () => {
    const mq = makeMockMq(false);
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn().mockReturnValue(mq),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("updates reactively when the OS setting changes", async () => {
    const mq = makeMockMq(false);
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn().mockReturnValue(mq),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    await act(async () => {
      mq._fire(true);
    });
    expect(result.current).toBe(true);
  });
});
