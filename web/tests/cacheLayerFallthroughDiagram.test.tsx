import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CacheLayerFallthroughDiagram } from "@/components/md/diagrams/CacheLayerFallthroughDiagram";
import { contains, overlaps, parseDiagram } from "./helpers/svgGeometry";

// Label fit (viewBox + owning box) is measured with real glyph advances for
// all five width-estimating diagrams in diagramTextFit.test.tsx.
describe("CacheLayerFallthroughDiagram geometry", () => {
  const { rects } = parseDiagram(renderToStaticMarkup(<CacheLayerFallthroughDiagram />));

  it("keeps sibling pills and nodes from colliding", () => {
    // Zones legitimately contain other rects; only compare same-generation
    // boxes, i.e. pairs where neither contains the other.
    const hits: string[] = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        if (!a || !b) continue;
        if (contains(a, b, 0) || contains(b, a, 0)) continue;
        if (overlaps(a, b)) hits.push(`${a.label} x ${b.label}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
