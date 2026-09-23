import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FAMILY_THEMES } from "../src/lib/visual/familyTheme";
import { contrastRatio } from "../src/lib/visual/palette";
import { BRAND_BEGIN, BRAND_END, applyTokenBlock, buildTokenBlock, themeTokens } from "../src/lib/visual/hyperframesBrand";

const REPO = join(__dirname, "..", "..");
const GLOBALS = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
const BRAND_PATH = join(REPO, "hyperframes", "assets", "brand.css");
const BRAND = readFileSync(BRAND_PATH, "utf8");

describe("hyperframes brand tokens follow the app", () => {
  it("the generated block in brand.css equals what globals.css and familyTheme.ts produce", () => {
    const expected = applyTokenBlock(BRAND, buildTokenBlock(GLOBALS, FAMILY_THEMES));
    if (process.env.UPDATE_HYPERFRAMES_BRAND === "1" && expected !== BRAND) writeFileSync(BRAND_PATH, expected);
    else expect(BRAND, "run: UPDATE_HYPERFRAMES_BRAND=1 npx vitest run tests/hyperframesBrand.test.ts").toBe(expected);
  });

  it("carries every family with its accentUi, raw accent and ink", () => {
    for (const f of FAMILY_THEMES) {
      const block = BRAND.match(new RegExp(`\\[data-family="${f.id}"\\] \\{([^}]*)\\}`))?.[1] ?? "";
      expect(block, f.id).toContain(`--accent: ${f.accentUi.toLowerCase()}`);
      expect(block, f.id).toContain(`--family-accent: ${f.accent.toLowerCase()}`);
      expect(block, f.id).toContain(`--on-accent: ${f.onAccentUi.toLowerCase()}`);
    }
  });

  it("keeps the text pairs videos rely on at AA in both themes, and family accents at 3:1", () => {
    for (const theme of ["light", "dark"] as const) {
      const t = themeTokens(GLOBALS, theme);
      for (const surface of ["--background", "--elevated", "--code"]) {
        expect(contrastRatio(t["--foreground"], t[surface]), `${theme} ink on ${surface}`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(t["--muted"], t[surface]), `${theme} muted on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
      for (const f of FAMILY_THEMES) {
        for (const surface of ["--background", "--elevated", "--code", "--surface"]) {
          expect(contrastRatio(f.accentUi, t[surface]), `${theme} ${f.id} on ${surface}`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it("no composition or stylesheet paints with a literal colour outside the generated block", () => {
    const hfRoot = join(REPO, "hyperframes");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        // Each project's assets/ is a symlink to the shared one: scanning it again would count every file per project.
        if (e.isSymbolicLink() || ["node_modules", "renders", "snapshots", "media", "audio", "narration", "__pycache__", "_backups"].includes(e.name)) continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(html|css)$/.test(e.name)) files.push(p);
      }
    };
    walk(join(hfRoot, "assets"));
    walk(join(hfRoot, "primitives"));
    walk(join(hfRoot, "videos"));
    expect(files.length).toBeGreaterThan(10);
    const offenders: string[] = [];
    for (const p of files) {
      if (p.includes(`${join("assets", "fonts")}`) || p.includes("vendor")) continue;
      let css = readFileSync(p, "utf8");
      const a = css.indexOf(BRAND_BEGIN), b = css.indexOf(BRAND_END);
      if (a !== -1 && b !== -1) css = css.slice(0, a) + css.slice(b);
      // Only stylesheets paint: a composition's <style> blocks, not its script (which builds rgb() from the tokens)
      // or its variables JSON. Comments may quote a hex when they explain a decision.
      if (p.endsWith(".html")) css = [...css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
      css = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/unicode-range:[^;]*;/g, "");
      const hits = css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g);
      if (hits) offenders.push(`${p.replace(hfRoot + "/", "")}: ${[...new Set(hits)].join(" ")}`);
    }
    expect(offenders, "colour goes through the brand tokens").toEqual([]);
  });

  it("the hyperframes tree exists where this test looks for it", () => {
    expect(existsSync(BRAND_PATH)).toBe(true);
  });
});
