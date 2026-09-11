import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { CacheLayerFallthroughDiagram } from "@/components/md/diagrams/CacheLayerFallthroughDiagram";
import { CacheInvalidationScopeDiagram } from "@/components/md/diagrams/CacheInvalidationScopeDiagram";
import { DistributedCacheHandlerDiagram } from "@/components/md/diagrams/DistributedCacheHandlerDiagram";
import { QueryHydrationHandoffDiagram } from "@/components/md/diagrams/QueryHydrationHandoffDiagram";
import { ServerActionRpcDiagram } from "@/components/md/diagrams/ServerActionRpcDiagram";
import { advanceTable, area, contains, parseDiagram, type Box } from "./helpers/svgGeometry";

/**
 * Every diagram that sizes its viewBox from per-character advance estimates,
 * checked against the real glyph advances of the faces the site ships. The
 * CH_* constants are the layout's guess; this is the measurement that keeps
 * the guess honest when a face changes. PRINT_ADVANCES=1 prints each type
 * role's widest per-character advance — the floor for its CH_* constant.
 */
const DIAGRAMS: Array<[string, () => ReactElement]> = [
  ["CacheLayerFallthroughDiagram", () => <CacheLayerFallthroughDiagram />],
  ["CacheInvalidationScopeDiagram", () => <CacheInvalidationScopeDiagram />],
  ["DistributedCacheHandlerDiagram", () => <DistributedCacheHandlerDiagram />],
  ["QueryHydrationHandoffDiagram", () => <QueryHydrationHandoffDiagram />],
  ["ServerActionRpcDiagram", () => <ServerActionRpcDiagram />],
];

describe.each(DIAGRAMS)("%s label fit (real glyph advances)", (name, render) => {
  const { width, height, rects, texts } = parseDiagram(renderToStaticMarkup(render()));
  if (process.env.PRINT_ADVANCES) console.log(name, advanceTable(texts));

  it("keeps every label inside the viewBox", () => {
    const canvas: Box = { x0: 0, y0: 0, x1: width, y1: height, label: "canvas" };
    expect(texts.filter((t) => !contains(canvas, t, 0.5)).map((t) => t.label)).toEqual([]);
  });

  it("never lets a label overflow the box it sits in", () => {
    const clipped: string[] = [];
    for (const t of texts) {
      const cx = (t.x0 + t.x1) / 2;
      const cy = (t.y0 + t.y1) / 2;
      const owner = rects
        .filter((r) => cx >= r.x0 && cx <= r.x1 && cy >= r.y0 && cy <= r.y1)
        .sort((a, b) => area(a) - area(b))[0];
      if (!owner) continue; // captions / band headers sit on the canvas itself
      if (!contains(owner, t, 3)) clipped.push(`${t.label} overflows ${owner.label}`);
    }
    expect(clipped).toEqual([]);
  });
});
