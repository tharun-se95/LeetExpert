import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { contrastRatio } from "./helpers/contrast";
import { renderToStaticMarkup } from "react-dom/server";
import { Lamp } from "@/components/brand/Lamp";
import { LAMP_BOOT_KEY, LAMP_BOOT_SCRIPT } from "@/components/brand/lampBoot";

/**
 * The brand lamp: one soft-glowing green dot is the whole logo, and the only
 * non-steel ink allowed in chrome.
 *
 * Spec: docs/superpowers/specs/2026-09-13-lamp-logo-design.md
 */

const WEB = join(__dirname, "..");
const SRC = join(WEB, "src");
const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
// Same slicing as design-tokens.test.ts: the first :root up to the first
// .dark is the light palette, the first .dark onward is dark. globals.css
// has later :root/.dark blocks too — the lamp tokens must live in the FIRST
// of each or every reader of this convention sees the wrong theme.
const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
const dark = css.slice(css.indexOf(".dark"));

function hexVar(block: string, name: string): string {
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\b`));
  if (!m?.[1]) throw new Error(`--${name} has no 6-digit hex in this block`);
  return m[1].toLowerCase();
}

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

describe("brand lamp tokens", () => {
  it("the lamp clears the 3:1 non-text floor on every surface, both themes", () => {
    // A logo is a meaningful graphic (WCAG 1.4.11), so the floor is 3:1, not
    // the 4.5:1 text floor — and it is checked against every surface token,
    // not just the header it happens to sit on today.
    const themes = [
      {
        theme: "light",
        lamp: hexVar(root, "press-lamp"),
        surfaces: {
          elevated: hexVar(root, "elevated"),
          paper: hexVar(root, "press-paper"),
          code: hexVar(root, "code"),
          sunk: hexVar(root, "press-paper-sunk"),
        },
      },
      {
        theme: "dark",
        lamp: hexVar(dark, "press-lamp"),
        surfaces: {
          elevated: hexVar(dark, "elevated"),
          paper: hexVar(dark, "press-paper"),
          code: hexVar(dark, "code"),
          surface: hexVar(dark, "surface"),
        },
      },
    ];
    for (const { theme, lamp, surfaces } of themes) {
      for (const [name, surface] of Object.entries(surfaces)) {
        const ratio = contrastRatio(lamp, surface);
        expect(
          ratio,
          `${theme} lamp ${lamp} on ${name} ${surface} is ${ratio.toFixed(2)}:1, needs >= 3:1`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("lamp colour is confined to the mark", () => {
    // The lamp is a deliberate exception to the monochrome base. Without a
    // guard, the next contributor who needs "a green" reaches for it and
    // brand colour leaks into buttons, focus rings and status.
    const LAMP_TOKEN = /--(?:press-)?lamp(?:-[a-z]+)?\b/;
    const LAMP_UTILITY =
      /\b(?:bg|text|fill|stroke|border|ring|outline|decoration|from|via|to|shadow|accent|caret)-lamp(?:-[a-z]+)?\b/;
    const OWNERS = new Set(["app/globals.css", "components/brand/Lamp.tsx"]);
    const leaks = walk(SRC)
      .map((path) => ({
        rel: relative(SRC, path).replace(/\\/g, "/"),
        body: readFileSync(path, "utf8"),
      }))
      .filter(
        (f) =>
          !OWNERS.has(f.rel) &&
          (LAMP_TOKEN.test(f.body) || LAMP_UTILITY.test(f.body)),
      )
      .map((f) => f.rel);
    expect(leaks).toEqual([]);
  });
});

describe("Lamp component", () => {
  it("draws the r=30 halo and r=15 core on the 64 grid, hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<Lamp size={26} />);
    expect(html).toMatch(/viewBox="0 0 64 64"/);
    expect(html).toMatch(/width="26"/);
    expect(html).toMatch(/height="26"/);
    // Decorative: the logo link's own text ("leetExpert") names it.
    expect(html).toMatch(/aria-hidden="true"/);
    expect(html).toMatch(/<circle class="lamp-halo"[^>]*\sr="30"/);
    expect(html).toMatch(/<circle class="lamp-core"[^>]*\sr="15"/);
  });

  it("paints only from tokens, never raw hex", () => {
    const html = renderToStaticMarkup(<Lamp size={26} />);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    expect(html).toContain("var(--lamp)");
    expect(html).toContain("var(--lamp-hi)");
    expect(html).toContain("var(--lamp-lo)");
    expect(html).toContain("var(--lamp-halo-a)");
  });

  it("gives every instance its own gradient ids, so the header and hero can share a page", () => {
    // Duplicate SVG ids resolve to the first definition in the document, so
    // a second lamp would silently paint with the first lamp's gradients.
    const html = renderToStaticMarkup(
      <>
        <Lamp size={26} bloom />
        <Lamp size={24} />
      </>,
    );
    const ids = [...html.matchAll(/<radialGradient id="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
    for (const id of ids) {
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(html).toContain(`url(#${id})`);
    }
  });

  it("only a bloom lamp opts into the animation", () => {
    expect(renderToStaticMarkup(<Lamp size={26} bloom />)).toMatch(/<svg[^>]*class="lamp lamp--bloom"/);
    expect(renderToStaticMarkup(<Lamp size={24} />)).toMatch(/<svg[^>]*class="lamp"/);
  });
});

