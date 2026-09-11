import { runWidth, textRuns, type Run } from "./svgText";

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  label: string;
}

export interface MeasuredText extends Box {
  runs: Run[];
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function num(tag: string, name: string, fallback = 0): number {
  const v = attr(tag, name);
  return v === undefined ? fallback : Number(v);
}

export function parseDiagram(markup: string) {
  const viewBox = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) throw new Error("no viewBox");
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);

  // Only the outer canvas's own shapes: strip nested <svg> icon viewports.
  const body = markup.replace(/<svg(?!\s+viewBox="0 0 \d)[\s\S]*?<\/svg>/g, "");

  const rects: Box[] = [];
  const texts: MeasuredText[] = [];
  // Walk tags in document order so every shape picks up the translate() of
  // each <g> it sits inside: BrowserMockup places its children that way, and
  // reading them as absolute coordinates pinned captions to unrelated nodes.
  const offsets: Array<[number, number]> = [[0, 0]];
  const TOKEN = /<g\b[^>]*>|<\/g>|<rect\b[^>]*>|<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  for (const m of body.matchAll(TOKEN)) {
    const token = m[0];
    const [dx, dy] = offsets[offsets.length - 1] ?? [0, 0];
    if (token === "</g>") {
      if (offsets.length > 1) offsets.pop();
      continue;
    }
    if (token.startsWith("<g")) {
      const [tx, ty] = translation(token);
      if (!token.endsWith("/>")) offsets.push([dx + tx, dy + ty]);
      continue;
    }
    if (token.startsWith("<rect")) {
      if (attr(token, "fill")?.includes("url(#")) continue; // texture overlay
      const [tx, ty] = translation(token);
      const x = dx + tx + num(token, "x");
      const y = dy + ty + num(token, "y");
      rects.push({
        x0: x,
        y0: y,
        x1: x + num(token, "width"),
        y1: y + num(token, "height"),
        label: `rect@${x},${y}`,
      });
      continue;
    }
    const tag = `<text${m[1] ?? ""}>`;
    const runs = textRuns(tag, m[2] ?? "");
    const w = runs.reduce((sum, r) => sum + runWidth(r), 0);
    const fs = num(tag, "font-size", 12);
    const anchor = attr(tag, "text-anchor") ?? "start";
    const [tx, ty] = translation(tag);
    const x = dx + tx + num(tag, "x");
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    const y = dy + ty + num(tag, "y");
    texts.push({
      x0,
      y0: y - fs,
      x1: x0 + w,
      y1: y + fs * 0.25,
      label: JSON.stringify(runs.map((r) => r.text).join("")),
      runs,
    });
  }

  return { width, height, rects, texts };
}

/**
 * The offset a `transform` attribute applies. Only translate() can be placed
 * without a full matrix model; anything else throws, because silently
 * treating a scaled or rotated label as unmoved would let a clip pass.
 */
function translation(tag: string): [number, number] {
  const t = attr(tag, "transform");
  if (t === undefined) return [0, 0];
  const m = t.match(/^\s*translate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?\s*\)\s*$/);
  if (!m) throw new Error(`unsupported transform "${t}" — parseDiagram only places translate()`);
  return [Number(m[1]), Number(m[2] ?? 0)];
}

export const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1;

export const contains = (outer: Box, inner: Box, tol = 2) =>
  inner.x0 >= outer.x0 - tol &&
  inner.x1 <= outer.x1 + tol &&
  inner.y0 >= outer.y0 - tol &&
  inner.y1 <= outer.y1 + tol;

export const area = (b: Box) => (b.x1 - b.x0) * (b.y1 - b.y0);

/**
 * Widest measured per-character advance per type role, rounded up to 0.05 —
 * the minimum a diagram's `chars × CH_*` estimate must use for that role.
 * Runs under 4 characters are skipped: a lone glyph's advance is not a
 * per-character average and would inflate the role.
 */
export function advanceTable(texts: MeasuredText[]): Record<string, number> {
  const table: Record<string, number> = {};
  for (const t of texts) {
    for (const r of t.runs) {
      if (r.text.length < 4) continue;
      const s = r.style;
      const key = `${s.face} ${s.size}px w${s.weight}${s.letterSpacing ? ` ls${s.letterSpacing}` : ""}`;
      table[key] = Math.max(table[key] ?? 0, runWidth(r) / r.text.length);
    }
  }
  for (const key of Object.keys(table)) {
    table[key] = Math.ceil((table[key] ?? 0) * 20) / 20;
  }
  return table;
}
