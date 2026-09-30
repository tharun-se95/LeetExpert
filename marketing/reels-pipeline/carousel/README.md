# Carousels

Cheatsheet carousels (issue #133) are built from the product's own cheatsheets
(`web/src/lib/course/cheatsheets`), gold tier only: the 14 hand-written modules, less two pointers,
which has its own single card (#128). The 7 template-tier sheets are generated and left out.

Each carousel is 1080×1350: a cover (module, tagline, what is inside, "Save this"), smell →
pattern, one slide per pattern, targets and traps, and a closing slide naming the registry's
real cheatsheet count. Every word comes from the sheet or the registry.

## Files

- `dump_sheets.ts`: prints every gold sheet with its module title and the registry counts.
- `sheets.json`: that dump. Regenerate it when `gold.ts` changes (see below).
- `cheatsheet.py`: writes the slides as HTML to `build/<module>/` (git-ignored) and each
  package's `post.md` (hook, caption, five hashtags, alt text per slide) to
  `marketing/instagram/2026-09-30-<module>-cheatsheet/`.
- `render.mjs`: screenshots the slides into the packages as `slideN.png`. It **fails** if any
  element leaves its slide's frame, if unwrapped text spills out of its box, or if a face did
  not load.
- `kit.py`: places the carousels in `../posting-kit/october.json` (dates and the reasoning are
  in its docstring) with the caption, hashtags, alt text and hook from each `post.md`.
- `check.py`: **fails** if `sheets.json` has drifted from `gold.ts`, if a `post.md` or the kit
  differs from a fresh build, if a package's slides don't match its build, or if a post
  lacks exactly five hashtags.

## Build

From this directory:

```bash
(cd ../../../web && npx tsx ../marketing/reels-pipeline/carousel/dump_sheets.ts > ../marketing/reels-pipeline/carousel/sheets.json)
python3 cheatsheet.py && node render.mjs && python3 kit.py
PYTHONDONTWRITEBYTECODE=1 python3 check.py
```

`render.mjs` uses playwright-core from `web/node_modules`. If its own browser build is not
downloaded, point `PW_CHROMIUM` at any Chromium: on the cloud image
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, on a Mac a
`~/Library/Caches/ms-playwright/chromium_headless_shell-*/…/chrome-headless-shell`.

Each check has been seen to fail (2026-09-30): a changed word in `sheets.json`, a missing
slide, an overlong pattern summary, a value column too narrow for "O(h) / O(w)", and a
changed hashtag in `october.json`.

## Publishing

The posting kit page shows each carousel from its asset ids in `../posting-kit/build.py`
`MEDIA`; until they are added it lists the post as "media not uploaded yet". Upload each
package's `slide*.png` to the kit artifact, add `"cs-<module>": {"kind": "Carousel · N slides",
"files": [("slide 1", "<asset id>", "png"), …]}` to `MEDIA`, rebuild, and republish. Add the
posts to the ledger artifact with their `scheduledFor` dates from `october.json`.
