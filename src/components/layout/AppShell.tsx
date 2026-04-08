"use client";

import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  /** If true, adds bottom padding to account for the nav bar */
  withNav?: boolean;
}

/**
 * AppShell wraps all page content within the cosmic background,
 * handles max-width centering, and optional bottom nav padding.
 */
export function AppShell({ children, withNav = true }: AppShellProps) {
  return (
    <>
      <div
        className="relative mx-auto w-full max-w-lg min-h-screen"
        style={{ paddingBottom: withNav ? "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))" : undefined }}
      >
        {children}
      </div>
      {withNav && <BottomNav />}
    </>
  );
}
