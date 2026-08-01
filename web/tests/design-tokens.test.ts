import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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

  it("no Tailwind shadow utilities (depth comes from ink and rules)", () => {
    const hits: string[] = [];
    for (const f of FILES) {
      if (f.rel === "app/globals.css") continue;
      const matches = f.body.match(BOX_SHADOW_CLASS);
      if (matches) hits.push(`${f.rel}: ${[...new Set(matches)].join(", ")}`);
    }
    expect(hits).toEqual([]);
  });

  it("no box-shadow / boxShadow lift outside globals.css", () => {
    const hits = FILES.filter(
      (f) =>
        f.rel !== "app/globals.css" &&
        (/box-shadow\s*:/.test(f.body) || /\bboxShadow\s*:/.test(f.body)),
    ).map((f) => f.rel);
    expect(hits).toEqual([]);
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

  it("globals use Indigo Modern sheet colours", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).not.toMatch(/--shadow-card\s*:/);
    expect(css).not.toMatch(/\.elevated-card\s*\{[^}]*box-shadow/);

    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    expect(firstHexVar(root, "riso-paper")).toBe("#fcfcfd");
    expect(firstHexVar(root, "riso-ink")).toBe("#111827");
    expect(firstHexVar(root, "riso-ink-soft")).toBe("#6b7280");
    expect(firstHexVar(root, "riso-paper-sunk")).toBe("#f7f8fa");
    expect(firstHexVar(root, "elevated")).toBe("#ffffff");
    expect(firstHexVar(root, "code")).toBe("#fafafb");
    expect(root).toMatch(
      /--riso-rule:\s*rgba\(\s*17\s*,\s*24\s*,\s*39\s*,\s*0\.08\s*\)/,
    );
    expect(firstHexVar(root, "riso-olive")).toBe("#6366f1");
    expect(firstHexVar(root, "riso-lime")).toBe("#6366f1");
    expect(firstHexVar(root, "on-pop")).toBe("#ffffff");
    expect(firstHexVar(root, "accent-hover")).toBe("#818cf8");
  });

  it("body text meets AA; Primary is sheet large/UI accent", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const paper = firstHexVar(root, "riso-paper");
    const ink = firstHexVar(root, "riso-ink");
    const muted = firstHexVar(root, "riso-ink-soft");
    const primary = firstHexVar(root, "riso-olive");
    const onPop = firstHexVar(root, "on-pop");
    const sunk = firstHexVar(root, "riso-paper-sunk");
    const code = firstHexVar(root, "code");
    expect(paper && ink && muted && primary && onPop && sunk && code).toBeTruthy();
    expect(contrastRatio(ink!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, sunk!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, code!)).toBeGreaterThanOrEqual(4.5);
    // Primary #6366F1 ≈ 4.35 on paper / white-on-primary ≈ 4.47 — clears
    // AA large-text/UI (3:1) by a wide margin; documented as large/UI/CTA
    // only (CLAUDE.md §4), so 3:1 is the correct floor here, not 4.5.
    expect(contrastRatio(primary!, paper!)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(onPop!, primary!)).toBeGreaterThanOrEqual(3);
  });

  it("dark mode defines layered surfaces and soft borders", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const dark = css.slice(css.indexOf(".dark"));
    expect(firstHexVar(dark, "riso-paper")).toBe("#0f1117");
    expect(firstHexVar(dark, "elevated")).toBe("#1a1e28");
    expect(firstHexVar(dark, "code")).toBe("#161b24");
    expect(firstHexVar(dark, "surface")).toBe("#13161e");
    expect(firstHexVar(dark, "riso-lime")).toBe("#6366f1");
    expect(dark).toMatch(
      /--riso-rule:\s*rgba\(\s*249\s*,\s*250\s*,\s*252\s*,\s*0\.08\s*\)/,
    );
  });

  it("Insight and Information roles are defined and AA-compliant", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const lightInsight = firstHexVar(root, "riso-insight");
    const darkInsight = firstHexVar(dark, "riso-insight");
    const lightPaper = firstHexVar(root, "riso-paper");
    const darkPaper = firstHexVar(dark, "riso-paper");

    expect(lightInsight).toBe("#854d0e");
    expect(darkInsight).toBe("#facc15");
    expect(contrastRatio(lightInsight!, lightPaper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkInsight!, darkPaper!)).toBeGreaterThanOrEqual(4.5);

    // --info aliases the existing (previously near-unused) --tone-sky token.
    expect(root).toMatch(/--info:\s*var\(--tone-sky\)/);
    expect(css).toMatch(/--color-insight:\s*var\(--insight\)/);
    expect(css).toMatch(/--color-info:\s*var\(--info\)/);
  });

  it("Callout: constraint is Success-toned, goal/rocket/note are Information, brain is Insight", () => {
    const body = readFileSync(
      join(SRC, "components", "md", "Callout.tsx"),
      "utf8",
    );
    expect(body).toMatch(/constraint:\s*"border-good\/30 bg-good-surface/);
    expect(body).toMatch(/goal:\s*"border-info\/30 bg-info-surface/);
    expect(body).toMatch(/rocket:\s*"border-info\/30 bg-info-surface/);
    expect(body).toMatch(/note:\s*"border-info\/30 bg-info-surface/);
    expect(body).toMatch(/brain:\s*"border-insight\/30 bg-insight-surface/);
    expect(body).not.toMatch(/border-l-mark/);
    expect(body).not.toMatch(/border-l-\d/); // full even border, not a left flag bar
    // tip = "Interview Tip" territory — Amber (teaching-caution), not Indigo.
    expect(body).toMatch(/tip:\s*"border-warn\/30 bg-warn-surface/);
    expect(body).not.toMatch(/tip:\s*"border-l-accent/);
    // Reference-matching label: bold, foreground, not muted uppercase mono.
    expect(body).toMatch(/font-bold/);
    expect(body).not.toMatch(/uppercase/);
  });

  it("Callout pastel surface tokens exist and are AA-compliant against their role ink", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const pairs: [role: string, ink: string][] = [
      ["info", "tone-sky"],
      ["good", "riso-green"],
      ["warn", "riso-amber"],
      ["insight", "riso-insight"],
    ];

    for (const [role, inkVar] of pairs) {
      const lightSurface = firstHexVar(root, `riso-${role}-surface`);
      const darkSurface = firstHexVar(dark, `riso-${role}-surface`);
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
});
