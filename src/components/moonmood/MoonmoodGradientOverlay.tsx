"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useMoodScore } from "@/hooks/useMoodStore";
import { useGradientIntensity } from "@/context/GradientIntensityContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Secondary/utility routes that use lightweight gradient mode (fewer blobs, lower opacity)
const LIGHT_MODE_ROUTES = ["/settings", "/privacy", "/favorites", "/report"];

type Rgb = { r: number; g: number; b: number };

const LOW_COLORS = ["#b0c4de", "#708090", "#4682b4", "#6c7a89"];
const HIGH_COLORS = ["#00ff94", "#8b5cf6", "#3b82f6", "#ec4899"];

const BLOB_DRIFT = [
  { x: [-26, 22, -12], y: [-18, 14, -24], scale: [1, 1.08, 0.96], duration: 8 },
  { x: [20, -18, 16], y: [-12, 20, -10], scale: [1.02, 0.94, 1.1], duration: 11 },
  { x: [-18, 10, 26], y: [18, -16, 10], scale: [0.98, 1.12, 0.92], duration: 13 },
  { x: [14, -24, 18], y: [22, -10, -20], scale: [1.04, 0.9, 1.06], duration: 9 }
];

function lerpByMood(score: number, low: number, high: number): number {
  return low + ((high - low) * score) / 10;
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const int = Number.parseInt(normalized, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function blendHex(hex1: string, hex2: string, t: number): string {
  const color1 = hexToRgb(hex1);
  const color2 = hexToRgb(hex2);

  return rgbToHex({
    r: color1.r + (color2.r - color1.r) * t,
    g: color1.g + (color2.g - color1.g) * t,
    b: color1.b + (color2.b - color1.b) * t
  });
}

function buildGradient(score: number): string {
  const t = Math.max(0, Math.min(1, score / 10));
  const colors = LOW_COLORS.map((lowColor, index) => blendHex(lowColor, HIGH_COLORS[index], t));

  return `
    radial-gradient(ellipse 82% 62% at 20% 30%, ${colors[0]}80 0%, transparent 60%),
    radial-gradient(ellipse 62% 82% at 82% 20%, ${colors[1]}70 0%, transparent 55%),
    radial-gradient(ellipse 72% 52% at 48% 82%, ${colors[2]}66 0%, transparent 50%),
    radial-gradient(ellipse 54% 72% at 74% 66%, ${colors[3]}5c 0%, transparent 55%),
    #0a0a0f
  `;
}

export interface MoonmoodGradientOverlayProps {
  /** Moltiplicatore opacità blob e velocità drift (0-1, default 1) */
  intensity?: number;
}

export function MoonmoodGradientOverlay({ intensity: intensityProp }: MoonmoodGradientOverlayProps) {
  const moodScore = useMoodScore();
  const { intensity: contextIntensity } = useGradientIntensity();
  const intensity = intensityProp ?? contextIntensity;
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isLightMode = LIGHT_MODE_ROUTES.includes((pathname ?? "") as string);
  const activeBlobs = isLightMode ? BLOB_DRIFT.slice(0, 2) : BLOB_DRIFT;
  const blurClass = isLightMode ? "blur-2xl" : "blur-3xl";
  const moodMotion = useMotionValue(moodScore);
  const gradientBackground = useTransform(moodMotion, (value) => buildGradient(value));

  useEffect(() => {
    const controls = animate(moodMotion, moodScore, {
      duration: 0.8,
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [moodMotion, moodScore]);

  const moodBlend = moodScore / 10;
  const blobColors = LOW_COLORS.map((lowColor, index) => blendHex(lowColor, HIGH_COLORS[index], moodBlend));

  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: gradientBackground,
        willChange: "transform"
      }}
      aria-hidden="true"
    >
      {!reducedMotion && activeBlobs.map((blob, index) => {
        const baseOpacity = lerpByMood(moodScore, 0.16, 0.42) * intensity;
        const opacity = isLightMode ? Math.min(baseOpacity, 0.25) : baseOpacity;
        const transitionDuration = blob.duration / Math.max(0.1, intensity);

        return (
          <motion.div
            key={index}
            className={`absolute h-[62vmax] w-[62vmax] rounded-full ${blurClass}`}
            style={{
              left: `${lerpByMood(moodScore, 8 + index * 16, 14 + index * 18)}%`,
              top: `${lerpByMood(moodScore, 12 + index * 14, 8 + index * 16)}%`,
              opacity,
              background: `radial-gradient(circle at 40% 40%, ${blobColors[index]}99 0%, transparent 68%)`,
              willChange: "transform"
            }}
            animate={{
              x: blob.x,
              y: blob.y,
              scale: blob.scale
            }}
            transition={{
              duration: transitionDuration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />
        );
      })}
    </motion.div>
  );
}
