import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { GRAIN, grainPixels } from "../scripts/make-grain.mjs";

const web = join(__dirname, "..");
const png = readFileSync(join(web, "public", "textures", "grain.png"));
const globals = readFileSync(join(web, "src", "app", "globals.css"), "utf8");

/** IHDR fields and the inflated IDAT stream of a non-interlaced PNG. */
function decode(buf: Buffer) {
  expect(buf.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  let at = 8;
  let ihdr: Buffer | null = null;
  const idat: Buffer[] = [];
  while (at < buf.length) {
    const len = buf.readUInt32BE(at);
    const type = buf.toString("ascii", at + 4, at + 8);
    const data = buf.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") ihdr = data;
    if (type === "IDAT") idat.push(data);
    at += 12 + len;
  }
  expect(ihdr, "IHDR chunk").not.toBeNull();
  return {
    width: ihdr!.readUInt32BE(0),
    height: ihdr!.readUInt32BE(4),
    bitDepth: ihdr![8],
    colourType: ihdr![9],
    raw: inflateSync(Buffer.concat(idat)),
  };
}

describe("paper grain asset", () => {
  it("is the seeded noise scripts/make-grain.mjs generates", () => {
    // Pixels, not file bytes: compressed bytes depend on Node's bundled zlib.
    const { width, height, bitDepth, colourType, raw } = decode(png);
    expect([width, height, bitDepth, colourType]).toEqual([GRAIN.size, GRAIN.size, 8, 0]);

    const rowLen = GRAIN.size + 1;
    expect(raw.length).toBe(rowLen * GRAIN.size);
    const pixels = new Uint8Array(GRAIN.size * GRAIN.size);
    for (let y = 0; y < GRAIN.size; y++) {
      // Filter 0 (None) on every row, so the bytes after it ARE the pixels.
      expect(raw[y * rowLen], `row ${y} filter byte`).toBe(0);
      pixels.set(raw.subarray(y * rowLen + 1, (y + 1) * rowLen), y * GRAIN.size);
    }
    expect(Buffer.from(pixels).equals(Buffer.from(grainPixels(GRAIN.size, GRAIN.levels, GRAIN.seed)))).toBe(true);
  });

  it("draws the tile at half its pixel size, so 2x displays get one sample per device pixel", () => {
    const rule = globals.match(/\.paper-grain::before\s*\{([^}]*)\}/)?.[1];
    expect(rule, ".paper-grain::before rule").toBeDefined();
    expect(rule).toContain(`url("/textures/grain.png")`);
    expect(rule).toContain(`${GRAIN.size / 2}px ${GRAIN.size / 2}px`);
    expect(rule).toMatch(/opacity:\s*var\(--grain-opacity\)/);
  });

  it("defines the grain strength as a token in both themes", () => {
    const split = globals.indexOf("\n.dark {");
    expect(split).toBeGreaterThan(0);
    expect(globals.slice(0, split)).toMatch(/--grain-opacity:\s*[\d.]+;/);
    const dark = globals.slice(split, globals.indexOf("\n}", split));
    expect(dark).toMatch(/--grain-opacity:\s*[\d.]+;/);
  });
});

describe("grain on opaque surfaces", () => {
  /**
   * A rule body by its exact selector at the start of a line. Skips a match
   * that ends a selector list (".a,\n.b {"): the veil rule lists both fillet
   * pseudo-elements and would otherwise stand in for their own rules.
   */
  const body = (selector: string) => {
    let at = globals.indexOf(`\n${selector} {`);
    while (at > 0 && globals[at - 1] === ",") at = globals.indexOf(`\n${selector} {`, at + 1);
    expect(at, `missing rule: ${selector}`).toBeGreaterThan(0);
    return globals.slice(at, globals.indexOf("\n}", at));
  };

  it("veils the paper over the tile, so it composites like .paper-grain's opacity", () => {
    const paint = body(".grain-paper");
    expect(paint).toMatch(
      /--grain-veil:\s*color-mix\(\s*in srgb,\s*var\(--grain-paper, var\(--background\)\) calc\(\(1 - var\(--grain-opacity\)\) \* 100%\),\s*transparent\s*\)/,
    );
    expect(paint).toContain("linear-gradient(var(--grain-veil), var(--grain-veil))");
    expect(paint).toContain(`url("/textures/grain.png")`);
    expect(paint).toContain(`${GRAIN.size / 2}px ${GRAIN.size / 2}px`);
    // Backgrounds paint under the border, but a no-repeat veil sized to the
    // padding box stops at its edge: the 1px border strip showed the bare
    // tile through the translucent --border, a speckled line at 4x.
    expect(paint).toMatch(/background-origin:\s*border-box;/);
  });

  it("prints without grain", () => {
    expect(globals).toMatch(/@media print\s*\{\s*\.grain-paper\s*\{\s*background-image:\s*none;/);
  });
});

describe("where the grain goes", () => {
  const src = join(web, "src");
  const files: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".tsx")) files[p.slice(src.length + 1)] = readFileSync(p, "utf8");
    }
  };
  walk(src);
  const count = (text: string, cls: string) =>
    (text.match(new RegExp(`["\\s]${cls}\\b`, "g")) ?? []).length;

  it("paints opaque surfaces with .grain-paper, and only these", () => {
    // Each of these paints its own opaque paper, so its grain covers any
    // beneath it instead of adding to it.
    const uses = Object.fromEntries(
      Object.entries(files)
        .map(([file, text]) => [file, count(text, "grain-paper")] as const)
        .filter(([, n]) => n > 0),
    );
    expect(uses).toEqual({
      "components/layout/Header.tsx": 1,
      "components/layout/Sidebar.tsx": 1,
      "components/layout/CourseNavPanel.tsx": 1,
      "components/layout/FloatingLessonsButton.tsx": 1,
      "components/layout/MobileLessonsSheet.tsx": 1,
    });
  });

  it("tells the drawer rail its paper is the rail's", () => {
    expect(files["components/layout/Sidebar.tsx"]).toContain("[--grain-paper:var(--rail-surface)]");
  });

  it("paints the drawer in the header's paper", () => {
    expect(globals).toMatch(/\.sidebar-rail\s*\{\s*--rail-surface:\s*var\(--background\);/);
  });

  it("lets the desk show through the problem page's root and sub-header", () => {
    const workspace = files["components/problems/ProblemWorkspace.tsx"];
    expect(workspace).not.toMatch(/overflow-hidden bg-background/);
    expect(workspace.match(/<header className="([^"]*)"/)![1]).not.toMatch(/\bbg-/);
  });

  it("puts the mobile lessons sheet on grainy page paper", () => {
    expect(files["components/layout/MobileLessonsSheet.tsx"]).toMatch(
      /className="absolute inset-0 flex flex-col bg-background grain-paper /,
    );
  });
});
