/**
 * Publishes the built lesson artifacts from lesson-artifacts/dist/ to public/lessons/,
 * where the problem workspace and concept lesson views embed them.
 *
 * public/lessons/ is COMMITTED, because the deploy has no Python to run build.py. dist/ is
 * gitignored and exists only where someone ran `python3 lesson-artifacts/build.py`. So this
 * copies dist over the committed pages when there is a dist, and otherwise (CI, the deploy)
 * leaves the committed pages as they are. CI rebuilds from source and fails if the committed
 * pages differ (ci.yml, "Committed lesson pages match their sources"), which is what keeps
 * the two from drifting.
 */
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(web, "lesson-artifacts", "dist");
const out = join(web, "public", "lessons");

if (!existsSync(dist)) {
  if (!existsSync(join(out, "getting-started"))) {
    console.error("[build-lesson-artifacts] no dist/ and no committed public/lessons/: run python3 lesson-artifacts/build.py");
    process.exit(1);
  }
  console.log("[build-lesson-artifacts] no dist/; serving the committed public/lessons/");
  process.exit(0);
}

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
