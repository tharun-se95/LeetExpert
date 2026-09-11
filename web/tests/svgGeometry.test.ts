import { describe, expect, it } from "vitest";
import { parseDiagram } from "./helpers/svgGeometry";

/**
 * The geometry parser is itself a CI gate for diagram label fit, so its
 * coordinate handling is pinned here. BrowserMockup positions its children
 * with `<g transform="translate(…)">`; reading those children as absolute
 * coordinates assigned mockup captions to an unrelated node and reported a
 * clip that does not exist.
 */
describe("parseDiagram coordinates", () => {
  it("applies nested translate() offsets to rects and texts", () => {
    const { rects, texts } = parseDiagram(
      `<svg viewBox="0 0 400 300">` +
        `<g transform="translate(100, 50)">` +
        `<rect x="10" y="20" width="30" height="40"/>` +
        `<g transform="translate(5 7)"><text x="1" y="30" font-size="10">abcd</text></g>` +
        `</g>` +
        `<rect x="10" y="20" width="30" height="40"/>` +
        `</svg>`,
    );
    expect(rects.map((r) => [r.x0, r.y0, r.x1, r.y1])).toEqual([
      [110, 70, 140, 110],
      [10, 20, 40, 60],
    ]);
    expect(texts[0]?.x0).toBe(106);
    expect(texts[0]?.y0).toBe(77);
  });

  it("refuses transforms it cannot place rather than mismeasuring them", () => {
    expect(() =>
      parseDiagram(
        `<svg viewBox="0 0 10 10"><g transform="scale(2)"><rect x="1" y="1" width="1" height="1"/></g></svg>`,
      ),
    ).toThrow(/unsupported transform/);
  });
});
