"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/Moonmood/sw.js").catch(() => {
        // Registration failed — silent, non-critical
      });
    }
  }, []);

  return null;
}
