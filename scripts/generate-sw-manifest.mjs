/**
 * Post-build script: scans out/ and injects a precache manifest into out/sw.js.
 *
 * Run automatically via the "postbuild" npm script after `next build`.
 * Zero external dependencies — uses only Node.js stdlib.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const OUT_DIR = join(process.cwd(), "out");
const BASE_PATH = "/Moonmood";
const SW_PATH = join(OUT_DIR, "sw.js");
const PLACEHOLDER = "self.__SW_MANIFEST__ || []";

/** Recursively collect all file paths under `dir`. */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectFiles(full)));
    } else {
      paths.push(full);
    }
  }
  return paths;
}

const EXCLUDE = new Set(["sw.js", ".nojekyll"]);

function shouldInclude(relPath) {
  if (EXCLUDE.has(relPath)) return false;
  if (relPath.startsWith(".")) return false;
  if (relPath.endsWith(".map")) return false;
  return true;
}

/** Convert a file path relative to out/ into a URL the browser will request. */
function toURL(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  if (normalized === "index.html") return `${BASE_PATH}/`;
  if (normalized.endsWith("/index.html")) {
    return `${BASE_PATH}/${normalized.replace(/\/index\.html$/, "/")}`;
  }
  return `${BASE_PATH}/${normalized}`;
}

const allFiles = await collectFiles(OUT_DIR);

const urls = allFiles
  .map((f) => relative(OUT_DIR, f))
  .filter(shouldInclude)
  .map(toURL)
  .sort();

const swSource = await readFile(SW_PATH, "utf-8");

if (!swSource.includes(PLACEHOLDER)) {
  console.error("ERROR: placeholder not found in sw.js — manifest NOT injected.");
  process.exit(1);
}

const patched = swSource.replace(PLACEHOLDER, JSON.stringify(urls));
await writeFile(SW_PATH, patched, "utf-8");

console.log(`SW manifest: ${urls.length} URLs injected into out/sw.js`);
