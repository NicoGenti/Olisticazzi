/**
 * Generate PWA icons for Moonmood (aurora boreale style).
 *
 * Usage:  node scripts/generate-icons.mjs
 *
 * Produces:
 *   public/icons/icon-192x192.png
 *   public/icons/icon-512x512.png
 *   public/icons/icon-maskable-512x512.png
 *
 * Requires: npm install --save-dev canvas  (or pnpm add -D canvas)
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
 * Draw an aurora boreale-inspired icon on the given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {boolean} maskable — if true, keep content within 80% safe zone
 */
function drawIcon(ctx, size, maskable = false) {
  const cx = size / 2;
  const cy = size / 2;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  // Aurora glow layers (radial gradients)
  const layers = [
    { x: size * 0.3, y: size * 0.7, r: size * 0.55, color: VIOLET, alpha: 0.45 },
    { x: size * 0.65, y: size * 0.55, r: size * 0.5, color: CYAN, alpha: 0.35 },
    { x: size * 0.5, y: size * 0.35, r: size * 0.4, color: PINK, alpha: 0.25 },
    { x: size * 0.2, y: size * 0.3, r: size * 0.35, color: VIOLET, alpha: 0.2 },
    { x: size * 0.75, y: size * 0.75, r: size * 0.3, color: CYAN, alpha: 0.18 },
  ];

  for (const l of layers) {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0, l.color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.globalAlpha = 1;

  // Crescent moon
  const moonScale = maskable ? 0.28 : 0.32;
  const moonR = size * moonScale;
  const moonCx = cx - size * 0.02;
  const moonCy = cy - size * 0.08;
  const shadowOffset = moonR * 0.55;

  // Draw full circle (moon body)
  ctx.beginPath();
  ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245, 247, 255, 0.92)";
  ctx.fill();

  // Cut out crescent shadow
  ctx.beginPath();
  ctx.arc(moonCx + shadowOffset, moonCy - shadowOffset * 0.3, moonR * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = BG;
  ctx.fill();

  // Re-draw aurora glow over the shadow to blend
  for (const l of layers.slice(0, 2)) {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0, l.color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = l.alpha * 0.3;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(moonCx + shadowOffset, moonCy - shadowOffset * 0.3, moonR * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // "M" letter below the moon
  const fontSize = maskable ? size * 0.14 : size * 0.16;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Gradient-like text effect (simplified — use solid accent)
  ctx.fillStyle = "rgba(245, 247, 255, 0.85)";
  ctx.fillText("M", cx, cy + moonR + fontSize * 0.75);

  // Subtle star dots
  ctx.fillStyle = "rgba(245, 247, 255, 0.6)";
  const stars = [
    { x: 0.15, y: 0.12, r: 1.5 },
    { x: 0.82, y: 0.18, r: 1.2 },
    { x: 0.9, y: 0.4, r: 1.0 },
    { x: 0.12, y: 0.55, r: 1.3 },
    { x: 0.88, y: 0.65, r: 0.9 },
    { x: 0.25, y: 0.88, r: 1.1 },
    { x: 0.72, y: 0.9, r: 1.0 },
  ];

  for (const s of stars) {
    const sr = (s.r / 512) * size;
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
generateIcon(192, "icon-192x192.png", false);
generateIcon(512, "icon-512x512.png", false);
generateIcon(512, "icon-maskable-512x512.png", true);
console.log("Done!");
