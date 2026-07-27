/**
 * Builds the lesson search index.
 *
 * Written to public/ and fetched on demand rather than bundled: the index is
 * useless until someone actually opens search, so making all 191 lessons pay
 * for it on every page load would be the wrong trade.
 *
 * The index deliberately carries only titles and headings, not full prose.
 * Headings are where the answerable questions live ("where did he explain the
 * write-pointer invariant?"), and indexing the body would multiply the file
 * size for matches too diffuse to rank well without a real search engine.
 *
 * Module titles are NOT included — the client already imports the manifest
 * for the sidebar, so it joins them by slug instead of duplicating them here.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const COURSE = join(here, "..", "..", "course");
const OUT = join(here, "..", "public", "search-index.json");

const entries = [];

for (const moduleSlug of readdirSync(COURSE)) {
  const moduleDir = join(COURSE, moduleSlug);
  if (!statSync(moduleDir).isDirectory()) continue;

  for (const file of readdirSync(moduleDir)) {
    if (!file.endsWith(".md")) continue;
    const body = readFileSync(join(moduleDir, file), "utf8");

    const fm = /^---\n([\s\S]*?)\n---/.exec(body);
    const title = fm && /(?:^|\n)title:\s*(.+)/.exec(fm[1])?.[1]?.trim();
    const type = fm && /(?:^|\n)type:\s*(.+)/.exec(fm[1])?.[1]?.trim();
    if (!title) continue;

    // `## ` only. h3s are mostly sub-steps and would crowd the results.
    const headings = [...body.matchAll(/^##\s+(.+)$/gm)]
      .map((m) => m[1].trim())
      .filter((h) => h.length < 70);

    entries.push({
      m: moduleSlug,
      s: file.replace(/\.md$/, ""),
      t: title,
      y: type ?? "concept",
      h: headings,
    });
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(entries));

const kb = (Buffer.byteLength(JSON.stringify(entries)) / 1024).toFixed(1);
console.log(`[search-index] ${entries.length} lessons, ${kb} KB → public/search-index.json`);
