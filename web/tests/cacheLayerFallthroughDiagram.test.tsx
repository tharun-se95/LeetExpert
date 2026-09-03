import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CacheLayerFallthroughDiagram } from "@/components/md/diagrams/CacheLayerFallthroughDiagram";

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  label: string;
}

/** Independent, deliberately conservative advance estimate (Inter averages
 *  ~0.52em; 0.60em over-estimates so a "fits" verdict is not self-fulfilling). */
const ADV = 0.55;

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function num(tag: string, name: string, fallback = 0): number {
  const v = attr(tag, name);
  return v === undefined ? fallback : Number(v);
}

function parse(markup: string) {
  const viewBox = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) throw new Error("no viewBox");
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);

  // Only the outer canvas's own shapes: strip nested <svg> icon viewports.
  const body = markup.replace(/<svg(?!\s+viewBox="0 0 \d)[\s\S]*?<\/svg>/g, "");

  const rects: Box[] = [];
  for (const tag of body.match(/<rect[^>]*>/g) ?? []) {
    if (attr(tag, "fill")?.includes("url(#")) continue; // texture overlay
    rects.push({
      x0: num(tag, "x"),
      y0: num(tag, "y"),
      x1: num(tag, "x") + num(tag, "width"),
      y1: num(tag, "y") + num(tag, "height"),
      label: `rect@${num(tag, "x")},${num(tag, "y")}`,
    });
  }

  const texts: Box[] = [];
  for (const m of body.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const tag = `<text${m[1]}>`;
    const content = m[2].replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
    const fs = num(tag, "font-size", 12);
    const w = content.length * fs * ADV;
    const anchor = attr(tag, "text-anchor") ?? "start";
    const x = num(tag, "x");
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    const y = num(tag, "y");
    texts.push({ x0, y0: y - fs, x1: x0 + w, y1: y + fs * 0.25, label: JSON.stringify(content) });
  }

  return { width, height, rects, texts };
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1;
const contains = (outer: Box, inner: Box, tol = 2) =>
  inner.x0 >= outer.x0 - tol && inner.x1 <= outer.x1 + tol && inner.y0 >= outer.y0 - tol && inner.y1 <= outer.y1 + tol;
const area = (b: Box) => (b.x1 - b.x0) * (b.y1 - b.y0);

describe("CacheLayerFallthroughDiagram geometry", () => {
  const { width, height, rects, texts } = parse(renderToStaticMarkup(<CacheLayerFallthroughDiagram />));

  it("keeps every shape and label inside the viewBox", () => {
    const canvas: Box = { x0: 0, y0: 0, x1: width, y1: height, label: "canvas" };
    const escaped = [...rects, ...texts].filter((b) => !contains(canvas, b, 0.5));
    expect(escaped.map((b) => b.label)).toEqual([]);
  });

  it("never lets a label overflow the box it sits in", () => {
    const clipped: string[] = [];
    for (const t of texts) {
      const cxp = (t.x0 + t.x1) / 2;
      const cyp = (t.y0 + t.y1) / 2;
      const owners = rects
        .filter((r) => cxp >= r.x0 && cxp <= r.x1 && cyp >= r.y0 && cyp <= r.y1)
        .sort((a, b) => area(a) - area(b));
      const owner = owners[0];
      if (!owner) continue; // captions / band headers sit on the canvas itself
      if (!contains(owner, t, 3)) clipped.push(`${t.label} overflows ${owner.label}`);
    }
    expect(clipped).toEqual([]);
  });

  it("keeps sibling pills and nodes from colliding", () => {
    // Zones legitimately contain other rects; only compare same-generation
    // boxes, i.e. pairs where neither contains the other.
    const hits: string[] = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        if (contains(a, b, 0) || contains(b, a, 0)) continue;
        if (overlaps(a, b)) hits.push(`${a.label} x ${b.label}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
