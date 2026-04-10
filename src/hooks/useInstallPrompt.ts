"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UseInstallPromptReturn {
  /** Whether the install prompt is available and should be shown */
  canInstall: boolean;
  /** Whether the app is already running in standalone mode */
  isStandalone: boolean;
  /** Trigger the browser install prompt */
  triggerInstall: () => Promise<void>;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already running in standalone (installed) mode
    const standaloneNow =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneNow);

    if (standaloneNow) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault(); // Suppress browser mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
    // If dismissed, keep the prompt so the user can try again later
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null && !isStandalone,
    isStandalone,
    triggerInstall,
  };
}
