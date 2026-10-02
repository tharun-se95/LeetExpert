// Prints every gold-tier cheatsheet (the hand-written ones) with its module title, plus the
// registry counts, as JSON. Run from web/ (for its tsconfig paths):
//   cd web && npx tsx ../marketing/reels-pipeline/carousel/dump_sheets.ts > ../marketing/reels-pipeline/carousel/sheets.json
import { CHEATSHEETS } from "../../../web/src/lib/course/cheatsheets/registry";
import { MODULES } from "../../../web/src/lib/course/manifest";

const titles = Object.fromEntries(MODULES.map((m: { slug: string; title: string }) => [m.slug, m.title]));
const sheets = Object.values(CHEATSHEETS)
  .filter((s) => s.tier === "gold")
  .map((s) => ({ ...s, title: titles[s.moduleSlug] ?? s.moduleSlug }));
console.log(JSON.stringify({ sheets, counts: { cheatsheets: Object.keys(CHEATSHEETS).length, modules: MODULES.length } }, null, 1));