describe("lamp motion CSS", () => {
  it("boots with the strike keyframes and replays on hover and focus with separately named ones", () => {
    // Re-applying the same animation-name does not restart an animation, so
    // replay must use different keyframe names than the first-paint bloom.
    expect(css).toMatch(/@keyframes lamp-core-strike \{/);
    expect(css).toMatch(/@keyframes lamp-halo-strike \{/);
    expect(css).toMatch(/@keyframes lamp-core-replay \{/);
    expect(css).toMatch(/@keyframes lamp-halo-replay \{/);
    expect(css).toMatch(/html\[data-lamp-boot\] \.lamp--bloom \.lamp-halo \{\s*animation: lamp-halo-strike 900ms/);
    expect(css).toMatch(
      /\.lamp-link:hover \.lamp--bloom \.lamp-halo,\s*\.lamp-link:focus-visible \.lamp--bloom \.lamp-halo \{\s*animation: lamp-halo-replay 900ms/,
    );
  });

  it("reduced motion removes the lamp's animation explicitly", () => {
    // Not left to the global clamp, which shortens animations to 0.01ms
    // rather than removing them.
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.lamp-core,\s*\.lamp-halo \{\s*animation: none !important;/,
    );
  });
});

describe("lamp boot script", () => {
  type BootStorage = Pick<Storage, "getItem" | "setItem">;

  function memoryStorage(): BootStorage {
    const map = new Map<string, string>();
    return {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => {
        map.set(key, value);
      },
    };
  }

  /** Runs the real script string against a fake document and storage. */
  function boot(storage: BootStorage): Record<string, string> {
    const dataset: Record<string, string> = {};
    const run = new Function("document", "sessionStorage", LAMP_BOOT_SCRIPT);
    run({ documentElement: { dataset } }, storage);
    return dataset;
  }

  it("blooms on the first page of a tab and not on later loads in that tab", () => {
    const tab = memoryStorage();
    expect("lampBoot" in boot(tab)).toBe(true);
    expect(tab.getItem(LAMP_BOOT_KEY)).toBe("1");
    expect("lampBoot" in boot(tab)).toBe(false);
  });

  it("blooms again in a new tab, because sessionStorage is per tab", () => {
    boot(memoryStorage());
    expect("lampBoot" in boot(memoryStorage())).toBe(true);
  });

  it("leaves the mark lit, never stuck dark, when storage throws", () => {
    const denied: BootStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(() => boot(denied)).not.toThrow();
    expect("lampBoot" in boot(denied)).toBe(false);
  });

  it("does not bloom when the tab can't remember it bloomed", () => {
    // setItem failing (quota, privacy mode) would otherwise replay the bloom
    // on every page load, which is exactly what once-per-tab rules out.
    const readOnly: BootStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect("lampBoot" in boot(readOnly)).toBe(false);
  });

  it("runs in <body> before the app shell, so the header's first frame is already dark", () => {
    const layout = readFileSync(join(SRC, "app", "layout.tsx"), "utf8");
    const script = layout.indexOf("__html: LAMP_BOOT_SCRIPT");
    expect(script).toBeGreaterThan(layout.indexOf("<body"));
    expect(script).toBeLessThan(layout.indexOf("<AppShell>"));
  });
});

describe("the lamp replaces the </> badge", () => {
  const header = readFileSync(join(SRC, "components", "layout", "Header.tsx"), "utf8");
  const home = readFileSync(join(SRC, "components", "landing", "HomePage.tsx"), "utf8");

  it("the header draws a blooming lamp inside the replay link", () => {
    expect(header).toContain("<Lamp size={26} bloom />");
    expect(header).toMatch(/<Link href="\/" className="lamp-link /);
    expect(header).not.toContain('{"</>"}');
  });

  it("the landing hero draws a static lamp", () => {
    expect(home).toContain("<Lamp size={24} />");
    expect(home).not.toContain('{"</>"}');
  });
});
