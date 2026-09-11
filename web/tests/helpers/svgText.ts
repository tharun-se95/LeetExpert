import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as fontkit from "fontkit";

export type Face = "sans" | "mono";

export interface RunStyle {
  face: Face;
  size: number;
  weight: number;
  letterSpacing: number;
}

export interface Run {
  text: string;
  style: RunStyle;
}

/**
 * Advance widths come from the static instances of the faces the site ships
 * (@fontsource mirrors Google Fonts), so a "label fits" verdict is measured
 * against real glyphs — not an average-width guess that silently goes stale
 * when a face changes, which is exactly what the Inter → Space Grotesk swap
 * would have done.
 */
const FONT_DIR = join(__dirname, "..", "..", "node_modules", "@fontsource");
const FAMILY: Record<Face, string> = {
  sans: "space-grotesk",
  mono: "jetbrains-mono",
};
const cache = new Map<string, fontkit.Font>();

function fontFor(face: Face, weight: number): fontkit.Font {
  const family = FAMILY[face];
  const file = join(FONT_DIR, family, "files", `${family}-latin-${weight}-normal.woff2`);
  const hit = cache.get(file);
  if (hit) return hit;
  // readFileSync throws on a weight the package lacks: measuring a
  // neighbouring weight instead would pass labels that clip in production.
  const opened = fontkit.create(readFileSync(file));
  if (!("layout" in opened)) throw new Error(`${file} is a font collection`);
  cache.set(file, opened);
  return opened;
}

const ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&#x27;": "'",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
};

const decode = (s: string) =>
  s.replace(/<[^>]*>/g, "").replace(/&(?:quot|#x27|amp|lt|gt);/g, (e) => ENTITIES[e] ?? e);

function styleOf(tag: string, inherited?: RunStyle): RunStyle {
  const get = (name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  const family = get("font-family");
  return {
    face: family ? (/mono/.test(family) ? "mono" : "sans") : (inherited?.face ?? "sans"),
    size: Number(get("font-size") ?? inherited?.size ?? 12),
    weight: Number(get("font-weight") ?? inherited?.weight ?? 400),
    letterSpacing: Number(get("letter-spacing") ?? inherited?.letterSpacing ?? 0),
  };
}

/** Split a <text> element into styled runs, honouring <tspan> overrides. */
export function textRuns(openTag: string, inner: string): Run[] {
  const base = styleOf(openTag);
  const runs: Run[] = [];
  let last = 0;
  for (const m of inner.matchAll(/<tspan([^>]*)>([\s\S]*?)<\/tspan>/g)) {
    const index = m.index ?? 0;
    runs.push({ text: decode(inner.slice(last, index)), style: base });
    runs.push({ text: decode(m[2] ?? ""), style: styleOf(`<tspan${m[1] ?? ""}>`, base) });
    last = index + m[0].length;
  }
  runs.push({ text: decode(inner.slice(last)), style: base });
  return runs.filter((r) => r.text.length > 0);
}

export function runWidth(run: Run): number {
  const font = fontFor(run.style.face, run.style.weight);
  const glyphs = font.layout(run.text);
  return (
    (glyphs.advanceWidth / font.unitsPerEm) * run.style.size +
    run.style.letterSpacing * run.text.length
  );
}
