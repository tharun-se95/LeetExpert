# Contribution Green Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement spec `docs/superpowers/specs/2026-09-14-contribution-green-palette-design.md` — a generated eight-hue palette, with the status colours (`--good`, `--bad`, `--warn`, `--info`, `--insight`), their `*-surface` fills and new `*-line` tokens moved onto it.

**Architecture:** `web/src/lib/visual/palette.ts` derives every colour from GitHub's contribution ramps in OKLCH and prints the CSS declarations; `globals.css` holds those declarations as `--hue-{name}-{1..4|ink}` in `:root` (light) and `.dark` (dark); semantic tokens point at them by `var()`, so the 426 existing uses keep their names. Tests check the CSS equals the generator and resolve real `var()` chains for contrast.

**Tech Stack:** TypeScript (Node 22.23 runs `.ts` directly via type stripping), Tailwind v4 `@theme inline`, Vitest.

**Workspace:** `/Users/tharunk/leetExpert/.worktrees/callout-system` (branch `callout-system`). Run commands from `web/` unless a step says otherwise.

## Global Constraints

- Every hex in `--hue-*` tokens comes from `palette.ts` output; never type one by hand (spec §6).
- Floors: text ≥ 4.5:1 on `--background`, `--elevated`, `--code`, `--surface` in both themes; text on its own `*-surface` ≥ 3:1; `*-line` ≥ 3:1 on `--elevated` and `--background` (spec §5, §4.3).
- Semantic token names stay: `--good`, `--bad`, `--warn`, `--info`, `--insight`, `--*-surface`, and their `--color-*` mappings (spec §4.2).
- Removed: `--press-green`, `--press-red`, `--press-amber`, `--press-insight`, `--press-{info,good,warn,insight}-surface`, `--tone-sky`, `--color-tone-sky` (no component reads them; verified 2026-09-14).
- Unchanged: `--accent`, `--mark`, `--tone-rose`, `codePalette.ts`, `familyTheme.ts` (spec §8).
- TypeScript strict; no `any`; comments explain why (CLAUDE.md §5).
- Every new or changed test is shown failing before it passes (CLAUDE.md §2).
- Commit messages end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

### Task 1: The palette generator

**Files:**
- Create: `web/src/lib/visual/palette.ts`
- Create: `web/tests/palette.test.ts`

**Interfaces:**
- Produces: `type Theme = "light" | "dark"`; `HUE_NAMES` (readonly tuple of 8); `type HueName`; `HUE_ANGLES: Record<HueName, number>`; `GITHUB_RAMPS: Record<Theme, readonly [string, string, string, string]>`; `LIGHT_TEXT_SURFACES`; `contrastRatio(a: string, b: string): number`; `ramp(hue: HueName, theme: Theme): [string, string, string, string]`; `textInk(hue: HueName, theme: Theme): string`; `paletteCssDeclarations(theme: Theme): string[]`.

