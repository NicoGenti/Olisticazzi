"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type GlassVariant = "soft" | "mid" | "strong" | "interactive";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: GlassVariant;
  padding?: "sm" | "md" | "lg";
  children: React.ReactNode;
  glowColor?: string;
  gradient?: string;
  borderColor?: string;
}

const variantClass: Record<GlassVariant, string> = {
  soft: "glass",
  mid: "glass-elevated",
  strong: "glass-elevated",
  interactive: "glass-interactive",
};

const paddingClass: Record<string, string> = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  variant = "soft",
  padding = "md",
  children,
  glowColor,
  gradient,
  borderColor,
  className = "",
  style,
  ...rest
}: GlassCardProps) {
  const mergedStyle = {
    ...(glowColor && { boxShadow: `0 0 28px ${glowColor}28` }),
    ...(gradient && { background: gradient }),
    ...(borderColor && { borderColor }),
    ...style,
  };

  return (
    <motion.div
      className={`${variantClass[variant]} rounded-2xl ${paddingClass[padding]} space-y-3 ${className}`.trim()}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
