"use client";

import {
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMoodLevel } from "@/lib/moodConfig";

const MIN_SCORE = 0;
const MAX_SCORE = 10;
const DEFAULT_SCORE = 5;
const PILL_WIDTH = 52;
const HIT_TARGET_HEIGHT = 44;

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
  const lowMoodEmoji = getMoodLevel(MIN_SCORE).emoji;
  const highMoodEmoji = getMoodLevel(MAX_SCORE).emoji;
  const fillWidth = useTransform(x, (latestX) => {
    const clampedX = Math.min(Math.max(0, latestX), maxDragX);
    return clampedX + PILL_WIDTH / 2;
  });

  const hideHint = () => {
    if (!showHint) return;
    setShowHint(false);
    try {
      localStorage.setItem("lslider-hint-seen", "1");
    } catch {
      // ignore storage errors
    }
  };

  const applyKeyboardScore = (rawScore: number) => {
    const nextScore = clampScore(rawScore);
    navigator.vibrate?.(8);
    if (nextScore !== effectiveScore) {
      onValueChange(nextScore);
    }
    if (!hasInteracted) setHasInteracted(true);
    hideHint();
  };

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    const computeMaxDrag = () => {
      if (!trackRef.current) {
        return;
      }

      const nextMaxDrag = Math.max(0, trackRef.current.clientWidth - PILL_WIDTH);
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
      className={`relative h-28 w-full select-none ${className ?? ""}`}
      style={{ touchAction: "none" }}
      aria-label="Selettore umore"
    >
      <div className="absolute inset-x-0 top-1 flex items-center justify-between text-sm text-white/40">
        <span>{lowMoodEmoji}</span>
        <span>{highMoodEmoji}</span>
      </div>

      <div className="absolute left-0 right-0 top-10 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
      <motion.div
        className="absolute top-10 left-0 h-1.5 -translate-y-1/2 rounded-full"
        style={{
          width: fillWidth,
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
        tabIndex={0}
        style={{ x, width: PILL_WIDTH, height: HIT_TARGET_HEIGHT, touchAction: "none" }}
        className="absolute top-10 -translate-y-1/2 cursor-grab active:cursor-grabbing focus-visible:outline-none"
        aria-valuetext={`${moodLevel.label} ${effectiveScore}`}
        animate={
          isDragging
            ? { scale: 1.08 }
            : hasInteracted
              ? { scale: 1 }
              : { scale: 1 }
        }
        transition={
          isDragging || hasInteracted
            ? { type: "spring", stiffness: 300, damping: 20 }
            : { type: "spring", stiffness: 280, damping: 24 }
        }
        onPointerDown={(event) => {
          dragControls.start(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            applyKeyboardScore(effectiveScore + 1);
            return;
          }

          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            applyKeyboardScore(effectiveScore - 1);
            return;
          }

          if (event.key === "Home") {
            event.preventDefault();
            applyKeyboardScore(MIN_SCORE);
            return;
          }

          if (event.key === "End") {
            event.preventDefault();
            applyKeyboardScore(MAX_SCORE);
          }
        }}
        onDragStart={() => {
          setIsDragging(true);
          if (!hasInteracted) setHasInteracted(true);
          hideHint();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          lastHapticScore.current = -1;
        }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-8 w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background: blobColor,
            filter: "blur(14px)",
            opacity: 0.3,
          }}
          animate={
            isDragging
              ? { opacity: 0.5 }
              : { opacity: [0.3, 0.5, 0.3] }
          }
          transition={
            isDragging
              ? { duration: 0.2 }
              : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }
        />

        <div
          className="absolute left-1/2 top-1/2 flex h-8 w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full border border-white/20 text-white backdrop-blur-md"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          aria-hidden
        >
          <span className="text-sm leading-none">{moodLevel.emoji}</span>
          <span className="text-xs font-semibold leading-none">{effectiveScore}</span>
        </div>
      </motion.div>

      <div className="absolute left-0 right-0 top-[50px] flex h-3 items-start">
        {Array.from({ length: MAX_SCORE + 1 }).map((_, tick) => {
          const isLandmark = tick === MIN_SCORE || tick === 5 || tick === MAX_SCORE;
          return (
            <span
              key={tick}
              className="absolute -translate-x-1/2"
              style={{ left: `${(tick / MAX_SCORE) * 100}%` }}
            >
              <span
                className={`block w-px ${isLandmark ? "h-2.5 bg-white/25" : "h-1.5 bg-white/15"}`}
              />
            </span>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={moodLevel.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium text-white/60"
        >
          {moodLevel.label}
        </motion.p>
      </AnimatePresence>

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
