/**
 * Builds the course overviews (lesson-artifacts/build.py "overviews") and copies
 * them to public/artifacts/, where /courses/dsa/overviews/<slug> frames them.
 *
 * Built at prebuild/predev rather than committed: each page is 200-300 KB of
 * generated HTML, and a copy in git would drift from the kit, the tokens and the
 * code it embeds. The copied directory is gitignored like public/pyodide.
 * `src/lib/course/overviews.generated.json` is committed, as sandboxIds is: the
 * app imports it, and tests/overviewPages.test.ts fails when it drifts from
 * build.py's declarations.
 *
 * Needs python3 (as CI and the ledger already do) and node_modules (build.py
 * runs tsx for highlighting and lesson rendering).
 */
import { spawnSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = join(web, "lesson-artifacts");
const build = join(artifacts, "build.py");
const dist = join(artifacts, "dist");
const out = join(web, "public", "artifacts");

function py(args) {
  const run = spawnSync("python3", [build, ...args], { cwd: web, encoding: "utf8" });
  if (run.error || run.status !== 0) {
    console.error(`[build-overviews] python3 build.py ${args.join(" ")} failed`);
    console.error(run.error ? String(run.error) : run.stdout + run.stderr);
    process.exit(1);
  }
  return run.stdout;
}

const declared = JSON.parse(py(["--overviews"]));
for (const o of declared) py([`overviews/${o.slug}`]);

// Only what the overviews load: the pages, their faces and motion.js, all
// beside each other as build.py lays them out (pages reference ../fonts, ../vendor).
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const part of ["overviews", "fonts", "vendor"]) {
  await cp(join(dist, part), join(out, part), { recursive: true });
}
await writeFile(
  join(web, "src", "lib", "course", "overviews.generated.json"),
  JSON.stringify(declared, null, 2) + "\n",
);
console.log(`[build-overviews] ${declared.length} overview(s) -> public/artifacts/`);
