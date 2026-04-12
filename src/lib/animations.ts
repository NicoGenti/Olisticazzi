import type { Variants } from "framer-motion";

/**
 * Standard stagger container for page-level content.
 * Use as the `variants` prop on a motion container wrapping fadeUp children.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/**
 * Slower stagger for content-heavy pages (oracle, report).
 */
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

/**
 * Standard fade-up entrance for individual items within a stagger container.
 * y:14 matches the original mood/oracle/report page values.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * Smaller fade-up for compact items (history rows, list items).
 */
export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * Simple fade (no translation) for overlays and modals.
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

/**
 * Loading pulse animation for skeleton states.
 */
export const pulse: Variants = {
  hidden: { opacity: 0.6 },
  show: {
    opacity: 1,
    transition: { duration: 1.2, repeat: Infinity, repeatType: "reverse" },
  },
};
