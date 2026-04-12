"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MoreDrawer } from "./MoreDrawer";

/* ─── Icons ─── */

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MoodIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const OracleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ReportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const FavoritesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
  </svg>
);

/* ─── Types ─── */

interface NavItem {
  href?: string;
  type?: "link" | "drawer";
  label: string;
  icon: React.ReactNode;
}

/* ─── Data ─── */

const NAV_ITEMS: NavItem[] = [
  { href: "/", type: "link", label: "Home", icon: <HomeIcon /> },
  { href: "/mood", type: "link", label: "Umore", icon: <MoodIcon /> },
  { href: "/oracle", type: "link", label: "Oracolo", icon: <OracleIcon /> },
  { href: "/history", type: "link", label: "Archivio", icon: <HistoryIcon /> },
  { type: "drawer", label: "Altro", icon: <MoreIcon /> },
];

const DRAWER_ITEMS = [
  { href: "/report", label: "Report", icon: <ReportIcon /> },
  { href: "/favorites", label: "Preferiti", icon: <FavoritesIcon /> },
  { href: "/settings", label: "Impostazioni", icon: <SettingsIcon /> },
];

/* ─── Component ─── */

export function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (item: NavItem): boolean => {
    if (item.type === "drawer") return drawerOpen;
    if (!item.href) return false;
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <>
      <MoreDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={DRAWER_ITEMS}
      />

      <nav
        className="glass-nav fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Navigazione principale"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item, i) => {
            const active = isActive(item);
            const isDrawer = item.type === "drawer";

            const sharedClasses =
              "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors active:scale-95";
            const sharedStyle = {
              color: active ? "var(--accent-violet)" : "rgba(245,247,255,0.45)",
              transition: "color 0.18s, transform 0.1s",
            };

            const content = (
              <>
                {active && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute top-0.5 h-0.5 w-4 rounded-full"
                    style={{ background: "var(--accent-violet)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span
                  style={{
                    color: active ? "var(--accent-violet)" : "rgba(245,247,255,0.45)",
                    transition: "color 0.18s",
                  }}
                >
                  {item.icon}
                </span>

                <span
                  className="text-[10px] font-medium leading-none"
                  style={{
                    color: active ? "var(--accent-violet)" : "rgba(245,247,255,0.4)",
                    fontWeight: active ? 600 : 500,
                    transition: "color 0.18s",
                  }}
                >
                  {item.label}
                </span>
              </>
            );

            if (isDrawer) {
              return (
                <button
                  key="altro"
                  type="button"
                  onClick={() => setDrawerOpen((v) => !v)}
                  aria-expanded={drawerOpen}
                  aria-haspopup="dialog"
                  className={sharedClasses}
                  style={sharedStyle}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                aria-current={active ? "page" : undefined}
                className={sharedClasses}
                style={sharedStyle}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
