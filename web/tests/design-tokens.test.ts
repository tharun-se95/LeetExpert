import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { CODE_LIGHT } from "../src/lib/content/codePalette";
import {
  FAMILY_THEMES,
  familyCssVars,
  uiAccent,
} from "../src/lib/visual/familyTheme";
import { MODULES, moduleFamily } from "../src/lib/course/manifest";

/**
 * Guard the handbook press identity against regressions that survive a
 * palette change or break dark mode.
 *
 * Components must consume semantic tokens (bg-accent, text-good, …), not
 * Tailwind palette classes and not `text-white` on accent fills — prefer
 * `text-on-pop` on `bg-pop`. Pop is fill-only on paper; accent carries
 * coloured text.
 *
 * Spec: docs/superpowers/specs/2026-07-31-codemacha-handbook-identity-design.md
 */

const SRC = join(__dirname, "..", "src");
const GLOBALS = join(SRC, "app", "globals.css");

/** Files that own raw hex by design — not UI chrome. */
const HEX_ALLOW = new Set([
  "app/globals.css", // tier-1 ink definitions
  "lib/content/codePalette.ts", // Shiki theme; mirrored by --tok-* in CSS
  "lib/visual/familyTheme.ts", // per-family accent map for PatternLab
  "components/md/Mermaid.tsx", // Mermaid theme API wants resolved hex
  "components/sandbox/editorTheme.ts", // may mirror --tok-* literals
  "components/sandbox/languageMarks.tsx", // brand colour, not design-system colour
  "app/courses/dsa/registry.ts", // per-course accent hex, same pattern as familyTheme.ts
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

const PALETTE_CLASS =
  /\b(?:text|bg|border|ring|from|to|via)-(?:emerald|red|green|blue|amber|yellow|orange|purple|pink|indigo|violet|sky|teal|cyan|rose|fuchsia|lime)-\d{2,3}\b/g;

const WHITE_ON_ACCENT =
  /\bbg-accent\b[^\n]*\btext-white\b|\btext-white\b[^\n]*\bbg-accent\b/;

const BOX_SHADOW_CLASS =
  /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b|\bshadow-\[[^\]]+\]/;

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/** First `--name: #hex` in a CSS region (non-greedy up to next brace block). */
function firstHexVar(css: string, name: string): string | null {
  const re = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`);
  const m = css.match(re);
  return m?.[1]?.toLowerCase() ?? null;
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
    expect(firstHexVar(dark, "press-paper")).toBe("#121214");
    expect(firstHexVar(dark, "elevated")).toBe("#26262a");
    expect(firstHexVar(dark, "code")).toBe("#19191d");
    expect(firstHexVar(dark, "surface")).toBe("#0c0c0d");
    expect(firstHexVar(dark, "press-lime")).toBe("#cbd5e1");
    expect(firstHexVar(dark, "press-blue")).toBe("#cbd5e1");
    expect(dark).toMatch(
      /--press-rule:\s*rgba\(\s*244\s*,\s*244\s*,\s*245\s*,\s*0\.09\s*\)/,
    );
  });

  it("surface ladders are perceptible in both themes", () => {
    // Both themes carry a real, flat (no-shadow) layer ladder with the same
    // relative order — elevated brightest, surface deepest, never an
    // inversion. Light: white cards pop off a cool-gray page, editor and
    // test wells step down. Measured light 1.10 / 1.11 / 1.12 / 1.36; dark
    // 1.24 / 1.16 / 1.07 / 1.05 (see globals.css comments).
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
    // (--press-paper-sunk). Every ink that can sit there must clear AA.
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const sunk = firstHexVar(root, "press-paper-sunk")!;
    const inks: Record<string, string> = {
      ink: firstHexVar(root, "press-ink")!,
      muted: firstHexVar(root, "press-ink-soft")!,
      good: firstHexVar(root, "press-green")!,
      bad: firstHexVar(root, "press-red")!,
      warn: firstHexVar(root, "press-amber")!,
      insight: firstHexVar(root, "press-insight")!,
      info: firstHexVar(root, "tone-sky")!,
      mark: firstHexVar(root, "press-blue")!,
    };
    for (const [name, ink] of Object.entries(inks)) {
      expect(contrastRatio(ink, sunk), `${name} vs sunk`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("code colours are one source and clear AA on the code surface", () => {
    // CLAUDE.md: "Code colour has one source." codePalette.ts feeds Shiki;
    // the light --tok-* block in globals.css feeds CodeMirror. They must not
    // drift, and every token must clear 4.5:1 on --code (which now steps
    // below the page, so the old palette no longer passes — see the ladder).
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const codeSurface = firstHexVar(root, "code")!;
    const tokStart = css.lastIndexOf(":root");
    const tokRoot = css.slice(
      tokStart,
      css.indexOf(".dark", tokStart),
    );
    const tok = (name: string) => firstHexVar(tokRoot, name);

    expect(tok("tok-comment")).toBe(CODE_LIGHT.comment);
    expect(tok("tok-keyword")).toBe(CODE_LIGHT.keyword);
    expect(tok("tok-string")).toBe(CODE_LIGHT.string);
    expect(tok("tok-constant")).toBe(CODE_LIGHT.constant);
    expect(tok("tok-entity")).toBe(CODE_LIGHT.entity);
    expect(tok("tok-variable")).toBe(CODE_LIGHT.variable);
    expect(tok("tok-name")).toBe(CODE_LIGHT.fg);

    for (const [name, hex] of Object.entries(CODE_LIGHT)) {
      expect(contrastRatio(hex, codeSurface), `${name} vs code`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("Insight and Information roles are defined and AA-compliant", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const lightInsight = firstHexVar(root, "press-insight");
    const darkInsight = firstHexVar(dark, "press-insight");
    const lightPaper = firstHexVar(root, "press-paper");
    const darkPaper = firstHexVar(dark, "press-paper");

    expect(lightInsight).toBe("#854d0e");
    expect(darkInsight).toBe("#facc15");
    expect(contrastRatio(lightInsight!, lightPaper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkInsight!, darkPaper!)).toBeGreaterThanOrEqual(4.5);

    // --info aliases the existing (previously near-unused) --tone-sky token.
    expect(root).toMatch(/--info:\s*var\(--tone-sky\)/);
    expect(css).toMatch(/--color-insight:\s*var\(--insight\)/);
    expect(css).toMatch(/--color-info:\s*var\(--info\)/);
  });

  it("family accentUi clears the UI floor on every surface it can render on, in both themes", () => {
    // uiAccent() used to check only one surface per theme (the page
    // background/paper). But --pop/--accent render on --elevated, --code,
    // and --surface too — and in dark mode --elevated is the BRIGHTEST
    // surface (opposite of light mode), so it is the true worst case, not
    // the paper. Checking only paper let linear-traversal and
    // recursive-exploration ship at 2.7-2.9:1 against --elevated, well under
    // the 3:1 floor, on the two families covering most of the course.
    const lightSurfaces = {
      background: "#f1f4f9",
      elevated: "#ffffff",
      code: "#e4e9f2",
      surface: "#d8dde8",
    };
    const darkSurfaces = {
      background: "#121214",
      elevated: "#26262a",
      code: "#19191d",
      surface: "#0c0c0d",
    };
    for (const theme of FAMILY_THEMES) {
      for (const [name, hex] of Object.entries(lightSurfaces)) {
        const ratio = contrastRatio(theme.accentUi, hex);
        expect(
          ratio,
          `${theme.id} accentUi ${theme.accentUi} on light ${name} (${hex}) is ${ratio.toFixed(2)}:1, needs >= 3:1`,
        ).toBeGreaterThanOrEqual(3);
      }
      for (const [name, hex] of Object.entries(darkSurfaces)) {
        const ratio = contrastRatio(theme.accentUi, hex);
        expect(
          ratio,
          `${theme.id} accentUi ${theme.accentUi} on dark ${name} (${hex}) is ${ratio.toFixed(2)}:1, needs >= 3:1`,
        ).toBeGreaterThanOrEqual(3);
      }
      // onAccentUi pairs with accentUi specifically (--pop/--on-pop, e.g. the
      // coach masthead mark) — a DIFFERENT fill from onAccent's pairing with
      // the raw --family-accent (viz cells), and the two can require
      // different ink: darkening accentUi enough to clear the light floor
      // above pushed state-transition/relationships past the point where
      // their dark onAccent ink stays AA-legible on it, even though that
      // same dark ink is comfortably legible on the (brighter) raw accent.
      const onFill = contrastRatio(theme.onAccentUi, theme.accentUi);
      const floor = theme.onAccentUi.toLowerCase() === "#ffffff" ? 3 : 4.5;
      expect(
        onFill,
        `${theme.id} onAccentUi ${theme.onAccentUi} on accentUi ${theme.accentUi} is ${onFill.toFixed(2)}:1, needs >= ${floor}:1`,
      ).toBeGreaterThanOrEqual(floor);
    }
  });

  it("status inks (good/bad/warn/info/muted) clear AA text contrast on every surface, both themes", () => {
    // These render as readable status text (\"1 of 5 tests passed\", sidebar
    // labels), not decorative chrome, so the floor is the 4.5:1 text
    // minimum — checked against every surface they can actually paint on,
    // not just the one the original token comment happened to measure.
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const lightSurfaces = [
      firstHexVar(root, "press-paper")!,
      firstHexVar(root, "elevated")!,
      firstHexVar(root, "code")!,
      firstHexVar(root, "press-paper-sunk")!,
    ];
    const darkSurfaces = [
      firstHexVar(dark, "press-paper")!,
      firstHexVar(dark, "elevated")!,
      firstHexVar(dark, "code")!,
      firstHexVar(dark, "surface")!,
    ];

    const lightInks: Record<string, string> = {
      muted: firstHexVar(root, "press-ink-soft")!,
      good: firstHexVar(root, "press-green")!,
      bad: firstHexVar(root, "press-red")!,
      warn: firstHexVar(root, "press-amber")!,
      info: firstHexVar(root, "tone-sky")!,
    };
    const darkInks: Record<string, string> = {
      muted: firstHexVar(dark, "press-ink-soft")!,
      good: firstHexVar(dark, "press-green")!,
      bad: firstHexVar(dark, "press-red")!,
      warn: firstHexVar(dark, "press-amber")!,
      info: firstHexVar(dark, "tone-sky")!,
    };

    for (const [name, ink] of Object.entries(lightInks)) {
      for (const surface of lightSurfaces) {
        const ratio = contrastRatio(ink, surface);
        expect(
          ratio,
          `light ${name} ${ink} on ${surface} is ${ratio.toFixed(2)}:1, needs >= 4.5:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const [name, ink] of Object.entries(darkInks)) {
      for (const surface of darkSurfaces) {
        const ratio = contrastRatio(ink, surface);
        expect(
          ratio,
          `dark ${name} ${ink} on ${surface} is ${ratio.toFixed(2)}:1, needs >= 4.5:1`,
        ).toBeGreaterThanOrEqual(4.5);
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

  it("family colors derive from a single authored accent", () => {
    // "One place to update the colors": recoloring a family means editing the
    // `accent` hex in familyTheme.ts — accentUi must be its derived variant,
    // never a hand-maintained twin that can drift. No accentSoft leftovers.
    for (const theme of FAMILY_THEMES) {
      expect(theme.accentUi).toBe(uiAccent(theme.accent));
      expect(
        (theme as unknown as Record<string, unknown>).accentSoft,
      ).toBeUndefined();
    }
  });

  it("AppShell lifts the family scope over all course chrome", () => {
    // The sidebar/header/mobile sheet live OUTSIDE the page scopes, so the
    // shell applies familyCssVars on a display:contents wrapper — active
    // module chips, progress bars, and hover states all tint with the topic.
    const shell = readFileSync(
      join(SRC, "components", "layout", "AppShell.tsx"),
      "utf8",
    );
    expect(shell).toMatch(/className="contents"/);
    expect(shell).toMatch(/familyCssVars\(family\)/);
    expect(shell).toMatch(/findProblemBySlug/);
    expect(shell).toMatch(/moduleFamily/);
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
    // list (ProblemsListClient) and each row's module tag (ProblemsFlatList).
    // Deliberately different from the curriculum-map card pattern above: a
    // dense list of 116 rows accent-washing per row would be noise, not a
    // design.
    const problemsList = readFileSync(
      join(SRC, "components", "problems", "ProblemsListClient.tsx"),
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

  it("chapter headings carry the family accent bar", () => {
    // The per-chapter colour lives on a flat rule above h2 (handbook-prose).
    // Heading text stays ink; the rule is the accent. Steel outside a scope.
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).toMatch(/\.handbook-prose h2::before/);
    expect(css).toMatch(
      /background:\s*var\(--family-accent,\s*var\(--accent\)\)/,
    );
  });

  it("every module declares a valid family or none", () => {
    const valid = new Set(FAMILY_THEMES.map((f) => f.id));
    for (const mod of MODULES) {
      const family = moduleFamily(mod);
      if (family !== null) {
        expect(
          valid.has(family as never),
          `module ${mod.slug} maps to unknown family ${family}`,
        ).toBe(true);
      }
    }
  });

  it("Callout: constraint is Success-toned, goal/rocket/note are Information, brain is Insight", () => {
    // Rule + label, not a filled box (revised 2026-08 — was a solid
    // pastel/dark bg-*-surface fill on all 191 lessons' Goal/Constraint/Tip
    // callouts, which was the loudest thing on every page it appeared on).
    // The type still carries a colour, just as a left rule + small status
    // label sitting on the page's own background, matching the coach
    // diagnosis card's treatment — no fill, no bold non-uppercase heading.
    const body = readFileSync(
      join(SRC, "components", "md", "Callout.tsx"),
      "utf8",
    );
    expect(body).toMatch(/constraint:\s*"border-l-good/);
    expect(body).toMatch(/goal:\s*"border-l-info/);
    expect(body).toMatch(/rocket:\s*"border-l-info/);
    expect(body).toMatch(/note:\s*"border-l-info/);
    expect(body).toMatch(/brain:\s*"border-l-insight/);
    // tip = "Interview Tip" territory — Amber (teaching-caution), not Indigo.
    expect(body).toMatch(/tip:\s*"border-l-warn/);
    expect(body).not.toMatch(/tip:\s*"border-l-accent/);
    // No solid surface fill left anywhere on the blockquote itself.
    expect(body).not.toMatch(/bg-\w+-surface/);
    // Label is the small muted uppercase treatment, not the old bold heading.
    expect(body).toMatch(/text-\[0\.7rem\][^"]*uppercase/);
  });

  it("Callout pastel surface tokens exist and are AA-compliant against their role ink", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const pairs: [role: string, ink: string][] = [
      ["info", "tone-sky"],
      ["good", "press-green"],
      ["warn", "press-amber"],
      ["insight", "press-insight"],
    ];

    for (const [role, inkVar] of pairs) {
      const lightSurface = firstHexVar(root, `press-${role}-surface`);
      const darkSurface = firstHexVar(dark, `press-${role}-surface`);
      const lightInk = firstHexVar(root, inkVar);
      const darkInk = firstHexVar(dark, inkVar);
      expect(lightSurface, `light ${role} surface missing`).toBeTruthy();
      expect(darkSurface, `dark ${role} surface missing`).toBeTruthy();
      // Bold/large label + icon sitting on the surface — AA large-text floor.
      expect(
        contrastRatio(lightInk!, lightSurface!),
        `light ${role} ink vs its own surface`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(darkInk!, darkSurface!),
        `dark ${role} ink vs its own surface`,
      ).toBeGreaterThanOrEqual(3);
      expect(css).toMatch(new RegExp(`--color-${role}-surface:\\s*var\\(--${role}-surface\\)`));
    }
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
      const bad = (f.body.match(RADIUS_TOKEN) ?? []).filter(
        (t) => !RADIUS_ALLOWED.test(t),
      );
      if (bad.length) hits.push(`${f.rel}: ${[...new Set(bad)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });
});
