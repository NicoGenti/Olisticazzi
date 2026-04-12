"use client";

import { useEffect, useState } from "react";

/** Returns true when matchMedia is available and functional. */
function isMatchMediaAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

/**
 * Returns `true` when the OS-level "Reduce Motion" accessibility setting is
 * active, `false` otherwise.  Handles SSR safely (returns `false` on the
 * server) and updates reactively if the user changes the setting at runtime.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (!isMatchMediaAvailable()) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!isMatchMediaAvailable()) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    // Keep initial value in sync (handles hydration edge cases)
    setReducedMotion(mq.matches);

    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
    };
  }, []);

  return reducedMotion;
}
