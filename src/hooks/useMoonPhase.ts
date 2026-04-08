"use client";

import { useEffect, useState } from "react";

import type { MoonPhaseName } from "@/types/astrology";
import { getMoonPhase } from "@/services/moonPhase";

/**
 * React hook that returns the current lunar phase name.
 * Wraps the pure getMoonPhase service for use in React components.
 *
 * SSR-safe: initial state is computed synchronously, then confirmed via
 * useEffect to ensure hydration consistency.
 */
export function useMoonPhase(): MoonPhaseName {
  const [phase, setPhase] = useState<MoonPhaseName>(() =>
    getMoonPhase(new Date())
  );

  useEffect(() => {
    setPhase(getMoonPhase(new Date()));
  }, []);

  return phase;
}
