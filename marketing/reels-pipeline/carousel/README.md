# Carousels (work in progress, issue: see the October content plan on the board)

Cheatsheet carousels are built from the product's own cheatsheets (`web/src/lib/course/cheatsheets`),
gold tier only (14 hand-written modules; the 7 template-tier sheets are generated and left out).

Done:
- `dump_sheets.ts`: dumps every gold sheet with its module title and the registry counts.
  From `web/`: `npx tsx ../marketing/reels-pipeline/carousel/dump_sheets.ts > ../marketing/reels-pipeline/carousel/sheets.json`
- `sheets.json`: that dump as of 2026-09-30 (21 cheatsheets in the registry, 14 gold).

To build (not started):
- `cheatsheet.py`: slides at 1080x1350 per module on the reels' look (grid ground, Space Mono
  display, teal accent): 1 cover (module, tagline, "Save this"), 2 smell → pattern, then the
  patterns two per slide, then targets + traps, then a CTA naming the registry's real count.
  The two-pointers single card (`instagram/2026-09-30-two-pointers-card/sources/cardhtml.py`,
  `render_card.mjs`) is the starting point for markup and rendering.
- A render step that screenshots each slide with Playwright and FAILS on overflow, and a drift
  check that re-dumps and compares to `sheets.json` (the two-pointers `verify.py` does this).
- One package per module under `marketing/instagram/<date>-<module>-cheatsheet/` with post.md
  (hook, caption, 5 hashtags per `skill/references/formats.md`, alt text) and slideN.png.
