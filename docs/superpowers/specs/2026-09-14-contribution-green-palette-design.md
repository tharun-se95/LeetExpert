# Contribution green palette — tokens and status colours

**Date:** 2026-09-14
**Scope (spec 1 of 3):** a generated eight-hue palette in `web/src/app/globals.css`,
the status colours (`--good`, `--bad`, `--warn`, `--info`, `--insight`) and their
`*-surface` fills moved onto it, a checked-in generator, and the tests that guard
both. Callouts are spec 2 (`2026-09-13-callout-system-design.md`, revised the same
day); family colours are spec 3 (not yet written).
**Status:** proposed — every decision below was made by the owner in brainstorming
on 2026-09-14. Preview: "Contribution Green Palette" artifact.

---

## 1. Why

The owner found the light theme's colours dull and the family colours unappealing,
and picked GitHub's contribution-graph green as the colour to build around. That
green works because its four levels step evenly in perceived lightness and
saturation. Copying those *steps* to other hues gives a set that reads as one
family; copying only the hex would not.

## 2. How the palette is derived

**Anchors** — GitHub's contribution ramps, dark `#0e4429 #006d32 #26a641 #39d353`
and light `#9be9a8 #40c463 #30a14e #216e39`. In OKLCH (lightness / chroma):

| Level | Dark | Light |
| --- | --- | --- |
| 1 | 0.344 / 0.073 | 0.867 / 0.118 |
| 2 | 0.468 / 0.126 | 0.727 / 0.178 |
| 3 | 0.637 / 0.178 | 0.627 / 0.157 |
| 4 | 0.762 / 0.212 | 0.478 / 0.112 |

**Rule** — every hue takes the anchor's lightness and chroma at each level. Where a
screen (sRGB) cannot show that chroma at that lightness, chroma is lowered and
lightness kept, so every hue has the same brightness steps. Level *n* means the
same strength against its own theme's paper in both themes: 1 is quietest, 4 is
strongest.

**Proof** — at the green's own hue the rule returns all eight GitHub colours
exactly. This is asserted in CI (§6).

**Text colours (owner decision).** Light level 4 copies GitHub's low chroma
(0.112), which made light red brownish (`#92403c`). Light *text* colours instead
use level 4's lightness at 98% of the maximum chroma the screen allows at that
lightness, stepping lightness down only if a light surface would drop below 4.5:1.
Dark text colours are dark level 4, which already sits at or near the gamut limit.

**Hues** — red 25°, orange 55°, yellow 95°, green 146° (the anchor), cyan 200°,
blue 255°, purple 300°, pink 350°. The closest pair is red/orange (OKLab distance
8.2 at dark level 4), then red/pink 9.8 and blue/purple 10.5; red is therefore
reserved for failure and never a family colour (spec 3).

## 3. The palette

| Hue | Dark 1–4 | Light 1–4 | Light text |
| --- | --- | --- | --- |
| red | `#592825 #943734 #e35551 #ff8b83` | `#ffc2bc #ff766f #d75b56 #92403c` | `#b0081d` |
| orange | `#552d0e #8a4500 #d16c00 #ff923a` | `#ffc59f #f98209 #cd6900 #8c490d` | `#8e4805` |
| yellow | `#453800 #6b5900 #a48900 #d1af00` | `#ebd374 #c4a400 #a18600 #6e5c00` | `#6e5c05` |
| green | `#0e4429 #006d32 #26a641 #39d353` | `#9be9a8 #40c463 #30a14e #216e39` | `#067123` |
| cyan | `#004245 #00676c #009ea5 #00cad2` | `#62ebf2 #00bdc5 #009ba2 #006a6f` | `#066a6e` |
| blue | `#1d3a5e #205a9f #318bf3 #7ab5ff` | `#b6d6ff #64a9ff #3d89e4 #2c5e9b` | `#055bb1` |
| purple | `#3f2f59 #664695 #9d6ce5 #c09bff` | `#dac8ff #b88bff #986ed8 #674c92` | `#770ad0` |
| pink | `#54283e #8c3764 #d6559a #ff80c1` | `#ffbddb #f671b6 #cb5a95 #8a3f66` | `#a5076c` |

Blue and cyan look calmer than the rest at the strong levels: at dark level 4 the
screen allows chroma 0.12 (blue) and 0.13 (cyan) against green's 0.21. That is a
display limit, not a tuning choice.

## 4. Tokens

### 4.1 Primitives (tier 1)

For each hue *h* and level *n*, `--hue-h-n` is defined in `:root` with the light
value and redefined in `.dark` with the dark value; `--hue-h-ink` likewise holds
the light text colour and the dark level 4. They replace `--press-green`,
`--press-red`, `--press-amber`, `--press-insight` and `--tone-sky` as the source of
status colour. Primitives are not mapped into `@theme` in this spec: components
keep using semantic names, and spec 3 exposes what families need.

### 4.2 Semantic (tier 2) — names unchanged

The 426 uses of status colour across 56 files (`bad` 170, `good` 119, `insight`
61, `warn` 48, `info` 28) keep their names, so this is a token change, not a
component change.

