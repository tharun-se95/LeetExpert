import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { contrastRatio } from "./helpers/contrast";
import { renderToStaticMarkup } from "react-dom/server";
import { Lamp } from "@/components/brand/Lamp";
import { LAMP_BOOT_KEY, LAMP_BOOT_SCRIPT } from "@/components/brand/lampBoot";
import sharp from "sharp";

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

  it("gives every instance its own gradient ids, so two lamps can share a page", () => {
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

describe("the lamp ends the wordmark in both headers", () => {
  // Owner, 2026-09-14: the green signal sits at the end of the name,
  // "leetExpert ●". On / AppShell renders LandingHeader instead of Header,
  // so each page has exactly one header and therefore one blooming lamp.
  const headers = {
    app: readFileSync(join(SRC, "components", "layout", "Header.tsx"), "utf8"),
    landing: readFileSync(join(SRC, "components", "landing", "LandingHeader.tsx"), "utf8"),
  };

  it.each(Object.entries(headers))(
    "%s header: a blooming lamp after the wordmark, inside the replay link",
    (_name, src) => {
      const home = src.match(/<Link\s+href="\/"\s+className="([^"]*)"\s*>([\s\S]*?)<\/Link>/);
      expect(home, "home link").not.toBeNull();
      const [, linkClass, body] = home!;
      expect(linkClass.split(/\s+/)).toContain("lamp-link");
      // Attributes may wrap onto their own lines, as JSX formatting does.
      expect(body).toMatch(/<Lamp\s+size=\{LOGO_LAMP_SIZE\}\s+bloom\b/);
      const wordmark = body.indexOf("WORDMARK");
      expect(wordmark, "wordmark in the home link").toBeGreaterThan(-1);
      expect(body.indexOf("<Lamp"), "lamp comes after the wordmark").toBeGreaterThan(wordmark);
    },
  );

  it("the landing footer ends its wordmark with a static lamp, because the header already blooms on /", () => {
    const footer = readFileSync(join(SRC, "components", "landing", "LandingFooter.tsx"), "utf8");
    const home = footer.match(/<Link\s+href="\/"[^>]*>([\s\S]*?)<\/Link>/);
    expect(home, "footer home link").not.toBeNull();
    const lamp = home![1].match(/<Lamp\b[^>]*\/>/)?.[0];
    expect(lamp, "lamp in the footer home link").toBeDefined();
    expect(lamp).toMatch(/size=\{LOGO_LAMP_SIZE\}/);
    expect(lamp, "only the header blooms").not.toMatch(/\bbloom\b/);
    expect(home![1].indexOf("<Lamp")).toBeGreaterThan(home![1].indexOf("Expert"));
  });

  it("leaves no </> badge anywhere in the app", () => {
    const badges = walk(SRC)
      .filter((path) => readFileSync(path, "utf8").includes('{"</>"}'))
      .map((path) => relative(SRC, path).replace(/\\/g, "/"));
    expect(badges).toEqual([]);
  });
});

describe("brand assets mirror the lamp tokens", () => {
  const BRAND = join(SRC, "assets", "brand");
  const svg = (name: string) => readFileSync(join(BRAND, name), "utf8");
  const hexes = (text: string) =>
    new Set([...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase()));

  const light = {
    lamp: hexVar(root, "press-lamp"),
    hi: hexVar(root, "press-lamp-hi"),
    lo: hexVar(root, "press-lamp-lo"),
  };
  const darkLamp = {
    lamp: hexVar(dark, "press-lamp"),
    hi: hexVar(dark, "press-lamp-hi"),
    lo: hexVar(dark, "press-lamp-lo"),
  };

  it("src/app/icon.svg is byte-identical to mark.svg", () => {
    // Next's icon.svg convention needs its own file under src/app/;
    // generate-icons.mjs copies it, and this catches a hand edit to either.
    const icon = readFileSync(join(SRC, "app", "icon.svg"));
    expect(icon.equals(readFileSync(join(BRAND, "mark.svg")))).toBe(true);
  });

  it("mark.svg carries exactly the light and dark lamp colours", () => {
    expect(hexes(svg("mark.svg"))).toEqual(
      new Set([light.lamp, light.hi, light.lo, darkLamp.lamp, darkLamp.hi, darkLamp.lo]),
    );
  });

  it("mark-raster.svg is the dark lamp with the light edge as its rim", () => {
    expect(hexes(svg("mark-raster.svg"))).toEqual(
      new Set([darkLamp.lamp, darkLamp.hi, darkLamp.lo, light.lo]),
    );
  });

  it("both tiles are the dark lamp on dark paper", () => {
    const tile = new Set([darkLamp.lamp, darkLamp.hi, darkLamp.lo, hexVar(dark, "press-paper")]);
    expect(hexes(svg("mark-tile.svg"))).toEqual(tile);
    expect(hexes(svg("mark-tile-rounded.svg"))).toEqual(tile);
  });

  it.each([
    "public/favicon-32x32.png",
    "src/app/apple-icon.png",
    "public/android-chrome-192x192.png",
  ])("%s was regenerated from the lamp", async (rel) => {
    // Catches an SVG edited without rerunning generate-icons.mjs, which would
    // keep shipping the old steel icons.
    const { data, info } = await sharp(join(WEB, rel))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const i =
      (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * info.channels;
    const [r, g, b, a] = [data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!];
    expect(a, `${rel} centre alpha`).toBeGreaterThan(200);
    expect(
      g - Math.max(r, b),
      `${rel} centre is rgb(${r}, ${g}, ${b}); rerun node scripts/generate-icons.mjs`,
    ).toBeGreaterThan(40);
  });
});

describe("OG card", () => {
  it("draws the dark lamp in token colours, with the old plate gone", () => {
    // Satori has no CSS custom properties, so the card carries hex — this
    // keeps it in step with the tokens.
    const og = readFileSync(join(SRC, "lib", "seo", "ogImage.tsx"), "utf8").toLowerCase();
    for (const name of ["press-lamp", "press-lamp-hi", "press-lamp-lo"]) {
      expect(og, `ogImage.tsx is missing --${name} (dark)`).toContain(hexVar(dark, name));
    }
    expect(og).toContain('r="15"');
    expect(og).not.toContain("m22 16 l12 32 l22 48");
  });
});
