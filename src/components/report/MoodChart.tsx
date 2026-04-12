"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMoodLevel } from "@/lib/moodConfig";
import type { MoodLog } from "@/types/mood";
import styles from "./MoodChart.module.css";

import type { Range } from "@/types/report";

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

function clampTooltipX(x: number, chartWidth: number, tooltipW: number): number {
  const halfW = tooltipW / 2;
  return Math.min(Math.max(x, halfW + 4), chartWidth - halfW - 4);
}

function clampTooltipY(y: number, chartHeight: number, tooltipH: number): number {
  return Math.max(4, Math.min(y - tooltipH / 2, chartHeight - tooltipH - 4));
}

export default function MoodChart({ logs, range }: MoodChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const isBarChart = range === "7";
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

  const yTicks = [0, 5, 10];

  if (reversed.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  // ── BAR CHART (7gg only) ───────────────────────────────────────────────────
  if (isBarChart) {
    const barCount = reversed.length;
    const totalGap = barCount + 1;
    const barWidth = Math.max(4, innerWidth / totalGap);
    const barW = Math.min(barWidth * 0.7, 28);
    const gap = Math.max(0, (innerWidth - barW * barCount) / (barCount + 1));

    const labelEvery = barCount <= 7 ? 1 : barCount <= 14 ? 2 : barCount <= 30 ? 3 : 5;

    const TOOLTIP_W = 72;
    const TOOLTIP_H = 44;
    const tooltipY = clampTooltipY(tooltip?.y ?? 0, chartHeight, TOOLTIP_H);
    const tooltipX = tooltip ? clampTooltipX(tooltip.x, chartWidth, TOOLTIP_W) : 0;

    return (
      <div ref={containerRef} className={styles.wrapper}>
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className={styles.svg}
        >
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

          {reversed.map((log, i) => {
            const x = PADDING_X + gap + i * (barW + gap);
            const barH = (Number(log.moodScore) / Y_MAX) * innerHeight;
            const y = PADDING_Y_TOP + innerHeight - barH;
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
                  delay: i * 0.04,
                  ease: "easeOut",
                }}
                onHoverStart={() => setTooltip({ log, x: x + barW / 2, y: y + barH / 2 })}
                onHoverEnd={() => setTooltip(null)}
                onPointerDown={() => setTooltip({ log, x: x + barW / 2, y: y + barH / 2 })}
                onPointerUp={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {reversed.map((log, i) => {
            if (i % labelEvery !== 0 && i !== reversed.length - 1) return null;
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

          <AnimatePresence>
            {tooltip && (
              <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <rect
                  x={tooltipX - TOOLTIP_W / 2}
                  y={tooltipY}
                  width={TOOLTIP_W}
                  height={TOOLTIP_H}
                  rx={8}
                  fill="rgba(15,12,41,0.95)"
                  stroke="rgba(139,92,246,0.4)"
                  strokeWidth={1}
                />
                <text
                  x={tooltipX}
                  y={tooltipY + 17}
                  textAnchor="middle"
                  fill={getMoodLevel(Number(tooltip.log.moodScore)).color}
                  fontSize={13}
                  fontFamily="inherit"
                >
                  {getMoodLevel(Number(tooltip.log.moodScore)).emoji}{" "}
                  {tooltip.log.moodScore}/10
                </text>
                <text
                  x={tooltipX}
                  y={tooltipY + 34}
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

  // ── LINE CHART (30/90/all) ─────────────────────────────────────────────────
  const pointCount = reversed.length;
  const stepX = innerWidth / Math.max(pointCount - 1, 1);

  const points = reversed.map((log, i) => ({
    log,
    x: PADDING_X + i * stepX,
    y: PADDING_Y_TOP + innerHeight - (Number(log.moodScore) / Y_MAX) * innerHeight,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PADDING_Y_TOP + innerHeight}` +
    ` L ${points[0].x} ${PADDING_Y_TOP + innerHeight} Z`;

  const isSinglePoint = pointCount === 1;
  const useHeavyAnimations = pointCount <= 30;

  const linePathRef = useRef<SVGPathElement>(null);
  const [lineDash, setLineDash] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (linePathRef.current && !isSinglePoint) {
      const len = linePathRef.current.getTotalLength();
      setLineDash([len, len]);
    }
  }, [isSinglePoint]);

  const labelEvery = pointCount <= 7 ? 1 : pointCount <= 14 ? 2 : pointCount <= 30 ? 3 : 7;

  const TOOLTIP_W = 72;
  const TOOLTIP_H = 44;
  const tooltipY = clampTooltipY(tooltip?.y ?? 0, chartHeight, TOOLTIP_H);
  const tooltipX = tooltip ? clampTooltipX(tooltip.x, chartWidth, TOOLTIP_W) : 0;

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

        {!isSinglePoint && (
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}

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

        {useHeavyAnimations
          ? points.map((p, i) => {
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
            })
          : points.map((p) => {
              const level = getMoodLevel(Number(p.log.moodScore));
              return (
                <circle
                  key={p.log.date}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={level.color}
                  stroke="rgba(10,10,20,0.6)"
                  strokeWidth={1.5}
                  onMouseEnter={() => setTooltip({ log: p.log, x: p.x, y: p.y })}
                  onMouseLeave={() => setTooltip(null)}
                  onPointerDown={() => setTooltip({ log: p.log, x: p.x, y: p.y })}
                  onPointerUp={() => setTooltip(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

        {points
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
          ))}

        <AnimatePresence>
          {tooltip && (
            <motion.g
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <rect
                x={tooltipX - TOOLTIP_W / 2}
                y={tooltipY}
                width={TOOLTIP_W}
                height={TOOLTIP_H}
                rx={8}
                fill="rgba(15,12,41,0.95)"
                stroke="rgba(139,92,246,0.4)"
                strokeWidth={1}
              />
              <text
                x={tooltipX}
                y={tooltipY + 17}
                textAnchor="middle"
                fill={getMoodLevel(Number(tooltip.log.moodScore)).color}
                fontSize={13}
                fontFamily="inherit"
              >
                {getMoodLevel(Number(tooltip.log.moodScore)).emoji}{" "}
                {tooltip.log.moodScore}/10
              </text>
              <text
                x={tooltipX}
                y={tooltipY + 34}
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
