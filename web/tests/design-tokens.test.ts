import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix, relative } from "node:path";
import { CODE_DARK } from "../src/lib/content/codePalette";
import {
  FAMILY_SURFACES,
  FAMILY_THEMES,
  familyCssVars,
  lightVariant,
  uiAccentFor,
} from "../src/lib/visual/familyTheme";
import { hexToOklch } from "../src/lib/visual/palette";
import { MODULES, moduleFamily } from "../src/lib/course/manifest";
import { contrastRatio, relativeLuminance } from "./helpers/contrast";

/**
 * Guard the handbook press identity against regressions that survive a
 * palette change or break dark mode.
 *
 * Components must consume semantic tokens (bg-accent, text-good, …), not
 * Tailwind palette classes and not `text-white` on accent fills — prefer
 * `text-on-pop` on `bg-pop`. Pop is fill-only on paper; accent carries
 * coloured text.
 *
 * Spec: docs/superpowers/specs/2026-07-31-leetexpert-handbook-identity-design.md
 */

const SRC = join(__dirname, "..", "src");
const GLOBALS = join(SRC, "app", "globals.css");

/** Files that own raw hex by design — not UI chrome. */
const HEX_ALLOW = new Set([
  "app/globals.css", // tier-1 ink definitions
  "lib/content/codePalette.ts", // Shiki theme; mirrored by --tok-* in CSS
  "lib/visual/familyTheme.ts", // per-family accent map for PatternLab
  "lib/visual/palette.ts", // GitHub's contribution ramps + light surfaces the palette is derived from; --hue-* in CSS is its output
  "components/md/Mermaid.tsx", // Mermaid theme API wants resolved hex
  "components/sandbox/editorTheme.ts", // may mirror --tok-* literals
  "components/kit/languageMarks.tsx", // brand colour, not design-system colour
  "app/courses/dsa/registry.ts", // per-course accent hex, same pattern as familyTheme.ts
  "app/courses/nextjs/registry.ts", // per-course accent hex, same pattern as familyTheme.ts
  "app/layout.tsx", // viewport.themeColor — outside the CSS cascade, mirrors --press-olive/--press-blue
  "app/manifest.ts", // PWA manifest JSON — outside the CSS cascade, mirrors --press-blue/--press-paper
  "lib/seo/ogImage.tsx", // next/og Satori render has no CSS custom properties; mirrors --press-* inks and the dark --press-lamp* tokens
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).map((path) => ({
  path,
  rel: relative(SRC, path).replace(/\\/g, "/"),
  body: readFileSync(path, "utf8"),
}));

/**
 * Comments ship nothing, and prose uses words like "rounded" in their plain
 * English sense — scanning raw bodies flagged a comment that merely described
 * a component's corners. Checks whose pattern can match a bare word read this
 * instead; checks that match a full utility spelling can keep using body.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

const PALETTE_CLASS =
  /\b(?:text|bg|border|ring|from|to|via)-(?:emerald|red|green|blue|amber|yellow|orange|purple|pink|indigo|violet|sky|teal|cyan|rose|fuchsia|lime)-\d{2,3}\b/g;

const WHITE_ON_ACCENT =
  /\bbg-accent\b[^\n]*\btext-white\b|\btext-white\b[^\n]*\bbg-accent\b/;

const BOX_SHADOW_CLASS =
  /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b|\bshadow-\[[^\]]+\]/;

/** First `--name: #hex` in a CSS region (non-greedy up to next brace block). */
function firstHexVar(css: string, name: string): string | null {
  const re = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`);
  const m = css.match(re);
  return m?.[1]?.toLowerCase() ?? null;
}

/**
 * Body of the first rule whose selector line is exactly `selector` (a
 * selector list is passed with its newlines, e.g. "em,\ni"). Empty string
 * when absent, so a missing rule fails the assertion instead of throwing.
 */
function cssBlock(css: string, selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) return "";
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

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

describe("design tokens", () => {
  it("no Tailwind palette colour classes in components", () => {
    const hits: string[] = [];
    for (const f of FILES) {
      if (f.rel === "app/globals.css") continue;
      const matches = f.body.match(PALETTE_CLASS);
      if (matches) hits.push(`${f.rel}: ${[...new Set(matches)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });

  it("never pairs bg-accent with text-white", () => {
    const hits = FILES.filter((f) => WHITE_ON_ACCENT.test(f.body)).map(
      (f) => f.rel,
    );
    expect(hits).toEqual([]);
  });

  it("no Tailwind default shadow scale or arbitrary shadow values (shadow is a token, not a one-off)", () => {
    // Elevation shadow is real now (globals.css: --shadow-elevation,
    // --shadow-edge-*), but it goes through the shared .shadow-elevation /
    // .shadow-edge-* classes only — never Tailwind's built-in shadow-sm/md/
    // lg/xl/2xl/inner scale and never an arbitrary shadow-[...] value,
    // both of which would bypass the ink-tinted, per-theme tokens.
    const hits: string[] = [];
    for (const f of FILES) {
      if (f.rel === "app/globals.css") continue;
      const matches = f.body.match(BOX_SHADOW_CLASS);
      if (matches) hits.push(`${f.rel}: ${[...new Set(matches)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });

  it("no raw box-shadow / boxShadow authored outside globals.css", () => {
    // Components consume elevation shadow via className="shadow-elevation"
    // (or shadow-edge-*), never by writing box-shadow themselves — same
    // discipline as radius and colour: one definition, applied by class.
    const hits = FILES.filter(
      (f) =>
        f.rel !== "app/globals.css" &&
        (/box-shadow\s*:/.test(f.body) || /\bboxShadow\s*:/.test(f.body)),
    ).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("elevation shadow tokens exist in both themes and lighten from light to dark", () => {
    // Dark mode drops the ink tint for near-black (a LIGHT ink at low alpha
    // would lighten a dark surface instead of shadowing it) and raises
    // opacity (the same alpha that reads on light paper all but
    // disappears against an already-dark surface) — assert both actually
    // changed, not just that the variable is redefined to the same value.
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));
    for (const name of ["shadow-elevation", "shadow-edge-bottom", "shadow-edge-right", "shadow-edge-left"]) {
      expect(root, `--${name} missing in :root`).toMatch(new RegExp(`--${name}:`));
      expect(dark, `--${name} missing in .dark`).toMatch(new RegExp(`--${name}:`));
    }
    expect(root).toMatch(/--shadow-tint:\s*22 32 46/); // --press-ink, light
    expect(dark).toMatch(/--shadow-tint:\s*0 0 0/); // near-black, dark
    expect(css).toMatch(/\.shadow-elevation\s*\{\s*box-shadow:\s*var\(--shadow-elevation\)/);
    expect(css).toMatch(/\.shadow-edge-bottom\s*\{\s*box-shadow:\s*var\(--shadow-edge-bottom\)/);
    expect(css).toMatch(/\.shadow-edge-right\s*\{\s*box-shadow:\s*var\(--shadow-edge-right\)/);
    expect(css).toMatch(/\.shadow-edge-left\s*\{\s*box-shadow:\s*var\(--shadow-edge-left\)/);
  });

  it("raw hex outside allowlisted sources is banned in TS/TSX", () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/g;
    const hits: string[] = [];
    for (const f of FILES) {
      if (!f.rel.endsWith(".ts") && !f.rel.endsWith(".tsx")) continue;
      if (HEX_ALLOW.has(f.rel)) continue;
      const matches = [...f.body.matchAll(hex)].map((m) => m[0]);
      // transparent black used as "none" in canvas APIs
      const bad = matches.filter(
        (h) => h.toLowerCase() !== "#00000000" && h.toLowerCase() !== "#fff0",
      );
      if (bad.length) hits.push(`${f.rel}: ${[...new Set(bad)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });

  it("globals use Blueprint sheet colours", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).not.toMatch(/--shadow-card\s*:/);
    expect(css).not.toMatch(/\.elevated-card\s*\{[^}]*box-shadow/);

    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    expect(firstHexVar(root, "press-paper")).toBe("#f1f4f9");
    expect(firstHexVar(root, "press-ink")).toBe("#16202e");
    expect(firstHexVar(root, "press-ink-soft")).toBe("#56606e");
    expect(firstHexVar(root, "press-paper-sunk")).toBe("#d8dde8");
    expect(firstHexVar(root, "elevated")).toBe("#ffffff");
    expect(firstHexVar(root, "code")).toBe("#e4e9f2");
    expect(root).toMatch(
      /--press-rule:\s*rgba\(\s*22\s*,\s*32\s*,\s*46\s*,\s*0\.09\s*\)/,
    );
    // Monochrome base: accent/pop/mark are all the same steel; the family
    // accent is applied per-topic by familyCssVars() (see the family test).
    expect(firstHexVar(root, "press-olive")).toBe("#1e293b");
    expect(firstHexVar(root, "press-lime")).toBe("#1e293b");
    expect(firstHexVar(root, "press-blue")).toBe("#1e293b");
    expect(firstHexVar(root, "on-pop")).toBe("#ffffff");
    expect(firstHexVar(root, "accent-hover")).toBe("#334155");
  });

  it("body text meets AA; Primary is sheet large/UI accent", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const paper = firstHexVar(root, "press-paper");
    const ink = firstHexVar(root, "press-ink");
    const muted = firstHexVar(root, "press-ink-soft");
    const primary = firstHexVar(root, "press-olive");
    const onPop = firstHexVar(root, "on-pop");
    const sunk = firstHexVar(root, "press-paper-sunk");
    const code = firstHexVar(root, "code");
    expect(paper && ink && muted && primary && onPop && sunk && code).toBeTruthy();
    expect(contrastRatio(ink!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, sunk!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, code!)).toBeGreaterThanOrEqual(4.5);
    // Monochrome steel accent #1E293B ≈ 13.8:1 on paper / white-on-accent
    // ≈ 15.2:1 — comfortably past AA. Inside a family scope accent becomes the
    // (saturated) family colour, so the 3:1 large/UI floor is the binding
    // contract for family accents — enforced in the family-floor test below.
    expect(contrastRatio(primary!, paper!)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(onPop!, primary!)).toBeGreaterThanOrEqual(3);
  });

  it("dark mode defines layered surfaces and soft borders", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const dark = css.slice(css.indexOf(".dark"));
    // The Grid Underneath's navy ladder and blue (spec 2026-09-25-grid-app-theme-design.md).
    expect(firstHexVar(dark, "press-paper")).toBe("#15202e");
    expect(firstHexVar(dark, "elevated")).toBe("#223145");
    expect(firstHexVar(dark, "code")).toBe("#1b2735");
    expect(firstHexVar(dark, "surface")).toBe("#101a26");
    expect(firstHexVar(dark, "press-lime")).toBe("#5c8fff");
    expect(firstHexVar(dark, "press-olive")).toBe("#8db0ff");
    expect(firstHexVar(dark, "press-blue")).toBe("#8db0ff");
    expect(dark).toMatch(
      /--press-rule:\s*rgba\(\s*163\s*,\s*174\s*,\s*188\s*,\s*0\.19\s*\)/,
    );
  });

  it("surface ladders are perceptible in both themes", () => {
    // Both themes carry a real, flat (no-shadow) layer ladder with the same
    // relative order — elevated brightest, surface deepest, never an
    // inversion. Light: white cards pop off a cool-gray page, editor and
    // test wells step down. Measured light 1.10 / 1.11 / 1.12 / 1.36; dark
    // (the Grid's navy) 1.25 / 1.15 / 1.09 / 1.07 (see globals.css comments).
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));
    const lum = (hex: string) => relativeLuminance(hex);
    const r = (a: string, b: string) => contrastRatio(a, b);

    const lbg = firstHexVar(root, "press-paper")!;
    const lelevated = firstHexVar(root, "elevated")!;
    const lcode = firstHexVar(root, "code")!;
    const lsurface = firstHexVar(root, "press-paper-sunk")!;
    expect(lum(lelevated)).toBeGreaterThan(lum(lbg));
    expect(lum(lbg)).toBeGreaterThan(lum(lcode));
    expect(lum(lcode)).toBeGreaterThan(lum(lsurface));
    expect(r(lelevated, lbg)).toBeGreaterThanOrEqual(1.1);
    expect(r(lbg, lcode)).toBeGreaterThanOrEqual(1.05);
    expect(r(lcode, lsurface)).toBeGreaterThanOrEqual(1.05);
    expect(r(lelevated, lsurface)).toBeGreaterThanOrEqual(1.2);

    const dbg = firstHexVar(dark, "press-paper")!;
    const delevated = firstHexVar(dark, "elevated")!;
    const dcode = firstHexVar(dark, "code")!;
    const dsurface = firstHexVar(dark, "surface")!;
    expect(lum(delevated)).toBeGreaterThan(lum(dcode));
    expect(lum(dcode)).toBeGreaterThan(lum(dbg));
    expect(lum(dbg)).toBeGreaterThan(lum(dsurface));
    expect(r(delevated, dbg)).toBeGreaterThanOrEqual(1.2);
    expect(r(dcode, delevated)).toBeGreaterThanOrEqual(1.1);
    expect(r(dcode, dbg)).toBeGreaterThanOrEqual(1.04);
    expect(r(dsurface, dbg)).toBeGreaterThanOrEqual(1.03);
  });

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

  it("code colours are one source and clear AA on the code-editor surface", () => {
    // CLAUDE.md: "Code colour has one source." codePalette.ts feeds Shiki;
    // --tok-* in globals.css feeds CodeMirror. They must not drift.
    //
    // The code well is dark in BOTH themes since 2026-09-25 (the light
    // theme's navy #14202e, the dark theme's Grid sunk #101a26), so both
    // themes paint code with CODE_DARK's ink: :root carries it, nothing
    // overrides it in the dark theme, and Shiki has one theme whose colours
    // it writes inline (tests/codeHighlight.test.ts checks its output).
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    const editors = {
      light: firstHexVar(root, "code-editor")!,
      dark: firstHexVar(dark, "code-editor")!,
    };

    const tokSection = css.slice(
      css.indexOf("Editor token palette"),
      css.indexOf("Visual OS / PatternLab"),
    );
    const tokIn = (name: string) => firstHexVar(tokSection, name);
    expect(tokIn("tok-comment")).toBe(CODE_DARK.comment);
    expect(tokIn("tok-keyword")).toBe(CODE_DARK.keyword);
    expect(tokIn("tok-string")).toBe(CODE_DARK.string);
    expect(tokIn("tok-constant")).toBe(CODE_DARK.constant);
    expect(tokIn("tok-entity")).toBe(CODE_DARK.entity);
    expect(tokIn("tok-variable")).toBe(CODE_DARK.variable);
    expect(tokIn("tok-name")).toBe(CODE_DARK.fg);
    expect(tokSection, "the dark theme must not swap the code ink").not.toMatch(/\.dark\s*\{/);
    expect(css, "no stylesheet picks a Shiki theme variant").not.toMatch(/--shiki-/);

    for (const [theme, editor] of Object.entries(editors)) {
      for (const [name, hex] of Object.entries(CODE_DARK)) {
        expect(
          contrastRatio(hex, editor),
          `${name} vs the ${theme} theme's code-editor ${editor}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

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

  it("family accentUi clears the UI floor on every surface of its own theme", () => {
    // --pop/--accent render on --elevated, --code and --surface too, not only
    // the page, so every surface is checked. Each theme has its own value
    // now (spec 2026-09-25-grid-app-theme-design.md §5), so each is held to
    // its own theme's surfaces — and FAMILY_SURFACES must be those surfaces.
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    for (const [theme, body] of [["light", null], ["dark", dark]] as const) {
      const actual = ["background", "elevated", "code", "surface"].map((n) =>
        resolveToken(root, body, n).toLowerCase(),
      );
      expect([...FAMILY_SURFACES[theme]], `${theme} FAMILY_SURFACES vs globals.css`).toEqual(actual);
    }
    for (const theme of FAMILY_THEMES) {
      for (const t of ["light", "dark"] as const) {
        const ink = theme[t];
        for (const hex of FAMILY_SURFACES[t]) {
          const ratio = contrastRatio(ink.accentUi, hex);
          expect(
            ratio,
            `${theme.id} ${t} accentUi ${ink.accentUi} on ${hex} is ${ratio.toFixed(2)}:1, needs >= 3:1`,
          ).toBeGreaterThanOrEqual(3);
        }
        // Viz cells and --pop chips carry text on the solid fill: AA, both fills.
        for (const [fill, on] of [
          [ink.accent, ink.onAccent],
          [ink.accentUi, ink.onAccentUi],
        ]) {
          const ratio = contrastRatio(on!, fill!);
          expect(ratio, `${theme.id} ${t} ${on} on ${fill} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("family hues stay told apart from each other and from the brand lamp", () => {
    // The 7th and 8th hues (magenta, olive) were chosen by distance; a recolor
    // must not let two families, or a family and the lamp/--good green,
    // collapse into one colour.
    const ok = (hex: string) => {
      const { L, C, H } = hexToOklch(hex);
      return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
    };
    const dE = (a: string, b: string) => {
      const [p, q] = [ok(a), ok(b)];
      return Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);
    };
    for (const [i, a] of FAMILY_THEMES.entries()) {
      for (const b of FAMILY_THEMES.slice(i + 1)) {
        // The Grid's own blue and violet are the closest pair (0.080).
        expect(dE(a.grid, b.grid), `${a.id} vs ${b.id}`).toBeGreaterThanOrEqual(0.075);
      }
      for (const green of ["#5be07a", "#39d353"]) {
        // Teal (linear traversal) is the nearest, at 0.125 from the lamp.
        expect(dE(a.grid, green), `${a.id} vs ${green}`).toBeGreaterThanOrEqual(0.1);
      }
    }
  });

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

  it("familyCssVars remaps accent/pop/highlight to the family primary", () => {
    // The scope wiring: a lesson/module applies familyCssVars(family) on its
    // root, which turns the family into that page's primary while leaving
    // --mark (the steel body ink) untouched.
    for (const theme of FAMILY_THEMES) {
      const vars = familyCssVars(theme.id) as Record<string, string | undefined>;
      expect(vars["--accent"]).toBe(theme.accentUi);
      expect(vars["--pop"]).toBe(theme.accentUi);
      expect(vars["--on-pop"]).toBe(theme.onAccentUi);
      expect(vars["--family-accent"]).toBe(theme.accent);
      expect(vars["--mark"]).toBeUndefined();
    }
  });

  it("family colors derive from a single authored Grid hue", () => {
    // "One place to update the colors": recoloring a family means editing its
    // `grid` hex in familyTheme.ts. The dark accent IS that hex, the light one
    // its derived variant, accentUi each theme's push — never a hand-kept twin.
    for (const theme of FAMILY_THEMES) {
      expect(theme.dark.accent).toBe(theme.grid);
      expect(theme.light.accent).toBe(lightVariant(theme.grid));
      expect(theme.light.accentUi).toBe(uiAccentFor(theme.light.accent, "light"));
      expect(theme.dark.accentUi).toBe(uiAccentFor(theme.dark.accent, "dark"));
      expect(theme.accent).toBe(`light-dark(${theme.light.accent}, ${theme.dark.accent})`);
      expect(
        (theme as unknown as Record<string, unknown>).accentSoft,
      ).toBeUndefined();
    }
  });

  it("AppShell resolves the route's family but does not tint chrome with it", () => {
    // Reversed from the original design: the sidebar/header/mobile sheet
    // used to tint with the lesson's family via a familyCssVars(...) remap
    // on a display:contents wrapper around the whole shell. General UI is
    // steel/indigo everywhere now — one design across the app — and a
    // family or course accent is scoped to the specific components that
    // still legitimately want it (viz tracers, curriculum-card identity),
    // not lifted to the shell. AppShell still RESOLVES which family a
    // route belongs to (activeThemeFor, tested in appShellRouting.test.ts)
    // for any scoped component that wants it, it just no longer turns that
    // into a page-wide CSS variable remap itself.
    const shell = readFileSync(
      join(SRC, "components", "layout", "AppShell.tsx"),
      "utf8",
    );
    expect(shell).toMatch(/findProblemBySlug/);
    expect(shell).toMatch(/moduleFamily/);
    // Precise call-syntax match (not a bare substring test) so this
    // doesn't trip over the two names appearing in prose in a comment
    // explaining why they're gone from here.
    expect(shell).not.toMatch(/familyCssVars\(/);
    expect(shell).not.toMatch(/singleAccentCssVars\(/);
    expect(shell).not.toMatch(/className="contents"/);
  });

  it("curriculum map cards scope per-module family colors", () => {
    const coursePage = readFileSync(
      join(SRC, "app", "courses", "dsa", "page.tsx"),
      "utf8",
    );
    // Each curriculum-map card applies its own module's family scope so the
    // glyph, wash band, and hover read that module's colour.
    expect(coursePage).toMatch(/moduleFamily\(module\)/);
    expect(coursePage).toMatch(/familyCssVars\(family\)/);
  });

  it("the practice dashboard colours its topic dots by family, not by section scope", () => {
    // The flat problem list (2026-09 redesign) has no per-module section to
    // scope with familyCssVars — each row/topic just carries a small literal
    // dot in that module's real accent colour, in both the sidebar's Topics
    // list (useProblemFilters, shared by the practice page and the landing
    // Practice window) and each row's module tag (ProblemsFlatList).
    // Deliberately different from the curriculum-map card pattern above: a
    // dense list of 116 rows accent-washing per row would be noise, not a
    // design.
    const problemsList = readFileSync(
      join(SRC, "components", "problems", "useProblemFilters.ts"),
      "utf8",
    );
    const flatList = readFileSync(
      join(SRC, "components", "problems", "ProblemsFlatList.tsx"),
      "utf8",
    );
    expect(problemsList).toMatch(/moduleFamily\(g\.module\)/);
    expect(problemsList).toMatch(/getFamilyTheme\(familyId\)\.accent/);
    expect(flatList).toMatch(/getFamilyTheme\(p\.familyId\)\.accent/);
  });

  it("every module declares a valid family", () => {
    // The three opening modules had none until the foundations family (#15,
    // #40); a module without one falls back to chrome and loses its colour.
    const valid = new Set(FAMILY_THEMES.map((f) => f.id));
    expect(MODULES).toHaveLength(24);
    for (const mod of MODULES) {
      const family = moduleFamily(mod);
      expect(family, `module ${mod.slug} has no family`).not.toBeNull();
      expect(
        valid.has(family as never),
        `module ${mod.slug} maps to unknown family ${family}`,
      ).toBe(true);
    }
  });

  it("Callout: treatment B — tint, line and label per kind of message", () => {
    // Spec 2026-09-13 §4–§6. Colour names the category: yellow understanding
    // (key, brain), red a mistake (warn), blue context (goal), green a
    // requirement (constraint), steel advice (tip). Every labelled type
    // carries a tint, a 3px *-line rule and a label in its text colour; a
    // plain blockquote stays an unlabelled rule.
    const body = readFileSync(join(SRC, "components", "md", "Callout.tsx"), "utf8");
    expect(body).toMatch(/key:\s*"border-l-insight-line bg-callout-tint-understanding"/);
    expect(body).toMatch(/brain:\s*"border-l-insight-line bg-callout-tint-understanding"/);
    expect(body).toMatch(/warn:\s*"border-l-bad-line bg-callout-tint-mistake"/);
    expect(body).toMatch(/tip:\s*"border-l-advice-line bg-callout-tint-advice"/);
    expect(body).toMatch(/goal:\s*"border-l-info-line bg-callout-tint-context"/);
    expect(body).toMatch(/constraint:\s*"border-l-good-line bg-callout-tint-requirement"/);
    expect(body).toMatch(/default:\s*"border-l-2 border-l-rule-strong"/);
    expect(body).toMatch(/border-l-3/);
    expect(body).not.toMatch(/\bborder-l-warn\b|\btext-warn\b/);
    expect(body).not.toMatch(/\b(?:note|rocket|build):/);
    // No pastel surface fill; tints are the backgrounds.
    expect(body).not.toMatch(/bg-\w+-surface/);
    // Body inherits the prose size: a fixed 0.95rem was 75–80% of reading
    // prose and ~109% of problem-pane prose.
    expect(body).not.toMatch(/text-\[0\.95rem\]/);
    // Label: small bold uppercase in the category's text colour.
    expect(body).toMatch(/text-\[0\.7rem\][^"]*font-bold[^"]*uppercase/);
    // The copy button must appear on keyboard focus, not only on hover.
    expect(body).toMatch(/group-hover:opacity-100[^"]*focus-visible:opacity-100/);
  });

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
      // Lines are generated per theme (palette spec §4.3), so the
      // semantic token names one primitive and .dark does not override it.
      expect(root).toMatch(new RegExp(`--${role}-line:\\s*var\\(--hue-${hue}-line\\)`));
      expect(stripComments(dark)).not.toMatch(new RegExp(`--${role}-line:`));
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

  it("callout tints (treatment B) clear their floors on the card, both themes", () => {
    // Spec 2026-09-13 §5: every labelled callout carries a tint — palette
    // level 1 mixed into --elevated. The tint is flattened onto the card it
    // paints on before measuring. Fallback A sets these tokens to transparent,
    // which this test would then fail by design (spec §8.2).
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    const labelOf: Record<string, string> = {
      understanding: "insight",
      mistake: "bad",
      context: "info",
      requirement: "good",
      advice: "mark",
    };
    const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const themes: [string, string | null][] = [
      ["light", null],
      ["dark", dark],
    ];
    for (const [theme, body] of themes) {
      const token = (name: string) => resolveToken(root, body, name);
      const card = token("elevated");
      for (const [category, labelRole] of Object.entries(labelOf)) {
        const name = `callout-tint-${category}`;
        if (body !== null) {
          expect(
            new RegExp(`--${name}:`).test(stripComments(body)),
            `.dark must redefine --${name} (70% mix)`,
          ).toBe(true);
        }
        const m =
          /^color-mix\(in srgb, (?:var\(--([\w-]+)\)|(#[0-9a-f]{6})) (\d+)%, var\(--elevated\)\)$/.exec(
            token(name),
          );
        expect(m, `${theme} --${name} is a color-mix into --elevated`).not.toBeNull();
        const source = m![1] ? token(m![1]) : m![2]!;
        const share = Number(m![3]) / 100;
        const bg = channels(card);
        const tint =
          "#" +
          channels(source)
            .map((c, i) => Math.round(c * share + bg[i]! * (1 - share)))
            .map((c) => c.toString(16).padStart(2, "0"))
            .join("");
        const step = contrastRatio(tint, card);
        expect(step, `${theme} ${category} tint ${tint} step off the card`).toBeGreaterThanOrEqual(1.15);
        expect(step, `${theme} ${category} tint ${tint} step off the card`).toBeLessThanOrEqual(1.3);
        expect(
          contrastRatio(token(labelRole), tint),
          `${theme} ${category} label (--${labelRole}) on ${tint}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(token("foreground"), tint),
          `${theme} ${category} body on ${tint}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(css).toMatch(new RegExp(`--color-${name}:\\s*var\\(--${name}\\)`));
      }
      // Tip's rule has no palette hue; it must still clear the 3:1 line floor on the card.
      expect(contrastRatio(token("advice-line"), card), `${theme} advice-line on the card`).toBeGreaterThanOrEqual(3);
    }
    expect(css).toMatch(/--color-advice-line:\s*var\(--advice-line\)/);
    expect(css).toMatch(/--color-rule-strong:\s*var\(--rule-strong\)/);
  });

  it("MarginNote, ComplexityStrip, InsightPanel use --info, not --mark", () => {
    const marginNote = readFileSync(
      join(SRC, "components", "md", "MarginNote.tsx"),
      "utf8",
    );
    const complexityStrip = readFileSync(
      join(SRC, "components", "cheatsheet", "ComplexityStrip.tsx"),
      "utf8",
    );
    const insightPanel = readFileSync(
      join(SRC, "components", "insight", "InsightPanel.tsx"),
      "utf8",
    );
    for (const [name, body] of [
      ["MarginNote", marginNote],
      ["ComplexityStrip", complexityStrip],
      ["InsightPanel", insightPanel],
    ] as const) {
      expect(body, `${name} should not reference --mark`).not.toMatch(
        /\b(?:text|border|bg)-mark\b/,
      );
    }
    expect(marginNote).toMatch(/border-info/);
    expect(marginNote).toMatch(/text-info/);
    expect(complexityStrip).toMatch(/text-info/);
    expect(insightPanel).toMatch(/text-info/);
  });

  it("ExamplesBlock does not hardcode text-good on every output", () => {
    const body = readFileSync(
      join(SRC, "components", "md", "ExamplesBlock.tsx"),
      "utf8",
    );
    // The old bug: a single `text-good` applied unconditionally to output.
    expect(body).not.toMatch(/text-good"\s*>\s*\n\s*<pre/);
    expect(body).toMatch(/isBooleanOutput/);
  });

  it("ExamplesBlock's true/false pills hug their text instead of filling the grid column", () => {
    const body = readFileSync(
      join(SRC, "components", "md", "ExamplesBlock.tsx"),
      "utf8",
    );
    // The pills are grid items, and grid items stretch to their column even
    // when they are `inline-flex` — "true" measured 538px wide. The start
    // alignment is the only thing keeping them content width.
    const pills = [...body.matchAll(/className="([^"]*\bbg-(?:good|bad)\/10\b[^"]*)"/g)];
    expect(pills).toHaveLength(2);
    for (const [, cls] of pills) {
      expect(cls).toMatch(/\bjustify-self-start\b/);
    }
  });

  it("prose anchor-link hover ink clears AA at normal-text size in both themes", () => {
    // Regression: --accent is documented (tier-1 comment above --press-lime) as
    // large/UI-only — at the base it is steel (fine anywhere), but inside a
    // lesson's family scope it becomes the saturated family accent, short of
    // AA's 4.5:1 floor for handbook-prose's 19px normal-weight links. This
    // asserts the site actually used (--mark) rather than just asserting a
    // token pair in isolation, which is what let the violation ship silently
    // the first time.
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).toMatch(/\.anchor-link:hover\s*\{[^}]*color:\s*var\(--mark\)/);

    // Regular lesson-body prose links must use the same AA-safe ink — the
    // Markdown a() override historically painted them --accent, below AA for
    // body text inside a family scope.
    const markdown = readFileSync(
      join(SRC, "components", "md", "Markdown.tsx"),
      "utf8",
    );
    expect(markdown).toMatch(/text-mark underline/);
    expect(markdown).not.toMatch(/text-accent/);

    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));
    const lightPaper = firstHexVar(root, "press-paper");
    const darkPaper = firstHexVar(dark, "press-paper");
    const lightMark = firstHexVar(root, "press-blue");
    const darkMark = firstHexVar(dark, "press-blue");

    expect(contrastRatio(lightMark!, lightPaper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkMark!, darkPaper!)).toBeGreaterThanOrEqual(4.5);
  });

  it("radius scale is defined identically in :root and @theme inline", () => {
    // The scale lives in two places: the :root tier and the @theme inline
    // block that Tailwind v4 reads. If they drift, a future component could
    // resolve rounded-sm to a different value than --radius-sm. Enforce the
    // 4/8/12/20/28 five-tier scale in both.
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const themeStart = css.indexOf("@theme");
    const theme = css.slice(themeStart, css.indexOf(":root", themeStart));
    const expectScale = (region: string) => {
      expect(region).toMatch(/--radius-xs:\s*4px/);
      expect(region).toMatch(/--radius-sm:\s*8px/);
      expect(region).toMatch(/--radius-md:\s*12px/);
      expect(region).toMatch(/--radius-lg:\s*20px/);
      expect(region).toMatch(/--radius-xl:\s*28px/);
    };
    expectScale(root);
    expectScale(theme);
  });

  it("no off-scale radius utilities in components", () => {
    // Radius is a five-tier scale (xs/sm/md/lg/xl) spelled
    // `rounded-[length:var(--radius-md)]` — never the bare shorthand
    // (rounded-sm/md/lg/xl), never arbitrary pixel values
    // (rounded-[4px]), and never a size tier with no token (2xl, 3xl).
    // rounded-full is the one allowed non-token spelling: pills, avatars,
    // and progress bars are meant to be fully round.
    // Spec: docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md
    const RADIUS_TOKEN = /\brounded[^\s"'`]*/g;
    const RADIUS_ALLOWED =
      /rounded(?:-(?:t|b|s|e|r|tl|tr|bl|br))?-(?:full|\[length:var\(--radius-)/;
    const hits: string[] = [];
    for (const f of FILES) {
      if (f.rel === "app/globals.css") continue;
      const bad = (stripComments(f.body).match(RADIUS_TOKEN) ?? []).filter(
        (t) => !RADIUS_ALLOWED.test(t),
      );
      if (bad.length) hits.push(`${f.rel}: ${[...new Set(bad)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });
});

describe("type system", () => {
  it("binds Space Mono to display and Space Grotesk to body", () => {
    const layout = readFileSync(join(SRC, "app", "layout.tsx"), "utf8");
    const imported =
      layout.match(/import \{([^}]*)\} from "next\/font\/google"/)?.[1] ?? "";
    expect(
      imported
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .sort(),
    ).toEqual(["JetBrains_Mono", "Space_Grotesk", "Space_Mono"]);
    // Space Mono has no variable axis: without an explicit weight list
    // next/font refuses to load it, and a missing 700 would be faked.
    expect(layout).toMatch(
      /Space_Mono\(\{[^}]*weight:\s*\["400",\s*"700"\][^}]*variable:\s*"--font-display"/,
    );
    expect(layout).toMatch(
      /Space_Grotesk\(\{[^}]*variable:\s*"--font-sans-face"/,
    );
  });

  it("emphasis is carried by weight, never a synthesised slant", () => {
    // Space Grotesk ships no italic: <em> would render as a fake oblique.
    const css = readFileSync(GLOBALS, "utf8");
    const em = cssBlock(css, "  em,\n  i");
    expect(em).toMatch(/font-style:\s*normal/);
    expect(em).toMatch(/font-weight:\s*500/);
    // 500 vs 600 read as one weight in review; 700 keeps them apart.
    expect(cssBlock(css, "  strong,\n  b")).toMatch(/font-weight:\s*700/);
    expect(cssBlock(css, "  :is(code, pre, kbd, samp) :is(em, i)")).toMatch(
      /font-style:\s*italic/,
    );
    expect(cssBlock(css, ".handbook-prose strong")).toMatch(/font-weight:\s*700/);
    const coach = readFileSync(
      join(SRC, "components", "coach", "CoachMarkdown.tsx"),
      "utf8",
    );
    expect(coach).not.toMatch(/\[&_strong\]:font-semibold/);
  });

  it("chapter headings are a hairline, with no counter label", () => {
    const css = readFileSync(GLOBALS, "utf8");
    // The quiz renders inside .handbook-prose in every problem's Quiz tab and
    // in the multi-quiz drill lessons, and its heading is an h2.chapter-heading
    // inside a flex row that already carries .chapter-rule — the article rules
    // must skip it, or it gets a second hairline and steals a chapter number
    // from the sections after it.
    expect(css).not.toMatch(/\n\.handbook-prose h2( |::before) \{/);
    const h2 = cssBlock(css, ".handbook-prose h2:not(.chapter-heading)");
    expect(h2).toMatch(/border-top:\s*1px solid var\(--rule-strong\)/);
    // The old pill + wash assumed a family colour prose no longer gets.
    expect(h2).not.toMatch(/background|family-wash/);
    expect(cssBlock(css, ".problem-prose .handbook-prose h2:not(.chapter-heading)")).toMatch(
      /margin-top:\s*1\.75rem/,
    );
    // The decorative "// 01" counter was removed on 2026-09-12. Assert it stays
    // gone: the counter, its reset, and the problem-prose override that existed
    // only to suppress it are all obsolete together.
    expect(css).not.toMatch(/counter-increment:\s*chapter/);
    expect(css).not.toMatch(/counter\(chapter/);
    expect(css).not.toMatch(/counter-reset:\s*chapter/);
    expect(cssBlock(css, ".chapter-rule")).toMatch(
      /border-top:\s*1px solid var\(--rule-strong\)/,
    );
    expect(css).toMatch(/--press-rule-strong:\s*rgba\(22, 32, 46, 0\.18\)/);
    expect(css).toMatch(/--press-rule-strong:\s*rgba\(163, 174, 188, 0\.38\)/);
    expect(css).toMatch(/--rule-strong:\s*var\(--press-rule-strong\)/);
  });

  it("the heading that opens a prose body carries no hairline", () => {
    // A hairline separates a section from the one before it. The first element
    // of a prose body has nothing above it inside that body — the tab bar, the
    // page's own padding or the title sits there instead — so the rule drew a
    // divider under nothing (measured on the Problem, Solution and Quiz tabs
    // and on the lesson reading page).
    const css = readFileSync(GLOBALS, "utf8");
    const selector =
      ".handbook-prose > h2:first-child:not(.chapter-heading),\n.handbook-prose > :first-child > .chapter-rule:first-child";
    const block = cssBlock(css, selector);
    expect(block).toMatch(/border-top:\s*0/);
    expect(block).toMatch(/padding-top:\s*0/);
    expect(block).toMatch(/margin-top:\s*0/);
    // It ties the problem pane's heading rule on specificity, so it must come
    // after it — before, that rule won and the heading kept 22.75px on top.
    expect(css.indexOf(`\n${selector} {`)).toBeGreaterThan(
      css.indexOf("\n.problem-prose .handbook-prose h2:not(.chapter-heading) {"),
    );
    // One rule for every Markdown body, not a per-context first-child patch.
    expect(css).not.toContain(".reading-page .handbook-prose > h2:first-child {");
  });

  it("component section headings share the class, not a copied accent bar", () => {
    expect(
      FILES.filter((f) => f.body.includes("h-[3px] w-10")).map((f) => f.rel),
    ).toEqual([]);
    for (const rel of [
      "components/course/Quiz.tsx",
      "components/cheatsheet/Cheatsheet.tsx",
      "components/md/PracticeProblemsList.tsx",
    ]) {
      const body = FILES.find((f) => f.rel === rel)?.body ?? "";
      expect(body, rel).toMatch(/\bchapter-heading\b/);
      expect(body, rel).toMatch(/\bchapter-rule\b/);
    }
  });

  it("a lesson renders exactly one Markdown body", () => {
    for (const rel of [
      "components/course/LessonView.tsx",
      "app/courses/nextjs/[module]/[chapter]/[lesson]/page.tsx",
    ]) {
      const body = FILES.find((f) => f.rel === rel)?.body ?? "";
      expect(body.match(/<Markdown\b/g)?.length, rel).toBe(1);
    }
  });

  it("lesson titles render in title case", () => {
    // Uppercase monospace wraps a 57-character title to 4–5 lines at 375px.
    const body =
      FILES.find((f) => f.rel === "components/course/LessonView.tsx")?.body ?? "";
    const h1 = body.match(/<h1 className="([^"]*)"/)?.[1] ?? "";
    expect(h1).toMatch(/\bfont-display\b/);
    expect(h1).not.toMatch(/\buppercase\b/);
  });

  it("pairs the display face only with weights Space Mono ships (400/700)", () => {
    const UNSHIPPED =
      /\bfont-(?:thin|extralight|light|medium|semibold|extrabold|black)\b|\bfont-\[\d+\]/;
    const hits: string[] = [];
    for (const f of FILES) {
      if (!f.rel.endsWith(".tsx")) continue;
      f.body.split("\n").forEach((line, i) => {
        if (/\bfont-display\b/.test(line) && UNSHIPPED.test(line)) {
          hits.push(`${f.rel}:${i + 1}`);
        }
      });
    }
    const css = readFileSync(GLOBALS, "utf8");
    for (const block of css.split("}")) {
      if (!block.includes("var(--font-display)")) continue;
      const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim();
      if (weight && !["400", "700", "normal", "bold"].includes(weight)) {
        hits.push(`app/globals.css: font-weight ${weight} with the display face`);
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("lesson reading page", () => {
  const byRel = new Map(FILES.map((f) => [f.rel, f.body]));
  const SHADOW_SCOPE =
    '.reading-page .shadow-elevation:not([role="dialog"], [role="dialog"] *)';

  it("sets the reading, and only the reading, on one page", () => {
    const view = byRel.get("components/course/LessonView.tsx") ?? "";
    expect(view.match(/\breading-page\b/g)).toHaveLength(1);
    expect(view).toMatch(/<article className="reading-column\b/);
    const open = view.indexOf('className="reading-page shadow-elevation');
    expect(open).toBeGreaterThan(-1);
    const page = view.slice(open, view.indexOf("<nav"));
    for (const inside of ["<Markdown", "{infographic ?", "{afterMarkdown ?"]) {
      expect(page, inside).toContain(inside);
    }
    // Header and stage stay on the desk, above the page.
    const desk = view.slice(0, open);
    for (const outside of ["<h1", "{stage ?"]) {
      expect(desk, outside).toContain(outside);
    }
  });

  it("the page is paper, the column holds the measure, and cards in it lose their lift", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).toMatch(/--reading-measure:\s*54rem/);
    expect(cssBlock(css, ".reading-column")).toMatch(
      /max-width:\s*calc\(var\(--reading-measure\) \+ 2 \* var\(--reading-page-pad\)\)/,
    );
    expect(cssBlock(css, ".reading-page")).toMatch(/background:\s*var\(--elevated\)/);
    expect(cssBlock(css, SHADOW_SCOPE)).toMatch(/box-shadow:\s*none/);
  });

  it("in-flow cards rendered inside the page step down to a well", () => {
    // Walk imports from everything LessonView sets on the page, so a new
    // markdown component is covered without anyone remembering to list it.
    // A bg-elevated card in that tree is white on white unless it pairs the
    // page variant.
    const ROOTS = [
      "components/md/Markdown.tsx",
      "components/course/Quiz.tsx",
      "components/course/ChapterInfographic.tsx",
      "components/md/PracticeProblemsList.tsx",
      "components/cheatsheet/Cheatsheet.tsx",
    ];
    // Files the walk reaches whose bg-elevated is not an in-flow card on the
    // page. Counts are pinned so a new card in the same file still fails.
    const NOT_IN_PAGE_FLOW: Record<string, number> = {
      // Its fullscreen dialog, floating over a scrim.
      "components/md/Mermaid.tsx": 2,
      // The language menu, portalled to <body> above the page, not in it.
      "components/code/CodeLangMenu.tsx": 1,
      // Only in difficultyFilterChipClass (problems hub filter panel); the walk
      // arrives because PracticeProblemsList imports a sibling export.
      "lib/course/problemDifficulty.ts": 1,
    };
    const ELEVATED = /\bbg-elevated(\/\d+)?(?![\w/-])/g;

    const resolve = (from: string, spec: string): string | null => {
      const base = spec.startsWith("@/")
        ? spec.slice(2)
        : spec.startsWith(".")
          ? posix.join(posix.dirname(from), spec)
          : null;
      if (base === null) return null;
      const hit = [".tsx", ".ts", "/index.tsx", "/index.ts"]
        .map((ext) => base + ext)
        .find((rel) => byRel.has(rel));
      return hit ?? null;
    };

    for (const root of ROOTS) expect(byRel.has(root), root).toBe(true);
    const seen = new Set<string>();
    const queue = [...ROOTS];
    while (queue.length) {
      const rel = queue.pop()!;
      if (seen.has(rel)) continue;
      seen.add(rel);
      const body = byRel.get(rel) ?? "";
      for (const m of body.matchAll(/(?:from\s+|import\(\s*)["']([^"']+)["']/g)) {
        const next = resolve(rel, m[1]);
        if (next) queue.push(next);
      }
    }

    // Comments that name the class (Mermaid explains its dialog fill) are not
    // surfaces.
    const codeLines = (body: string) =>
      body.split("\n").map((line) => (/^\s*(?:\/\/|\/?\*)/.test(line) ? "" : line));

    const hits: string[] = [];
    for (const rel of seen) {
      const lines = codeLines(byRel.get(rel) ?? "");
      if (rel in NOT_IN_PAGE_FLOW) {
        const count = lines.reduce((n, line) => n + (line.match(ELEVATED)?.length ?? 0), 0);
        expect(count, rel).toBe(NOT_IN_PAGE_FLOW[rel]);
        continue;
      }
      lines.forEach((line, i) => {
        for (const m of line.matchAll(ELEVATED)) {
          if (!line.includes(`in-[.reading-page]:bg-background${m[1] ?? ""}`)) {
            hits.push(`${rel}:${i + 1}`);
          }
        }
      });
    }
    expect(hits).toEqual([]);
  });
});

describe("problem workspace prose", () => {
  it("holds a readable measure however wide the description pane gets", () => {
    // Measured 2026-09-17 in Chrome on Move Zeroes: an average character is
    // 0.742ch in this face and size, and the pane at an even split ran 112
    // characters a line at 1280px, 148 at 1920 and 199 at 2560. 60ch is 80
    // characters, WCAG 1.4.8's ceiling; ch scales with the prose size.
    const css = readFileSync(GLOBALS, "utf8");
    const prose = cssBlock(css, ".problem-prose .handbook-prose");
    expect(prose).toMatch(/max-width:\s*60ch/);
    expect(prose).toMatch(/font-size:\s*calc\(var\(--problem-prose-scale\) \* 1rem\)/);
  });

  it("caps the description pane at that measure, so wide screens give the room to the editor", () => {
    // 60ch in the prose's size, measured from the pane's own 1rem ch, plus the
    // tab panel's sm:px-5 padding on both sides.
    const css = readFileSync(GLOBALS, "utf8");
    expect(cssBlock(css, ".problem-description-pane")).toMatch(
      /max-width:\s*calc\(60ch \* var\(--problem-prose-scale\) \+ 2 \* 1\.25rem\)/,
    );
    // A floor at 45 characters (45/80 of 60ch), the low end of a comfortable
    // measure: the split's 28% floor exceeds the cap from ~1936px and locked it.
    expect(cssBlock(css, ".problem-description-pane")).toMatch(
      /min-width:\s*calc\(33\.75ch \* var\(--problem-prose-scale\) \+ 2 \* 1\.25rem\)/,
    );
    const workspace = readFileSync(join(SRC, "components", "problems", "ProblemWorkspace.tsx"), "utf8");
    expect(workspace).toContain('primaryClassName="problem-description-pane"');
    expect(workspace).toContain('className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:pb-21"');
  });
});
