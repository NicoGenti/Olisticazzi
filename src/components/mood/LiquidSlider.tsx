"use client";

import {
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMoodLevel } from "@/lib/moodConfig";

const MIN_SCORE = 0;
const MAX_SCORE = 10;
const DEFAULT_SCORE = 5;
const BLOB_SIZE = 56;

const BLOB_PATHS = [
  "M 30 0 C 55 5 55 55 30 60 C 5 55 5 5 30 0 Z",
  "M 30 5 C 50 0 58 40 30 58 C 5 40 8 8 30 5 Z",
  "M 30 -5 C 58 8 52 52 30 62 C 8 52 2 8 30 -5 Z",
  "M 30 2 C 52 2 57 52 30 60 C 3 54 7 6 30 2 Z",
  "M 30 -2 C 57 6 54 49 30 61 C 4 54 0 11 30 -2 Z",
];

export interface LiquidSliderProps {
  value: number;
  onValueChange: (score: number) => void;
  className?: string;
}

function clampScore(value: number): number {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

function blendHex(from: string, to: string, t: number): string {
  const normalizedT = Math.min(1, Math.max(0, t));
  const fromValue = parseInt(from.slice(1), 16);
  const toValue = parseInt(to.slice(1), 16);

  const fromR = (fromValue >> 16) & 255;
  const fromG = (fromValue >> 8) & 255;
  const fromB = fromValue & 255;

  const toR = (toValue >> 16) & 255;
  const toG = (toValue >> 8) & 255;
  const toB = toValue & 255;

  const mix = (start: number, end: number) =>
    Math.round(start + (end - start) * normalizedT)
      .toString(16)
      .padStart(2, "0");

  return `#${mix(fromR, toR)}${mix(fromG, toG)}${mix(fromB, toB)}`;
}

export function LiquidSlider({ value, onValueChange, className }: LiquidSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);

  const [maxDragX, setMaxDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("lslider-hint-seen") !== "1"
        : false;
    } catch {
      return false;
    }
  });
  const [idleStep, setIdleStep] = useState(0);
  const [dragStep, setDragStep] = useState(0);
  const lastHapticScore = useRef<number>(-1);

  const scoreFromX = useMemo(() => {
    if (maxDragX <= 0) {
      return DEFAULT_SCORE;
    }

    const ratio = x.get() / maxDragX;
    return clampScore(Math.round(ratio * MAX_SCORE));
  }, [maxDragX, x]);

  const effectiveScore = Number.isFinite(value)
    ? clampScore(value)
    : scoreFromX;

  const colorMix = effectiveScore / MAX_SCORE;
  const blobColor = blendHex("#4682b4", "#8b5cf6", colorMix);
  const moodLevel = getMoodLevel(effectiveScore);

  // Percentuale posizione thumb per calcolare la track colorata
  const thumbPercent = maxDragX > 0 ? (x.get() / maxDragX) * 100 : (effectiveScore / MAX_SCORE) * 100;

  const activePath = isDragging
    ? BLOB_PATHS[dragStep % BLOB_PATHS.length]
    : BLOB_PATHS[idleStep % BLOB_PATHS.length];

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    const computeMaxDrag = () => {
      if (!trackRef.current) {
        return;
      }

      const nextMaxDrag = Math.max(0, trackRef.current.clientWidth - BLOB_SIZE);
      setMaxDragX(nextMaxDrag);
    };

    computeMaxDrag();

    const observer = new ResizeObserver(computeMaxDrag);
    observer.observe(trackRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (maxDragX <= 0) {
      x.set(0);
      return;
    }

    const nextScore = Number.isFinite(value) ? clampScore(value) : DEFAULT_SCORE;
    const nextX = (nextScore / MAX_SCORE) * maxDragX;
    x.set(nextX);
  }, [maxDragX, value, x]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdleStep((current) => current + 1);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  useMotionValueEvent(x, "change", (latestX) => {
    if (!isDragging || maxDragX <= 0) {
      return;
    }

    const clampedX = Math.min(Math.max(0, latestX), maxDragX);
    const nextScore = clampScore(Math.round((clampedX / maxDragX) * MAX_SCORE));
    if (nextScore !== effectiveScore) {
      onValueChange(nextScore);
      // Haptic feedback ad ogni cambio di score
      if (nextScore !== lastHapticScore.current) {
        lastHapticScore.current = nextScore;
        navigator.vibrate?.(8);
      }
    }
  });

  return (
    <div
      ref={trackRef}
      className={`relative h-20 w-full select-none ${className ?? ""}`}
      style={{ touchAction: "none" }}
      aria-label="Selettore umore"
    >
      {/* Track base — 4px rounded, proper slider affordance */}
      <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />

      {/* Track filled portion — mood color gradient up to thumb */}
      <div
        className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-75"
        style={{
          width: `calc(${thumbPercent}% + ${BLOB_SIZE / 2}px)`,
          background: `linear-gradient(to right, #4682b4, ${blobColor})`,
          opacity: 0.75,
        }}
      />

      <motion.div
        role="slider"
        aria-valuemin={MIN_SCORE}
        aria-valuemax={MAX_SCORE}
        aria-valuenow={effectiveScore}
        drag="x"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ left: 0, right: maxDragX }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x, width: BLOB_SIZE, height: BLOB_SIZE, touchAction: "none" }}
        className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        animate={
          isDragging
            ? { scale: 1.12 }
            : hasInteracted
              ? { scale: 1 }
              : { scale: [1, 1.06, 1] }
        }
        transition={
          isDragging || hasInteracted
            ? { type: "spring", stiffness: 300, damping: 20 }
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
        onPointerDown={(event) => {
          dragControls.start(event);
        }}
        onDragStart={() => {
          setIsDragging(true);
          if (!hasInteracted) setHasInteracted(true);
          if (showHint) {
            setShowHint(false);
            try { localStorage.setItem("lslider-hint-seen", "1"); } catch { /* ignore */ }
          }
        }}
        onDrag={() => {
          setDragStep((current) => current + 1);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          lastHapticScore.current = -1;
        }}
      >
        {/* Glow ring — radial halo in mood color */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: blobColor,
            filter: "blur(14px)",
            opacity: 0.3,
          }}
          whileHover={{ opacity: 0.45 }}
          whileFocus={{ opacity: 0.45 }}
        />

        {/* Label flottante sopra il blob */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              key="drag-label"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm pointer-events-none"
            >
              {effectiveScore} {moodLevel.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        <svg viewBox="0 0 60 60" width={BLOB_SIZE} height={BLOB_SIZE} aria-hidden>
          <defs>
            <radialGradient id="liquid-slider-blob-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="62%" stopColor={blobColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={blobColor} stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <path
            d={activePath}
            fill="url(#liquid-slider-blob-gradient)"
          />
        </svg>
      </motion.div>

      {/* First-visit hint */}
      <AnimatePresence>
        {showHint && (
          <motion.p
            key="slider-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.55, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white/55 pointer-events-none select-none whitespace-nowrap"
          >
            ← scorri →
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