- [ ] **Step 1: Write the failing test** `web/tests/palette.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  GITHUB_RAMPS,
  HUE_NAMES,
  LIGHT_TEXT_SURFACES,
  contrastRatio,
  ramp,
  textInk,
} from "../src/lib/visual/palette";

describe("contribution green palette generator", () => {
  it("reproduces GitHub's contribution ramps exactly at the green hue", () => {
    // The proof the rule is right: copying the ramp's lightness and chroma
    // at green's own hue must give back GitHub's eight colours unchanged.
    expect(ramp("green", "dark")).toEqual([...GITHUB_RAMPS.dark]);
    expect(ramp("green", "light")).toEqual([...GITHUB_RAMPS.light]);
  });

  it("gives every hue a light text colour that clears 4.5:1 on every light surface", () => {
    for (const hue of HUE_NAMES) {
      const ink = textInk(hue, "light");
      for (const surface of LIGHT_TEXT_SURFACES) {
        expect(
          contrastRatio(ink, surface),
          `${hue} ${ink} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("uses level 4 as the dark text colour", () => {
    for (const hue of HUE_NAMES) {
      expect(textInk(hue, "dark")).toBe(ramp(hue, "dark")[3]);
    }
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/palette.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lib/visual/palette"`.

- [ ] **Step 3: Create `web/src/lib/visual/palette.ts`:**

```ts
/**
 * The contribution-green palette (spec 2026-09-14-contribution-green-palette-design).
 *
 * Every hue copies the OKLCH lightness and chroma of GitHub's contribution
 * ramp at each level, so the set steps evenly the way that green does. The
 * CSS tokens in globals.css are this module's output, checked in CI by
 * tests/palette.test.ts — edit the rule here, never a hex there.
 *
 * No React or DOM imports: tests and a plain `node` run both load it.
 */

export type Theme = "light" | "dark";

export const HUE_NAMES = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const;
export type HueName = (typeof HUE_NAMES)[number];

/** OKLCH hue angle per palette hue, in degrees. */
export const HUE_ANGLES: Record<HueName, number> = {
  red: 25,
  orange: 55,
  yellow: 95,
  green: 146,
  cyan: 200,
  blue: 255,
  purple: 300,
  pink: 350,
};

/** GitHub's contribution-graph ramps, levels 1–4 (level 0 is "no activity"). */
export const GITHUB_RAMPS: Record<Theme, readonly [string, string, string, string]> = {
  dark: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  light: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
};

/**
 * The surfaces a light text colour must clear 4.5:1 on: --background,
 * --elevated, --code, --surface. Mirrored here because the text-ink rule
 * depends on them; if a surface changes, the palette test fails until the
 * tokens are regenerated.
 */
export const LIGHT_TEXT_SURFACES = ["#f1f4f9", "#ffffff", "#e4e9f2", "#d8dde8"] as const;

const TEXT_FLOOR = 4.5;
/** Light text uses 98% of the gamut-max chroma: the last 2% sits on the gamut edge, where rounding can clip a channel. */
const TEXT_CHROMA_SHARE = 0.98;
const TEXT_LIGHTNESS_STEP = 0.004;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb;
}

function rgbToHex(rgb: Rgb): string {
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export interface Oklch {
  L: number;
  C: number;
  H: number;
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinearRgb(L: number, C: number, H: number): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// A hair of tolerance: the matrices round, and an exact-gamut colour can land
// at -0.00001 on a channel that is genuinely 0.
const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

function oklchToHex(L: number, C: number, H: number): string {
  return rgbToHex(oklchToLinearRgb(L, C, H).map(toGamma) as Rgb);
}

/** The largest chroma at lightness L and hue H that a screen (sRGB) can show. */
function maxChroma(L: number, H: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Keep L and H; lower chroma only as far as the screen needs. */
function gamutMapped(L: number, C: number, H: number): string {
  if (inGamut(oklchToLinearRgb(L, C, H))) return oklchToHex(L, C, H);
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return oklchToHex(L, lo, H);
}

/** WCAG 2.x contrast ratio. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Levels 1–4 of `hue` for `theme`. */
export function ramp(hue: HueName, theme: Theme): [string, string, string, string] {
  return GITHUB_RAMPS[theme].map((anchor) => {
    const { L, C, H } = hexToOklch(anchor);
    // Green keeps each anchor level's own hue (157°, 151°, 146°, 146° in dark):
    // a single angle would drift the first two levels off GitHub's colours.
    return gamutMapped(L, C, hue === "green" ? H : HUE_ANGLES[hue]);
  }) as [string, string, string, string];
}

/**
 * The colour for text in `hue`. Dark: level 4, already at or near the gamut
 * edge. Light: level 4's lightness at near-maximum chroma — GitHub's light
 * level 4 has chroma 0.112, which turned red brownish (#92403c) — stepping
 * lightness down only if a light surface would fall under 4.5:1.
 */
export function textInk(hue: HueName, theme: Theme): string {
  if (theme === "dark") return ramp(hue, "dark")[3];
  const H = HUE_ANGLES[hue];
  // Start from this hue's own level 4, not GitHub's anchor: after gamut
  // mapping and hex rounding the two differ slightly, and level 4 is the
  // colour the ink replaces.
  let L = hexToOklch(ramp(hue, "light")[3]).L;
  let ink = oklchToHex(L, maxChroma(L, H) * TEXT_CHROMA_SHARE, H);
  const weakest = (hex: string) =>
    Math.min(...LIGHT_TEXT_SURFACES.map((surface) => contrastRatio(hex, surface)));
  while (weakest(ink) < TEXT_FLOOR && L > 0.2) {
    L -= TEXT_LIGHTNESS_STEP;
    ink = oklchToHex(L, maxChroma(L, H) * TEXT_CHROMA_SHARE, H);
  }
  return ink;
}

/** The token declarations for one theme block, in palette order. */
export function paletteCssDeclarations(theme: Theme): string[] {
  return HUE_NAMES.flatMap((hue) => [
    ...ramp(hue, theme).map((hex, i) => `--hue-${hue}-${i + 1}: ${hex};`),
    `--hue-${hue}-ink: ${textInk(hue, theme)};`,
  ]);
}
```

- [ ] **Step 4: Run the test, typecheck and lint**

Run: `npx vitest run tests/palette.test.ts` → Expected: PASS (3 tests).
Run: `npx tsc --noEmit` → Expected: no output.
Run: `npx eslint src/lib/visual/palette.ts tests/palette.test.ts` → Expected: no output.

- [ ] **Step 5: Prove the anchor test can fail.** Change `HUE_ANGLES.green` to `147`, run `npx vitest run tests/palette.test.ts` — expected: no change, because green's *ramp* ignores the angle. Then temporarily change the ramp's green branch from `hue === "green" ? H : HUE_ANGLES[hue]` to `HUE_ANGLES[hue]`, run again — expected: FAIL on "reproduces GitHub's contribution ramps exactly" (dark levels 1–2 drift). Restore both, re-run, expect PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/visual/palette.ts web/tests/palette.test.ts
git commit -m "feat(palette): generate the contribution green palette from GitHub's ramps

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: The `--hue-*` tokens

**Files:**
- Modify: `web/src/app/globals.css` (`:root` after line 77 `--press-insight-surface: #fef9c3;…`; `.dark` after line 215 `--press-insight-surface: #3a2e05;…`)
- Modify: `web/tests/palette.test.ts`

**Interfaces:**
- Consumes: `paletteCssDeclarations(theme)` (Task 1).
- Produces: CSS custom properties `--hue-{red|orange|yellow|green|cyan|blue|purple|pink}-{1|2|3|4|ink}` in both theme blocks (used by Task 3).

- [ ] **Step 1: Write the failing test.** Add to `web/tests/palette.test.ts` — imports at the top:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
```

add `paletteCssDeclarations` to the import from `"../src/lib/visual/palette"`, and append:

```ts
/** Body of the first `selector {` block, brace-matched so a nested rule cannot end it early. */
function blockBody(css: string, selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  if (at === -1) return "";
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

describe("palette tokens in globals.css", () => {
  it("every --hue token equals the generator's output, in both themes", () => {
    // The CSS holds literal hexes so the browser needs no runtime maths; this
    // keeps them from being edited away from the derivation.
    const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
    const blocks = [
      [":root", "light"],
      [".dark", "dark"],
    ] as const;
    for (const [selector, theme] of blocks) {
      const body = blockBody(css, selector);
      expect(body, `${selector} block not found`).not.toBe("");
      const declared = [...body.matchAll(/--hue-[a-z]+-(?:[1-4]|ink):\s*#[0-9a-f]{6};/g)].map(
        (m) => m[0].replace(/:\s*/, ": "),
      );
      expect(declared, `${selector} --hue tokens`).toEqual(paletteCssDeclarations(theme));
    }
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/palette.test.ts -t "every --hue token"`
Expected: FAIL — `:root --hue tokens` expected an array of 40 declarations, received `[]`.

- [ ] **Step 3: Print the declarations from the generator** (from `web/`):

```bash
node -e 'import("./src/lib/visual/palette.ts").then(m => { for (const t of ["light", "dark"]) { console.log(`/* ${t} */`); console.log(m.paletteCssDeclarations(t).map(d => "  " + d).join("\n")); } })'
```

Expected output (the light block is `:root`, the dark block is `.dark`):

```
/* light */
  --hue-red-1: #ffc2bc;
  --hue-red-2: #ff766f;
  --hue-red-3: #d75b56;
  --hue-red-4: #92403c;
  --hue-red-ink: #b0081d;
  --hue-orange-1: #ffc59f;
  --hue-orange-2: #f98209;
  --hue-orange-3: #cd6900;
  --hue-orange-4: #8c490d;
  --hue-orange-ink: #8e4805;
  --hue-yellow-1: #ebd374;
  --hue-yellow-2: #c4a400;
  --hue-yellow-3: #a18600;
  --hue-yellow-4: #6e5c00;
  --hue-yellow-ink: #6e5c05;
  --hue-green-1: #9be9a8;
  --hue-green-2: #40c463;
  --hue-green-3: #30a14e;
  --hue-green-4: #216e39;
  --hue-green-ink: #067123;
  --hue-cyan-1: #62ebf2;
  --hue-cyan-2: #00bdc5;
  --hue-cyan-3: #009ba2;
  --hue-cyan-4: #006a6f;
  --hue-cyan-ink: #066a6e;
  --hue-blue-1: #b6d6ff;
  --hue-blue-2: #64a9ff;
  --hue-blue-3: #3d89e4;
  --hue-blue-4: #2c5e9b;
  --hue-blue-ink: #055bb1;
  --hue-purple-1: #dac8ff;
  --hue-purple-2: #b88bff;
  --hue-purple-3: #986ed8;
  --hue-purple-4: #674c92;
  --hue-purple-ink: #770ad0;
  --hue-pink-1: #ffbddb;
  --hue-pink-2: #f671b6;
  --hue-pink-3: #cb5a95;
  --hue-pink-4: #8a3f66;
  --hue-pink-ink: #a5076c;
/* dark */
  --hue-red-1: #592825;
  --hue-red-2: #943734;
  --hue-red-3: #e35551;
  --hue-red-4: #ff8b83;
  --hue-red-ink: #ff8b83;
  --hue-orange-1: #552d0e;
  --hue-orange-2: #8a4500;
  --hue-orange-3: #d16c00;
  --hue-orange-4: #ff923a;
  --hue-orange-ink: #ff923a;
  --hue-yellow-1: #453800;
  --hue-yellow-2: #6b5900;
  --hue-yellow-3: #a48900;
  --hue-yellow-4: #d1af00;
  --hue-yellow-ink: #d1af00;
  --hue-green-1: #0e4429;
  --hue-green-2: #006d32;
  --hue-green-3: #26a641;
  --hue-green-4: #39d353;
  --hue-green-ink: #39d353;
  --hue-cyan-1: #004245;
  --hue-cyan-2: #00676c;
  --hue-cyan-3: #009ea5;
  --hue-cyan-4: #00cad2;
  --hue-cyan-ink: #00cad2;
  --hue-blue-1: #1d3a5e;
  --hue-blue-2: #205a9f;
  --hue-blue-3: #318bf3;
  --hue-blue-4: #7ab5ff;
  --hue-blue-ink: #7ab5ff;
  --hue-purple-1: #3f2f59;
  --hue-purple-2: #664695;
  --hue-purple-3: #9d6ce5;
  --hue-purple-4: #c09bff;
  --hue-purple-ink: #c09bff;
  --hue-pink-1: #54283e;
  --hue-pink-2: #8c3764;
  --hue-pink-3: #d6559a;
  --hue-pink-4: #ff80c1;
  --hue-pink-ink: #ff80c1;
```

If the output differs from the block above, stop: the generator changed and the spec's numbers no longer describe it.

- [ ] **Step 4: Insert the declarations.** In `web/src/app/globals.css`, directly after `  --press-insight-surface: #fef9c3; /* #854d0e ink ≈ 6.38:1 */` (in `:root`), insert a blank line, then:

```css
  /*
    Contribution green palette (spec 2026-09-14). Generated by
    src/lib/visual/palette.ts from GitHub's contribution ramps — do not edit
    a hex here; change the generator and re-print. Level n is the same
    strength against its own theme's paper: 1 quietest, 4 strongest. -ink is
    the text colour (light: level 4's lightness at near-max chroma).
    tests/palette.test.ts fails if these drift from the generator.
  */
```

followed by the 40 `/* light */` declarations from Step 3. In the `.dark` block, directly after `  --press-insight-surface: #3a2e05; /* #facc15 ink ≈ 8.72:1 */`, insert a blank line, `  /* Contribution green palette, dark levels — generated, see :root. */`, then the 40 `/* dark */` declarations.

- [ ] **Step 5: Run the palette tests and the full suite**

Run: `npx vitest run tests/palette.test.ts` → Expected: PASS (4 tests).
Run: `npm test` → Expected: all pass (nothing reads `--hue-*` yet).

- [ ] **Step 6: Prove the CSS check can fail.** Change `--hue-blue-3: #3d89e4;` in `:root` to `#3d89e5`, run `npx vitest run tests/palette.test.ts -t "every --hue token"` — expected FAIL showing the `--hue-blue-3` line. Restore, re-run, expect PASS.

- [ ] **Step 7: Commit**

```bash
git add web/src/app/globals.css web/tests/palette.test.ts
git commit -m "feat(tokens): add the generated --hue-* palette tokens in both themes

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Status colours on the palette

**Files:**
- Modify: `web/src/app/globals.css` (`:root` lines 51–77 and 115–125; `.dark` lines 206–215 and 250; `@theme` lines 267–276)
- Modify: `web/tests/design-tokens.test.ts` (helpers after `cssBlock`; tests "light text inks clear AA 4.5 on the deepest surface" line 302, "Insight and Information roles are defined and AA-compliant" line 389, "status inks (good/bad/warn/info/muted) clear AA text contrast on every surface, both themes" line 461, "Callout pastel surface tokens exist and are AA-compliant against their role ink" line 639)

**Interfaces:**
- Consumes: `--hue-*` tokens (Task 2).
- Produces: `--good/--bad/--warn/--info/--insight` → `var(--hue-*-ink)`; `--{role}-surface` → level 1; new `--{role}-line` (light level 3, dark level 4) with `--color-{role}-line`; new `--bad-surface`/`--color-bad-surface`. Test helpers `blockBody(css, selector)` and `resolveToken(root, theme: string | null, name)` in `design-tokens.test.ts`.

- [ ] **Step 1: Add the test helpers** after the `cssBlock` function in `web/tests/design-tokens.test.ts`:

```ts
/** Body of the first `selector {` block, brace-matched so a nested rule cannot end it early. */
function blockBody(css: string, selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  if (at === -1) return "";
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

/**
 * A custom property as the browser resolves it for one theme: the theme
 * block's own definition wins over :root's, and `var(--x)` is followed
 * through the same lookup — so dark `--good` (defined only in :root as
 * `var(--hue-green-ink)`) lands on the dark `--hue-green-ink`. Throws when a
 * name is undefined, so a renamed token fails loudly instead of measuring
 * nothing.
 */
function resolveToken(root: string, theme: string | null, name: string): string {
  const own = (body: string) =>
    new RegExp(`(?:^|[;{\\s])--${name}:\\s*([^;]+);`)
      .exec(stripComments(body))?.[1]
      ?.trim();
  const value = (theme !== null ? own(theme) : undefined) ?? own(root);
  if (value === undefined) throw new Error(`--${name} is not defined`);
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  return ref ? resolveToken(root, theme, ref[1]!) : value;
}
```

- [ ] **Step 2: Rewrite the four tests.** Replace the body of each named test (keep its `it(…)` line for the first three; rename the fourth) with:

"light text inks clear AA 4.5 on the deepest surface":

```ts
  it("light text inks clear AA 4.5 on the deepest surface", () => {
    // The sandbox renders verdict rows (good/bad), insight values (info),
    // muted labels and mark accents directly on the darkest light tier
    // (--surface). Every ink that can sit there must clear AA.
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const token = (name: string) => resolveToken(root, null, name);
    const sunk = token("surface");
    for (const name of ["foreground", "muted", "good", "bad", "warn", "insight", "info", "mark"]) {
      expect(contrastRatio(token(name), sunk), `${name} vs sunk`).toBeGreaterThanOrEqual(4.5);
    }
  });
```

"Insight and Information roles are defined and AA-compliant":

```ts
  it("Insight and Information roles are defined and AA-compliant", () => {
    // Both are palette hues since 2026-09-14: insight is yellow, info is blue.
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    expect(root).toMatch(/--insight:\s*var\(--hue-yellow-ink\)/);
    expect(root).toMatch(/--info:\s*var\(--hue-blue-ink\)/);
    const themes: [string, string | null][] = [
      ["light", null],
      ["dark", dark],
    ];
    for (const [theme, body] of themes) {
      const token = (name: string) => resolveToken(root, body, name);
      for (const role of ["insight", "info"]) {
        expect(
          contrastRatio(token(role), token("background")),
          `${theme} ${role} on the page`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(css).toMatch(/--color-insight:\s*var\(--insight\)/);
    expect(css).toMatch(/--color-info:\s*var\(--info\)/);
  });
```

"status inks (good/bad/warn/info/muted) clear AA text contrast on every surface, both themes":

```ts
  it("status inks (good/bad/warn/info/muted) clear AA text contrast on every surface, both themes", () => {
    // These render as readable status text ("1 of 5 tests passed", difficulty
    // badges), so the floor is 4.5:1 on every surface they can paint on.
    // Lines only need 3:1, and only on the raised grounds (spec 2026-09-14
    // §4.3): light level 3 fails on --code and --surface.
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    const themes: [string, string | null][] = [
      ["light", null],
      ["dark", dark],
    ];
    for (const [theme, body] of themes) {
      const token = (name: string) => resolveToken(root, body, name);
      const surfaces = ["background", "elevated", "code", "surface"];
      for (const role of ["muted", "good", "bad", "warn", "info", "insight"]) {
        for (const surface of surfaces) {
          const ratio = contrastRatio(token(role), token(surface));
          expect(
            ratio,
            `${theme} ${role} ${token(role)} on --${surface} is ${ratio.toFixed(2)}:1, needs >= 4.5:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
      for (const role of ["good", "bad", "warn", "info", "insight"]) {
        for (const ground of ["background", "elevated"]) {
          const ratio = contrastRatio(token(`${role}-line`), token(ground));
          expect(
            ratio,
            `${theme} ${role}-line on --${ground} is ${ratio.toFixed(2)}:1, needs >= 3:1`,
          ).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
```

Replace the whole "Callout pastel surface tokens exist and are AA-compliant against their role ink" test with:

```ts
  it("status surfaces and lines come from the palette and hold their role ink", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    const hueOf: Record<string, string> = {
      good: "green",
      bad: "red",
      warn: "orange",
      info: "blue",
      insight: "yellow",
    };
    for (const [role, hue] of Object.entries(hueOf)) {
      expect(root).toMatch(new RegExp(`--${role}:\\s*var\\(--hue-${hue}-ink\\)`));
      expect(root).toMatch(new RegExp(`--${role}-surface:\\s*var\\(--hue-${hue}-1\\)`));
      expect(root).toMatch(new RegExp(`--${role}-line:\\s*var\\(--hue-${hue}-3\\)`));
      expect(dark).toMatch(new RegExp(`--${role}-line:\\s*var\\(--hue-${hue}-4\\)`));
      for (const body of [null, dark]) {
        const token = (name: string) => resolveToken(root, body, name);
        // Bold/large label + icon sitting on the surface — AA large-text floor.
        expect(
          contrastRatio(token(role), token(`${role}-surface`)),
          `${body === null ? "light" : "dark"} ${role} ink vs its own surface`,
        ).toBeGreaterThanOrEqual(3);
      }
      expect(css).toMatch(new RegExp(`--color-${role}-surface:\\s*var\\(--${role}-surface\\)`));
      expect(css).toMatch(new RegExp(`--color-${role}-line:\\s*var\\(--${role}-line\\)`));
    }
    // The hand-tuned status inks are gone; the palette is the only source.
    expect(css).not.toMatch(
      /--press-(?:green|red|amber|insight)\b|--press-(?:info|good|warn|insight)-surface\b|--tone-sky\b/,
    );
  });
```

- [ ] **Step 3: Run the token tests and confirm they fail**

Run: `npx vitest run tests/design-tokens.test.ts`
Expected: FAIL — "status surfaces and lines come from the palette…" (`--good` is still `var(--press-green)`), and "status inks…" (`--good-line is not defined`).

- [ ] **Step 4: Rewire `:root`.** In `web/src/app/globals.css` delete, from `:root`, the block from the comment line `  /*` that opens `Sheet Success/Warning/Error are bright fills (~2–3:1 as body text).` through `  --press-insight-surface: #fef9c3; /* #854d0e ink ≈ 6.38:1 */` (the Success/Warning/Error comment, the three `--press-green/red/amber` lines, the Insight comment and `--press-insight`, the pastel-surface comment and the four `--press-*-surface` lines), leaving the palette comment and `--hue-*` declarations added in Task 2 in place.

Replace:

```css
  --good: var(--press-green);
  --bad: var(--press-red);
  --warn: var(--press-amber);
  --insight: var(--press-insight);
  --info: var(--tone-sky);
  --info-surface: var(--press-info-surface);
  --good-surface: var(--press-good-surface);
  --warn-surface: var(--press-warn-surface);
  --insight-surface: var(--press-insight-surface);

  --tone-sky: #075985; /* info — 5.56:1 on sunk, AA deepest */
  --tone-rose: #e11d48;
```

with:

```css
  /*
    Status colours (spec 2026-09-14 §4.2). Text ≥ 4.5:1 on every surface in
    both themes (good is the tightest: 4.55 on --surface); text on its own
    *-surface ≥ 3:1. *-line is for rules, borders and strokes: light level 3
    clears 3:1 only on --elevated and --background (2.44–3.17 on --code and
    --surface), so on a recessed surface use the text colour instead.
  */
  --good: var(--hue-green-ink);
  --bad: var(--hue-red-ink);
  --warn: var(--hue-orange-ink);
  --insight: var(--hue-yellow-ink);
  --info: var(--hue-blue-ink);
  --good-surface: var(--hue-green-1);
  --bad-surface: var(--hue-red-1);
  --warn-surface: var(--hue-orange-1);
  --insight-surface: var(--hue-yellow-1);
  --info-surface: var(--hue-blue-1);
  --good-line: var(--hue-green-3);
  --bad-line: var(--hue-red-3);
  --warn-line: var(--hue-orange-3);
  --insight-line: var(--hue-yellow-3);
  --info-line: var(--hue-blue-3);

  --tone-rose: #e11d48;
```

- [ ] **Step 5: Rewire `.dark`.** Delete these lines from `.dark`:

```css
  --press-green: #22d497; /* sheet Success */
  --press-red: #f15858; /* sheet Error — 4.51:1 on --elevated, the binding floor (brightest dark surface, not the paper) */
  --press-amber: #f59e0b; /* sheet Warning */
  --press-insight: #facc15; /* 12.3:1 on dark paper — bright gold as text */

  /* Dark callout surfaces — saturated dark tints, not pastel. */
  --press-info-surface: #0c2a3d; /* #38bdf8 ink ≈ 6.93:1 */
  --press-good-surface: #0b2e22; /* #22d497 ink ≈ 7.66:1 */
  --press-warn-surface: #3a2408; /* #f59e0b ink ≈ 6.81:1 */
  --press-insight-surface: #3a2e05; /* #facc15 ink ≈ 8.72:1 */
```

Directly after the Task 2 dark `--hue-pink-ink: #ff80c1;` line, add:

```css

  /* Dark lines use level 4: on dark paper the strongest level is the bright one. */
  --good-line: var(--hue-green-4);
  --bad-line: var(--hue-red-4);
  --warn-line: var(--hue-orange-4);
  --insight-line: var(--hue-yellow-4);
  --info-line: var(--hue-blue-4);
```

Replace:

```css
  --tone-sky: #38bdf8;
  --tone-rose: #fb7185;
```

with:

```css
  --tone-rose: #fb7185;
```

- [ ] **Step 6: Rewire `@theme`.** Replace:

```css
  --color-info-surface: var(--info-surface);
  --color-good-surface: var(--good-surface);
  --color-warn-surface: var(--warn-surface);
  --color-insight-surface: var(--insight-surface);
  --color-tone-sky: var(--tone-sky);
```

with:

```css
  --color-info-surface: var(--info-surface);
  --color-good-surface: var(--good-surface);
  --color-bad-surface: var(--bad-surface);
  --color-warn-surface: var(--warn-surface);
  --color-insight-surface: var(--insight-surface);
  --color-good-line: var(--good-line);
  --color-bad-line: var(--bad-line);
  --color-warn-line: var(--warn-line);
  --color-insight-line: var(--insight-line);
  --color-info-line: var(--info-line);
```

- [ ] **Step 7: Confirm nothing else reads the removed names**

Run (from `web/`): `grep -rnE -- "--press-(green|red|amber|insight)\b|--press-(info|good|warn|insight)-surface|tone-sky" src tests`
Expected: no output.

- [ ] **Step 8: Run tests, typecheck, lint**

Run: `npx vitest run tests/design-tokens.test.ts tests/palette.test.ts` → Expected: PASS.
Run: `npm test` → Expected: all files pass.
Run: `npx tsc --noEmit` → Expected: no output.
Run: `npx eslint tests/design-tokens.test.ts` → Expected: no output.

- [ ] **Step 9: Prove the line floor can fail.** In `:root` change `--good-line: var(--hue-green-3);` to `var(--hue-green-2);`, run `npx vitest run tests/design-tokens.test.ts -t "status inks"` — expected FAIL `light good-line on --background is 2.xx:1, needs >= 3:1`. Restore, re-run, expect PASS.

- [ ] **Step 10: Commit**

```bash
git add web/src/app/globals.css web/tests/design-tokens.test.ts
git commit -m "feat(tokens): move status colours onto the contribution green palette

--good/--bad/--warn/--info/--insight now resolve to palette text colours;
*-surface is level 1; new *-line tokens for 3:1 rules on raised grounds.
Removes the hand-tuned --press-* status inks and --tone-sky.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Documentation, full verification, browser check

**Files:**
- Modify: `CLAUDE.md` (the "Contrast is measured, not eyeballed" bullet in §4)
- Temporary, reverted in Step 5: `/Users/tharunk/leetExpert/.claude/launch.json` (a dev-server entry for this worktree)

- [ ] **Step 1: Update CLAUDE.md §4.** Replace:

```markdown
- **Contrast is measured, not eyeballed.** Body ink/muted must meet WCAG AA
  (4.5:1). Status text inks are AA-darkened from sheet Success/Warning/Error
  fills. Record ratios in comments beside tokens.
```

with:

```markdown
- **Contrast is measured, not eyeballed.** Body ink/muted must meet WCAG AA
  (4.5:1). Record ratios in comments beside tokens.
- **Status and palette colour is generated, never hand-picked.** Eight hues
  (`--hue-{name}-{1..4|ink}`) are derived from GitHub's contribution-graph
  ramp by `web/src/lib/visual/palette.ts` (spec
  `docs/superpowers/specs/2026-09-14-contribution-green-palette-design.md`);
  `tests/palette.test.ts` fails if a hex in `globals.css` drifts from it.
  Status colours map onto it — good green, bad red, warn orange, info blue,
  insight yellow — with text in `-ink` (light: level 4's lightness at
  near-max chroma), `*-surface` at level 1 and `*-line` for 3:1 rules. A
  `*-line` sits only on `--elevated` or `--background`; light level 3 fails
  on `--code` and `--surface`.
```

- [ ] **Step 2: Full static verification** (from `web/`)

Run: `npx tsc --noEmit` → no output.
Run: `npx eslint src/lib/visual/palette.ts tests/palette.test.ts tests/design-tokens.test.ts` → no output.
Run: `npm test` → all files pass; test count = baseline 852 + 4 (palette) + net change in design-tokens (one test renamed, none removed).
Run: `npm run build` → completes (this worktree has its own `web/.next`).

- [ ] **Step 3: Start a dev server for this worktree.** Add to the `configurations` array of `/Users/tharunk/leetExpert/.claude/launch.json`:

```json
    {
      "name": "palette-worktree",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["--prefix", ".worktrees/callout-system/web", "run", "dev", "--", "--port", "3011"],
      "port": 3011
    }
```

then start it with the Browser pane's `preview_start` (`name: "palette-worktree"`).

- [ ] **Step 4: Browser verification, both themes.** For each page, check light, then swap the `light`/`dark` class on `<html>` with `javascript_tool` (restore afterwards; never use the theme toggle, which writes the owner's saved preference):
  - `/courses/dsa/problems` — Easy/Medium/Hard badges: `getComputedStyle` colour equals the resolved `--good`/`--warn`/`--bad` for the theme (light `#067123`/`#8e4805`/`#b0081d`; dark `#39d353`/`#ff923a`/`#ff8b83`).
  - `/courses/dsa/problems/valid-palindrome` — Run the starter code: failing verdict rows show `--bad`; the Examples `false`/`true` pills show `--bad`/`--good`; Goal (info), Constraints (good) and Tip (warn) callouts show the new colours.
  - `/` — the element using `bg-good-surface` shows `#9be9a8` light / `#0e4429` dark; note how much stronger it is than the old pastel for the report.
  - `read_console_messages` with `onlyErrors: true` — no errors.
  - Screenshot each page in both themes for the report.

- [ ] **Step 5: Stop the server and remove the temporary launch entry.** `preview_stop` the server, delete the `palette-worktree` entry from `.claude/launch.json`, and confirm `git -C /Users/tharunk/leetExpert diff --stat -- .claude/launch.json` shows no change.

- [ ] **Step 6: Commit the docs**

```bash
git add CLAUDE.md
git commit -m "docs: record the generated palette and status colour rules in CLAUDE.md

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Integrate** with superpowers:finishing-a-development-branch — this branch also carries the two spec commits; merging lands spec 1's implementation and both specs, not spec 2's implementation.
