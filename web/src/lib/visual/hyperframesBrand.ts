import { HUE_NAMES, contrastRatio } from "./palette";
import type { FamilyTheme } from "./familyTheme";

/**
 * The colour tokens HyperFrames compositions draw with, derived from the app
 * so a video can never drift from the site again (an old hand-kept copy kept
 * its own ground and raw family accents after the app's tokens moved on). `hyperframes/assets/brand.css` holds hand-written component
 * rules around one generated block; `tests/hyperframesBrand.test.ts` fails
 * when the block differs from what this module produces, and rewrites it when
 * run with UPDATE_HYPERFRAMES_BRAND=1.
 *
 * Values are emitted as literals, not `var()` chains: the renderer has no
 * globals.css, and a video must keep its colours if the app renames a token.
 */

export const BRAND_BEGIN =
  "/* BEGIN GENERATED tokens: web/src/lib/visual/hyperframesBrand.ts (do not edit) */";
export const BRAND_END = "/* END GENERATED tokens */";

type Tokens = Record<string, string>;

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Body of the first `selector {` block, brace-matched so a nested rule cannot end it early. */
export function blockBody(css: string, selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  if (at === -1) throw new Error(`globals.css has no "${selector} {" block`);
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unterminated "${selector} {" block`);
}

function declarations(body: string): Tokens {
  const out: Tokens = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim().replace(/\s+/g, " ");
  return out;
}

function resolve(all: Tokens, name: string, depth = 0): string {
  if (depth > 8) throw new Error(`var() chain too deep at ${name}`);
  const raw = all[name];
  if (raw === undefined) throw new Error(`globals.css does not define ${name}`);
  return raw.replace(/var\((--[\w-]+)\)/g, (_, ref: string) => resolve(all, ref, depth + 1));
}

/** Every token of one theme, resolved. The dark theme inherits whatever `.dark` does not override. */
export function themeTokens(globalsCss: string, theme: "light" | "dark"): Tokens {
  const css = stripComments(globalsCss);
  const light = declarations(blockBody(css, ":root"));
  const all = theme === "light" ? light : { ...light, ...declarations(blockBody(css, ".dark")) };
  return Object.fromEntries(Object.keys(all).map((k) => [k, resolve(all, k)]));
}

/** HyperFrames name -> the app token it is read from. */
const MAP: [string, string][] = [
  ["--ground", "--background"],
  ["--panel", "--elevated"],
  ["--code", "--code"],
  ["--surface", "--surface"],
  ["--ink", "--foreground"],
  ["--line", "--muted"],
  ["--dim", "--muted"],
  ["--rule", "--border"],
  ["--rule-strong", "--rule-strong"],
  ["--dot", "--border"],
  ["--muted-fill", "--code"],
  ["--on-ink", "--background"],
  ["--mark", "--mark"],
  ["--accent", "--accent"],
  ["--good", "--good"],
  ["--bad", "--bad"],
  ["--warn", "--warn"],
  ["--insight", "--insight"],
  ["--info", "--info"],
];

const lower = (s: string) => s.toLowerCase();

function themeBlock(selector: string, t: Tokens): string {
  const lines = MAP.map(([hf, app]) => `  ${hf}: ${lower(t[app])}; /* ${app} */`);
  for (const hue of HUE_NAMES) {
    for (const part of ["1", "2", "3", "4", "ink", "line"]) {
      const name = `--hue-${hue}-${part}`;
      lines.push(`  ${name}: ${lower(t[name])};`);
    }
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function ratio(t: Tokens, fg: string, bg: string): string {
  return contrastRatio(t[fg], t[bg]).toFixed(2);
}

export function buildTokenBlock(globalsCss: string, families: FamilyTheme[]): string {
  const dark = themeTokens(globalsCss, "dark");
  const light = themeTokens(globalsCss, "light");

  const measured = (label: string, t: Tokens, themeName: "light" | "dark") => {
    const uiFloor = Math.min(
      ...families.flatMap((f) =>
        ["--background", "--elevated", "--code", "--surface"].map((s) => contrastRatio(f[themeName].accentUi, t[s])),
      ),
    );
    return (
      `   ${label} ink/ground ${ratio(t, "--foreground", "--background")} · ` +
      `muted/ground ${ratio(t, "--muted", "--background")} · muted/panel ${ratio(t, "--muted", "--elevated")} · ` +
      `muted/code ${ratio(t, "--muted", "--code")} · family accents on every ${themeName} surface >= ${uiFloor.toFixed(2)}`
    );
  };

  // Each theme has its own family colours now (familyTheme.ts): dark is the
  // Grid hue, light its derived variant. Videos render dark by default.
  const familyBlock = (selector: (id: string) => string, theme: "light" | "dark") =>
    families
      .map((f) => {
        const ink = f[theme];
        return (
          `${selector(f.id)} {\n  --accent: ${lower(ink.accentUi)}; /* accentUi: 3:1 on every ${theme} surface */\n` +
          `  --family-accent: ${lower(ink.accent)};\n  --on-accent: ${lower(ink.onAccentUi)};\n}`
        );
      })
      .join("\n");
  const family = [
    familyBlock((id) => `[data-family="${id}"]`, "dark"),
    familyBlock((id) => `[data-theme="light"] [data-family="${id}"],\n[data-theme="light"][data-family="${id}"]`, "light"),
  ].join("\n");

  return [
    BRAND_BEGIN,
    "/* Read from web/src/app/globals.css and web/src/lib/visual/familyTheme.ts.",
    "   Chrome is steel in light and the Grid's blue in dark; a family colour is scoped to",
    "   content with data-family, never used for chrome. Body-size accent text uses --mark.",
    "   Measured WCAG contrast:",
    measured("dark ", dark, "dark"),
    measured("light", light, "light") + " */",
    "",
    themeBlock(":root,\n[data-theme=\"dark\"]", dark),
    "",
    themeBlock("[data-theme=\"light\"]", light),
    "",
    family,
    BRAND_END,
  ].join("\n");
}

/** Replace the generated block of a brand.css. */
export function applyTokenBlock(brandCss: string, block: string): string {
  const a = brandCss.indexOf(BRAND_BEGIN);
  const b = brandCss.indexOf(BRAND_END);
  if (a === -1 || b === -1 || b < a) throw new Error("brand.css is missing its generated-tokens markers");
  return brandCss.slice(0, a) + block + brandCss.slice(b + BRAND_END.length);
}
