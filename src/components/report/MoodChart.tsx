"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMoodLevel } from "@/lib/moodConfig";
import type { MoodLog } from "@/types/mood";
import styles from "./MoodChart.module.css";

export type Range = "7" | "30" | "90" | "all";

interface MoodChartProps {
  logs: MoodLog[];
  range: Range;
}

interface TooltipData {
  log: MoodLog;
  x: number;
  y: number;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

const PADDING_X = 16;
const PADDING_Y_BOTTOM = 28;
const PADDING_Y_TOP = 12;
const Y_MAX = 10;

export default function MoodChart({ logs, range }: MoodChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const isBarChart = range === "7" || range === "30";

  const reversed = useMemo(() => [...logs].reverse(), [logs]);

  const chartWidth = containerWidth || 320;
  const chartHeight = 180;
  const innerWidth = chartWidth - PADDING_X * 2;
  const innerHeight = chartHeight - PADDING_Y_TOP - PADDING_Y_BOTTOM;

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [handleResize]);

  // Y-axis ticks
  const yTicks = [0, 5, 10];

  if (reversed.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  // ── BAR CHART ──────────────────────────────────────────────────────────────
  if (isBarChart) {
    const barCount = reversed.length;
    const totalGap = barCount + 1;
    const barWidth = Math.max(4, innerWidth / totalGap);
    const barW = Math.min(barWidth * 0.7, 28);
    const gap = Math.max(0, (innerWidth - barW * barCount) / (barCount + 1));

    return (
      <div ref={containerRef} className={styles.wrapper}>
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className={styles.svg}
        >
          {/* Y-axis lines */}
          {yTicks.map((tick) => {
            const y = PADDING_Y_TOP + innerHeight - (tick / Y_MAX) * innerHeight;
            return (
              <g key={tick}>
                <line
                  x1={PADDING_X}
                  y1={y}
                  x2={chartWidth - PADDING_X}
                  y2={y}
                  stroke="rgba(245,247,255,0.06)"
                  strokeWidth={1}
                />
                <text
                  x={PADDING_X - 4}
                  y={y + 4}
                  textAnchor="end"
                  className={styles.axisLabel}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {reversed.map((log, i) => {
            const x = PADDING_X + gap + i * (barW + gap);
            const barH = (Number(log.moodScore) / Y_MAX) * innerHeight;
            const y = PADDING_Y_TOP + innerHeight - barH;
            const barCenterY = y + barH / 2;
            const level = getMoodLevel(Number(log.moodScore));

            return (
              <motion.rect
                key={log.date}
                x={x}
                y={y}
                width={barW}
                height={0}
                rx={4}
                fill={level.color}
                opacity={0.85}
                initial={{ height: 0, y: PADDING_Y_TOP + innerHeight }}
                animate={{ height: barH, y }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
                onHoverStart={() => setTooltip({ log, x: x + barW / 2, y: barCenterY })}
                onHoverEnd={() => setTooltip(null)}
                onPointerDown={() => setTooltip({ log, x: x + barW / 2, y: barCenterY })}
                onPointerUp={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* X-axis labels */}
          {reversed.map((log, i) => {
            const x = PADDING_X + gap + i * (barW + gap) + barW / 2;
            const y = chartHeight - 4;
            return (
              <text
                key={log.date}
                x={x}
                y={y}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {formatDate(log.date)}
              </text>
            );
          })}

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <rect
                  x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80) - 36}
                  y={Math.max(tooltip.y - 22, 4)}
                  width={72}
                  height={44}
                  rx={8}
                  fill="rgba(15,12,41,0.95)"
                  stroke="rgba(139,92,246,0.4)"
                  strokeWidth={1}
                />
                <text
                  x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80)}
                  y={Math.max(tooltip.y - 22, 4) + 17}
                  textAnchor="middle"
                  fill={getMoodLevel(Number(tooltip.log.moodScore)).color}
                  fontSize={13}
                  fontFamily="inherit"
                >
                  {getMoodLevel(Number(tooltip.log.moodScore)).emoji}{" "}
                  {tooltip.log.moodScore}/10
                </text>
                <text
                  x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80)}
                  y={Math.max(tooltip.y - 22, 4) + 34}
                  textAnchor="middle"
                  fill="rgba(245,247,255,0.7)"
                  fontSize={9}
                  fontFamily="inherit"
                >
                  {new Date(`${tooltip.log.date}T00:00:00`).toLocaleDateString(
                    "it-IT",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    );
  }

  // ── LINE CHART ─────────────────────────────────────────────────────────────
  const pointCount = reversed.length;
  const stepX = innerWidth / Math.max(pointCount - 1, 1);

  const points = reversed.map((log, i) => ({
    log,
    x: PADDING_X + i * stepX,
    y: PADDING_Y_TOP + innerHeight - (Number(log.moodScore) / Y_MAX) * innerHeight,
  }));

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area path (for gradient fill)
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PADDING_Y_TOP + innerHeight}` +
    ` L ${points[0].x} ${PADDING_Y_TOP + innerHeight} Z`;

  // Single-point case: render dot centered instead of line
  const isSinglePoint = pointCount === 1;

  // pathLength animation via strokeDashoffset
  const linePathRef = useRef<SVGPathElement>(null);
  const [lineDash, setLineDash] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (linePathRef.current && !isSinglePoint) {
      const len = linePathRef.current.getTotalLength();
      setLineDash([len, len]);
    }
  }, [isSinglePoint, linePath]);

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className={styles.svg}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.28)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </linearGradient>
        </defs>

        {/* Y-axis lines */}
        {yTicks.map((tick) => {
          const y = PADDING_Y_TOP + innerHeight - (tick / Y_MAX) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={PADDING_X}
                y1={y}
                x2={chartWidth - PADDING_X}
                y2={y}
                stroke="rgba(245,247,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={PADDING_X - 4}
                y={y + 4}
                textAnchor="end"
                className={styles.axisLabel}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {!isSinglePoint && (
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}

        {/* Single-point indicator */}
        {isSinglePoint && points[0] && (
          <motion.circle
            cx={PADDING_X + innerWidth / 2}
            cy={points[0].y}
            r={6}
            fill="rgba(139,92,246,0.8)"
            stroke="rgba(10,10,20,0.6)"
            strokeWidth={1.5}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}

        {/* Line */}
        {!isSinglePoint && (
          <motion.path
            ref={linePathRef}
            d={linePath}
            fill="none"
            stroke="rgba(139,92,246,0.8)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={lineDash.join(" ")}
            initial={{ strokeDashoffset: lineDash[0] }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          />
        )}

        {/* Dots */}
        {points.map((p, i) => {
          const level = getMoodLevel(Number(p.log.moodScore));
          return (
            <motion.circle
              key={p.log.date}
              cx={p.x}
              cy={p.y}
              r={0}
              fill={level.color}
              stroke="rgba(10,10,20,0.6)"
              strokeWidth={1.5}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 5, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.02 }}
              onHoverStart={() => setTooltip({ log: p.log, x: p.x, y: p.y })}
              onHoverEnd={() => setTooltip(null)}
              onPointerDown={() => setTooltip({ log: p.log, x: p.x, y: p.y })}
              onPointerUp={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* X-axis labels — show every Nth to avoid crowding */}
        {(() => {
          const labelEvery = pointCount <= 7 ? 1 : pointCount <= 14 ? 2 : 4;
          return points
            .filter((_, i) => i % labelEvery === 0 || i === pointCount - 1)
            .map((p) => (
              <text
                key={p.log.date}
                x={p.x}
                y={chartHeight - 4}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {formatDate(p.log.date)}
              </text>
            ));
        })()}

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.g
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <rect
                x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80) - 36}
                y={Math.max(tooltip.y - 52, 4)}
                width={72}
                height={44}
                rx={8}
                fill="rgba(15,12,41,0.95)"
                stroke="rgba(139,92,246,0.4)"
                strokeWidth={1}
              />
              <text
                x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80)}
                y={Math.max(tooltip.y - 52, 4) + 17}
                textAnchor="middle"
                fill={getMoodLevel(Number(tooltip.log.moodScore)).color}
                fontSize={13}
                fontFamily="inherit"
              >
                {getMoodLevel(Number(tooltip.log.moodScore)).emoji}{" "}
                {tooltip.log.moodScore}/10
              </text>
              <text
                x={Math.min(Math.max(tooltip.x, 40), chartWidth - 80)}
                y={Math.max(tooltip.y - 52, 4) + 34}
                textAnchor="middle"
                fill="rgba(245,247,255,0.7)"
                fontSize={9}
                fontFamily="inherit"
              >
                {new Date(`${tooltip.log.date}T00:00:00`).toLocaleDateString(
                  "it-IT",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
