/**
 * Copies the built lesson artifacts from lesson-artifacts/dist/ to public/lessons/,
 * where the problem workspace and concept lesson views embed them.
 *
 * Built at prebuild/predev rather than committed to git: generated HTML pages
 * are hundreds of KB each and drift from their source code and tokens if committed.
 * The public/lessons directory is gitignored like public/pyodide and public/artifacts.
 */
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(web, "lesson-artifacts", "dist");
const out = join(web, "public", "lessons");

await mkdir(out, { recursive: true });

const entries = await readdir(dist);
let copiedCount = 0;

for (const entry of entries) {
  // Skip internal gate files, hidden files, and special specimens
  if (entry.startsWith(".") || entry.startsWith("_") || entry === "specimens") {
    continue;
  }
  const srcPath = join(dist, entry);
  const destPath = join(out, entry);
  const s = await stat(srcPath);

  if (s.isDirectory()) {
    await cp(srcPath, destPath, { recursive: true });
    // Count html files in directory
    const files = await readdir(srcPath);
    copiedCount += files.filter((f) => f.endsWith(".html")).length;
  } else if (entry.endsWith(".html")) {
    await cp(srcPath, destPath);
    copiedCount++;
  }
}

console.log(`[build-lesson-artifacts] ${copiedCount} lesson artifact(s) published -> public/lessons/`);
