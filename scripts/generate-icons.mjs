/**
 * Generate PWA icons for Moonmood (aurora boreale style).
 *
 * Usage:  node scripts/generate-icons.mjs
 *
 * Produces:
 *   public/icons/icon-180x180.png   (apple-touch-icon)
 *   public/icons/icon-192x192.png
 *   public/icons/icon-512x512.png
 *   public/icons/icon-maskable-512x512.png
 *
 * Requires: pnpm add -D @napi-rs/canvas
 */
import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "public", "icons");
mkdirSync(ICONS_DIR, { recursive: true });

// Moonmood design tokens
const BG = "#0a0a0f";
const VIOLET = "#8b5cf6";
const CYAN = "#06b6d4";
const PINK = "#ec4899";

/**
 * Hex color to rgba with given alpha.
 */
function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Draw an aurora boreale-inspired icon on the given canvas context.
 * Colors are vibrant so the icon looks good even at 60pt on iOS home screen.
 */
function drawIcon(ctx, size, maskable = false) {
  const cx = size / 2;
  const cy = size / 2;

  // Background — slightly lighter to let aurora show
  ctx.fillStyle = "#0c0c18";
  ctx.fillRect(0, 0, size, size);

  // Aurora glow layers — strong, vibrant gradients
  const layers = [
    // Big violet base glow (bottom-left)
    { x: size * 0.25, y: size * 0.8, r: size * 0.7, color: VIOLET, alpha: 0.7 },
    // Cyan sweep (top-right)
    { x: size * 0.75, y: size * 0.3, r: size * 0.65, color: CYAN, alpha: 0.5 },
    // Pink accent (center-top)
    { x: size * 0.45, y: size * 0.2, r: size * 0.45, color: PINK, alpha: 0.35 },
    // Secondary violet (top-left)
    { x: size * 0.15, y: size * 0.25, r: size * 0.4, color: VIOLET, alpha: 0.4 },
    // Secondary cyan (bottom-right)
    { x: size * 0.85, y: size * 0.75, r: size * 0.35, color: CYAN, alpha: 0.35 },
    // Extra pink warmth (center)
    { x: size * 0.5, y: size * 0.55, r: size * 0.35, color: PINK, alpha: 0.2 },
  ];

  for (const l of layers) {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0, rgba(l.color, 0.9));
    grad.addColorStop(0.4, rgba(l.color, 0.4));
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.globalAlpha = 1;

  // Crescent moon — centered and prominent
  const moonScale = maskable ? 0.24 : 0.28;
  const moonR = size * moonScale;
  const moonCx = cx;
  const moonCy = cy - size * 0.06;
  const shadowOffset = moonR * 0.5;

  // Subtle moon glow
  const moonGlow = ctx.createRadialGradient(
    moonCx, moonCy, moonR * 0.8,
    moonCx, moonCy, moonR * 1.6
  );
  moonGlow.addColorStop(0, "rgba(245, 247, 255, 0.15)");
  moonGlow.addColorStop(1, "transparent");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, size, size);

  // Moon body
  ctx.beginPath();
  ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245, 247, 255, 0.95)";
  ctx.fill();

  // Crescent cutout
  ctx.beginPath();
  ctx.arc(
    moonCx + shadowOffset,
    moonCy - shadowOffset * 0.25,
    moonR * 0.82,
    0,
    Math.PI * 2
  );
  // Fill cutout with a dark color that shows aurora through
  const cutoutGrad = ctx.createRadialGradient(
    moonCx + shadowOffset, moonCy - shadowOffset * 0.25, 0,
    moonCx + shadowOffset, moonCy - shadowOffset * 0.25, moonR * 0.82
  );
  cutoutGrad.addColorStop(0, "#12122a");
  cutoutGrad.addColorStop(1, "#0c0c18");
  ctx.fillStyle = cutoutGrad;
  ctx.fill();

  // Aurora bleed into the cutout area (makes it look more integrated)
  for (const l of layers.slice(0, 3)) {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0, rgba(l.color, 0.6));
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = l.alpha * 0.25;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(
      moonCx + shadowOffset,
      moonCy - shadowOffset * 0.25,
      moonR * 0.82,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Star dots — brighter and bigger
  const starColor = "rgba(245, 247, 255, 0.85)";
  const stars = [
    { x: 0.14, y: 0.13, r: 2.2 },
    { x: 0.84, y: 0.15, r: 1.8 },
    { x: 0.92, y: 0.42, r: 1.5 },
    { x: 0.10, y: 0.52, r: 1.8 },
    { x: 0.90, y: 0.68, r: 1.3 },
    { x: 0.18, y: 0.85, r: 1.6 },
    { x: 0.78, y: 0.88, r: 1.4 },
    { x: 0.50, y: 0.08, r: 1.3 },
    { x: 0.35, y: 0.92, r: 1.2 },
  ];

  ctx.fillStyle = starColor;
  for (const s of stars) {
    const sr = (s.r / 512) * size * 1.5;
    ctx.beginPath();
    ctx.arc(s.x * size, s.y * size, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function generateIcon(size, filename, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  drawIcon(ctx, size, maskable);
  const buffer = canvas.toBuffer("image/png");
  const outPath = join(ICONS_DIR, filename);
  writeFileSync(outPath, buffer);
  console.log(`  ✓ ${outPath} (${buffer.length} bytes)`);
}

console.log("Generating Moonmood PWA icons...");
generateIcon(180, "icon-180x180.png", false);
generateIcon(192, "icon-192x192.png", false);
generateIcon(512, "icon-512x512.png", false);
generateIcon(512, "icon-maskable-512x512.png", true);
console.log("Done!");
