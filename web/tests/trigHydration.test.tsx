import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { CyclicPlacementDiagram } from "@/components/md/diagrams/CyclicPlacementDiagram";
import { ModClockDiagram } from "@/components/md/diagrams/ModClockDiagram";
import { GraphRepresentationDiagram } from "@/components/md/diagrams/GraphRepresentationDiagram";
import { CyclicRotateViz } from "@/components/viz/vizzes/CyclicRotateViz";
import { RingBufferViz } from "@/components/viz/vizzes/RingBufferViz";
import { polarPoint } from "@/lib/visual/polar";

// Math.cos/sin are not bit-identical across engines (issue #74: Node and the
// browser disagreed in the last digit of a path `d`, a hydration mismatch).
// Every component that turns an angle into markup must render the same
// string when the trig results move by a hair.
const CASES: Array<[string, () => ReactElement]> = [
  ["CyclicPlacementDiagram", () => <CyclicPlacementDiagram />],
  ["CyclicPlacementDiagram n=7 k=3", () => <CyclicPlacementDiagram n={7} k={3} />],
  ["ModClockDiagram", () => <ModClockDiagram />],
  ["ModClockDiagram m=7", () => <ModClockDiagram m={7} />],
  ["GraphRepresentationDiagram", () => <GraphRepresentationDiagram />],
  ["CyclicRotateViz", () => <CyclicRotateViz />],
  ["RingBufferViz", () => <RingBufferViz />],
];

const realCos = Math.cos;
const realSin = Math.sin;

function withTrigPerturbed(epsilon: number, render: () => ReactElement): string {
  vi.spyOn(Math, "cos").mockImplementation((x) => realCos(x) + epsilon);
  vi.spyOn(Math, "sin").mockImplementation((x) => realSin(x) + epsilon);
  try {
    return renderToStaticMarkup(render());
  } finally {
    vi.restoreAllMocks();
  }
}

afterEach(() => vi.restoreAllMocks());

describe("trig geometry is engine-independent", () => {
  for (const [name, render] of CASES) {
    it(`${name} renders identical markup under perturbed cos/sin`, () => {
      const baseline = renderToStaticMarkup(render());
      expect(baseline).toContain("<");
      for (const eps of [1e-13, -1e-13, 3e-14]) {
        expect(withTrigPerturbed(eps, render)).toBe(baseline);
      }
    });
  }

  it("polarPoint emits at most two decimals", () => {
    const { x, y } = polarPoint(125, 125, 64, 1.234567);
    expect(String(x)).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(String(y)).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});
