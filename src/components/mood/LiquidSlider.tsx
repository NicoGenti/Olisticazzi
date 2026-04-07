"use client";

import {
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const MIN_SCORE = 0;
const MAX_SCORE = 10;
const DEFAULT_SCORE = 5;
const BLOB_SIZE = 80;

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
  const [idleStep, setIdleStep] = useState(0);
  const [dragStep, setDragStep] = useState(0);

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
    }
  });

  return (
    <div
      ref={trackRef}
      className={`relative h-28 w-full select-none ${className ?? ""}`}
      style={{ touchAction: "none" }}
      aria-label="Selettore umore"
    >
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />

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
        onPointerDown={(event) => {
          dragControls.start(event);
        }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={() => {
          setDragStep((current) => current + 1);
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
      >
        <svg viewBox="0 0 60 60" width={BLOB_SIZE} height={BLOB_SIZE} aria-hidden>
          <defs>
            <radialGradient id="liquid-slider-blob-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="62%" stopColor={blobColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={blobColor} stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <motion.path
            d={activePath}
            fill="url(#liquid-slider-blob-gradient)"
            animate={{ d: activePath }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
