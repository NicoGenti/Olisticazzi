"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface DrawerItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MoreDrawerProps {
  open: boolean;
  onClose: () => void;
  items: DrawerItem[];
}

export function MoreDrawer({ open, onClose, items }: MoreDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="more-backdrop"
            className="fixed inset-0 z-[49] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.div
            key="more-drawer"
            role="dialog"
            aria-label="Menu secondario"
            className="glass-nav fixed bottom-0 left-0 right-0 z-[51] rounded-t-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <span className="block h-1 w-10 rounded-full bg-white/20" />
            </div>

            <nav aria-label="Menu secondario">
              <ul className="mx-auto flex max-w-lg flex-col px-4 pb-3 pt-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex min-h-[56px] items-center gap-3 rounded-xl px-3 py-3 transition-colors active:bg-white/10"
                      style={{ color: "rgba(245,247,255,0.85)" }}
                    >
                      <span className="flex-shrink-0" style={{ color: "rgba(245,247,255,0.6)" }}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {/* Chevron */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        style={{ color: "rgba(245,247,255,0.3)" }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
