"use client";

/**
 * Heap dual view: complete binary tree on top, flat array underneath
 * with parent/child index arithmetic callouts.
 */

interface HeapArrayDiagramProps {
  values?: number[];
}

const DEFAULT_VALUES = [1, 3, 2, 7, 4, 5, 8];

const X_UNIT = 56;
const LEVEL_H = 52;
const NODE_R = 16;
const PAD = 24;
const CELL_W = 40;
const CELL_H = 32;

export function HeapArrayDiagram({
  values = DEFAULT_VALUES,
}: HeapArrayDiagramProps) {
  const vals = values.length > 0 ? values.slice(0, 15) : DEFAULT_VALUES;
  const n = vals.length;

  // Level-order positions via complete-tree index math.
  const depthOf = (i: number) => Math.floor(Math.log2(i + 1));
  const maxDepth = depthOf(n - 1);
  // Place leaves across full width of last level slots.
  const leafSlots = Math.pow(2, maxDepth);
  const placed = vals.map((_, i) => {
    const d = depthOf(i);
    const first = Math.pow(2, d) - 1;
    const posInLevel = i - first;
    const span = leafSlots / Math.pow(2, d);
    const slot = posInLevel * span + span / 2 - 0.5;
    return { x: slot * X_UNIT, y: d };
  });

  const xs = placed.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const treeW = maxX - minX + PAD * 2 + NODE_R * 2;
  const treeH = (maxDepth + 1) * LEVEL_H + PAD;
  const arrayY = treeH + 20;
  const arrayW = n * CELL_W + PAD * 2;
  const width = Math.max(treeW, arrayW, 360);
  const height = arrayY + CELL_H + 40;

  const at = (i: number) => ({
    cx: placed[i]!.x - minX + PAD + NODE_R + (width - treeW) / 2,
    cy: placed[i]!.y * LEVEL_H + PAD,
  });

  const arrayOriginX = (width - n * CELL_W) / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`Min-heap as a complete tree and flat array of ${n} values; children of i are at 2i+1 and 2i+2`}
    >
      {vals.map((_, i) => {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        const a = at(i);
        return (
          <g key={`e-${i}`}>
            {left < n && (
              <line
                x1={a.cx}
                y1={a.cy}
                x2={at(left).cx}
                y2={at(left).cy}
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
            )}
            {right < n && (
              <line
                x1={a.cx}
                y1={a.cy}
                x2={at(right).cx}
                y2={at(right).cy}
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
            )}
          </g>
        );
      })}

      {vals.map((v, i) => {
        const { cx, cy } = at(i);
        const isRoot = i === 0;
        return (
          <g key={`n-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              fill={
                isRoot
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={isRoot ? 0.2 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={isRoot ? 2 : 1.5}
            />
            <text
              x={cx}
              y={cy + 4}
              fontSize={12}
              fontWeight={700}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v}
            </text>
          </g>
        );
      })}

      {vals.map((v, i) => {
        const x = arrayOriginX + i * CELL_W;
        return (
          <g key={`a-${i}`}>
            <rect
              x={x}
              y={arrayY}
              width={CELL_W - 4}
              height={CELL_H}
              rx={4}
              fill="var(--surface)"
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.25}
            />
            <text
              x={x + (CELL_W - 4) / 2}
              y={arrayY + CELL_H / 2 + 4}
              fontSize={12}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v}
            </text>
            <text
              x={x + (CELL_W - 4) / 2}
              y={arrayY + CELL_H + 14}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {i}
            </text>
          </g>
        );
      })}

      <text
        x={width / 2}
        y={height - 6}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        left = 2i+1 · right = 2i+2 · parent = ⌊(i−1)/2⌋
      </text>
    </svg>
  );
}
