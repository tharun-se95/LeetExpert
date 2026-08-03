"use client";

/**
 * 2D prefix-sum inclusion-exclusion, shown geometrically instead of as an
 * abstract boxes-and-arrows flowchart. The "strip above" and "strip left"
 * regions are drawn as overlapping translucent rects — their overlap (the
 * corner) visibly darkens, which is the whole reason it needs adding back.
 */

interface GridRegionsDiagramProps {
  rows?: number;
  cols?: number;
  r1?: number;
  c1?: number;
  r2?: number;
  c2?: number;
}

const CELL = 28;
const PAD = 16;
const LEGEND_H = 76;

export function GridRegionsDiagram({
  rows = 5,
  cols = 6,
  r1 = 1,
  c1 = 1,
  r2 = 3,
  c2 = 3,
}: GridRegionsDiagramProps) {
  const width = PAD * 2 + cols * CELL;
  const height = PAD + rows * CELL + LEGEND_H;
  const x = (c: number) => PAD + c * CELL;
  const y = (r: number) => PAD + r * CELL;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[380px]"
      role="img"
      aria-label={`A ${rows} by ${cols} grid showing the rectangle from row ${r1} to ${r2}, column ${c1} to ${c2}. The strip above and strip to the left of it overlap at the top-left corner, which is why that corner must be added back after being subtracted twice`}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={x(c)}
            y={y(r)}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        )),
      )}

      {/* strip above: rows 0..r1-1, cols 0..c2 */}
      <rect
        x={x(0)}
        y={y(0)}
        width={(c2 + 1) * CELL}
        height={r1 * CELL}
        fill="var(--warn)"
        fillOpacity={0.22}
      />
      {/* strip left: rows 0..r2, cols 0..c1-1 */}
      <rect
        x={x(0)}
        y={y(0)}
        width={c1 * CELL}
        height={(r2 + 1) * CELL}
        fill="var(--info)"
        fillOpacity={0.22}
      />
      {/* target region, solid on top */}
      <rect
        x={x(c1)}
        y={y(r1)}
        width={(c2 - c1 + 1) * CELL}
        height={(r2 - r1 + 1) * CELL}
        fill="var(--family-accent, var(--accent))"
        fillOpacity={0.35}
        stroke="var(--family-accent, var(--accent))"
        strokeWidth={2}
      />
      <text
        x={x(c1) + ((c2 - c1 + 1) * CELL) / 2}
        y={y(r1) + ((r2 - r1 + 1) * CELL) / 2 + 4}
        fontSize={10}
        fontWeight={700}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        target
      </text>

      <g transform={`translate(${PAD}, ${rows * CELL + PAD + 16})`}>
        <rect x={0} y={0} width={12} height={12} rx={2} fill="var(--warn)" fillOpacity={0.4} />
        <text x={18} y={10} fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
          − strip above
        </text>
        <rect x={0} y={20} width={12} height={12} rx={2} fill="var(--info)" fillOpacity={0.4} />
        <text x={18} y={30} fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
          − strip left
        </text>
        <text x={0} y={50} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
          overlap (darker) = corner,
        </text>
        <text x={0} y={62} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
          + added back once
        </text>
      </g>
    </svg>
  );
}
