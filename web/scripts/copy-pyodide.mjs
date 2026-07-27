/**
 * Copies the Pyodide runtime into public/pyodide/ so the sandbox worker can
 * self-host it.
 *
 * Self-hosting rather than hitting a CDN keeps the page working offline and
 * under a strict connect-src. The copied directory is gitignored — it is
 * ~10MB of binaries that npm can reproduce on any checkout.
 *
 * Only the files the browser actually needs are copied. The full package
 * carries a large bundled stdlib of scientific wheels this course will never
 * import.
 */
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "..", "node_modules", "pyodide");
const to = join(here, "..", "public", "pyodide");

const NEEDED = [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "pyodide-lock.json",
  "python_stdlib.zip",
];

if (!existsSync(from)) {
  console.error("[copy-pyodide] pyodide is not installed; run npm install");
  process.exit(1);
}

await mkdir(to, { recursive: true });

const available = new Set(await readdir(from));
let copied = 0;
let bytes = 0;

for (const name of NEEDED) {
  if (!available.has(name)) continue;
  const src = join(from, name);
  await cp(src, join(to, name));
  bytes += (await stat(src)).size;
  copied += 1;
}

console.log(
  `[copy-pyodide] ${copied} files, ${(bytes / 1024 / 1024).toFixed(1)} MB → public/pyodide/`,
);