| Token | Hue | Light | Dark |
| --- | --- | --- | --- |
| `--good` | green | `--hue-green-ink` `#067123` | `#39d353` |
| `--bad` | red | `#b0081d` | `#ff8b83` |
| `--warn` | orange | `#8e4805` | `#ff923a` |
| `--info` | blue | `#055bb1` | `#7ab5ff` |
| `--insight` | yellow | `#6e5c05` | `#d1af00` |
| `--{role}-surface` | same hue | level 1 | level 1 |
| `--{role}-line` (new) | same hue | level 3 | level 4 |

`--{role}-line` is for rules, borders and strokes that must clear the 3:1 non-text
floor. It is mapped into `@theme` as `--color-{role}-line`.

### 4.3 Where lines may sit

Light level 3 clears 3:1 on `--elevated` (3.32–3.86) and `--background`
(3.01–3.50) but **not** on `--code` (2.72–3.17) or `--surface` (2.44–2.84). A
`*-line` token is only for content on `--elevated` or `--background`; on a
recessed surface use the text colour. Both callout layouts measured on
2026-09-13 paint on `--elevated`.

## 5. Measured

Minimum contrast across every surface a colour can paint on (light: paper,
elevated, code, sunk; dark: the same four):

| Role | Light text (min, on sunk) | Dark text (min, on elevated) | Text on own surface, light / dark |
| --- | --- | --- | --- |
| good | 4.55 | 7.62 | 4.31 / 5.65 |
| bad | 5.32 | 6.66 | 4.72 / 5.28 |
| warn | 5.01 | 6.77 | 4.46 / 5.33 |
| info | 4.92 | 7.09 | 4.48 / 5.43 |
| insight | 4.83 | 7.07 | 4.41 / 5.41 |

Floors: text ≥ 4.5:1 on every surface; text on its own `*-surface` ≥ 3:1 (the
existing test's large-text floor); lines ≥ 3:1 on `--elevated` and `--background`.
`good` has the least margin (4.55).

### 5.1 What learners will notice

- **Difficulty badges** (`problemDifficulty.ts`): Easy green, Medium orange, Hard
  red — same meanings, new hues; light green and blue become more saturated.
- **Sandbox verdicts, quiz right/wrong, cheatsheet tones, coach diagnosis**: same
  roles, new colours.
- **Dark theme**: failure red moves from `#f15858` to a lighter salmon `#ff8b83`;
  insight gold from `#facc15` to a duller `#d1af00`.
- **Next.js lesson diagrams** (about 20 files) change too, but that course is
  disabled.

## 6. Generator and tests

- **Create `web/src/lib/visual/palette.ts`** — exports the GitHub anchors, the hue
  angles, `ramp(hue, theme): string[]` (levels 1–4) and `textInk(hue, theme)`,
  implementing §2 with OKLCH ↔ sRGB conversion and gamut mapping. It has no React
  or DOM imports.
- **Create `web/tests/palette.test.ts`:**
  1. `ramp` at the green's hue returns GitHub's eight colours exactly.
  2. Every `--hue-h-n` and `--hue-h-ink` in `globals.css` (`:root` and `.dark`)
     equals the generator's output — so the CSS cannot be hand-edited away from
     the derivation.
  3. Proves it can fail: a changed hue angle produces a mismatch.
- **Rewrite `design-tokens.test.ts`'s** "status inks clear AA text contrast on
  every surface, both themes" to resolve `--good`…`--insight` through their
  `var()` chains per theme — a small helper that reads the `:root` and `.dark`
  blocks, prefers the theme block's definition, falls back to `:root`, and follows
  `var(--x)` until it reaches a hex — and assert §5's floors; add the `*-line` floor on `--elevated` and `--background`; update
  "Insight and Information roles are defined and AA-compliant" (it pins `#854d0e`
  and `#facc15`) and "Callout pastel surface tokens exist and are AA-compliant"
  (it reads `--press-*-surface` names) to the new tokens.
- Each changed test is shown failing before it passes (CLAUDE.md §2).

## 7. Documentation

CLAUDE.md §4: replace "Status text inks are AA-darkened from sheet
Success/Warning/Error fills" with the palette rule (derived from GitHub's
contribution ramp; `palette.ts` is the source; light text at max in-gamut chroma;
lines only on elevated or background).

## 8. Out of scope

- **Callouts** — spec 2.
- **Family colours** — spec 3. Decided: Linear cyan, Pointers orange, Ordering
  blue, Recursive purple, State yellow, Graphs green, Priority pink; families
  share hues with status meanings but stay scoped to hub cards and viz. Open for
  spec 3: `familyCssVars` remaps `--accent`/`--pop` (read in 116 files) from one
  `uiAccent()` hex, which cannot express per-theme values; light purple text is
  very saturated (`#770ad0`, chroma 0.25).
- **Code highlighting** (`codePalette.ts`, `--tok-*`) — unchanged.
- **Steel primary** (`--accent`, `--mark`) — unchanged.

## 9. Risks

- `good` light text clears the deepest surface by 0.05 (4.55). The generator test
  and the status test both fail if a surface token darkens.
- Dark insight and dark failure change character (§5.1). Both were seen by the
  owner on the preview page; confirm in the running app before merging.
