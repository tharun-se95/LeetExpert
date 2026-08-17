/**
 * Writes src/lib/coach/corpus.generated.json so the API route can look
 * up hint ladders without reading sibling course/ on Vercel.
 *
 * Calls src/lib/coach/buildCorpus.ts through jiti rather than mirroring
 * it: the extraction chain (sandbox fence, tab split, hints, thesis) is
 * remark-based, and a second hand-rolled copy here drifted silently once
 * already — thesis landed in the TS builder and never reached the JSON.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const here = dirname(fileURLToPath(import.meta.url));
const COURSE = join(here, "..", "..", "course");

if (!existsSync(COURSE)) {
  console.error(`[coach-corpus] course/ not found at ${COURSE}`);
  process.exit(1);
}

const jiti = createJiti(import.meta.url);
const { buildCorpus, writeCoachCorpus } = await jiti.import(
  "../src/lib/coach/buildCorpus.ts",
);

const out = writeCoachCorpus();
console.log(
  `[coach-corpus] ${Object.keys(buildCorpus()).length} problems → ${out}`,
);
