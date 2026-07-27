"use client";

/**
 * Cyclic placement as displacement chains on a ring: each index i points at
 * its destination (i + k) mod n. With n = 6, k = 2 the arrows form TWO
 * disjoint cycles rather than one — which is exactly why the algorithm has
 * to notice a closed cycle and restart from a fresh index.
 */

interface CyclicPlacementDiagramProps {
  n?: number;
  k?: number;
}

const SIZE = 250;
const CENTER = SIZE / 2;
const RING_R = 82;
const NODE_R = 15;

function angleFor(index: number, n: number): number {
  // 0 at the top, clockwise
  return (Math.PI * 2 * index) / n - Math.PI / 2;
}

function pointAt(radius: number, angle: number): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

/** Partition 0..n-1 into the cycles induced by i -> (i + k) mod n. */
function buildCycles(n: number, k: number): number[][] {
  const seen = new Array<boolean>(n).fill(false);
  const cycles: number[][] = [];
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    const cycle: number[] = [];
    let current = start;
    while (!seen[current]) {
      seen[current] = true;
      cycle.push(current);
      current = (current + k) % n;
    }
    cycles.push(cycle);
  }
  return cycles;
}

export function CyclicPlacementDiagram({
  n = 6,
  k = 2,
}: CyclicPlacementDiagramProps) {
  const size = Math.max(3, Math.min(12, Math.round(n)));
  const shift = ((Math.round(k) % size) + size) % size;
  const cycles = shift === 0 ? [] : buildCycles(size, shift);

  const colorFor = (cycleIndex: number) =>
    cycleIndex === 0 ? "var(--accent)" : "var(--muted)";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-[300px]"
      role="img"
      aria-label={`${size} indices on a ring with arrows from i to i plus ${shift} modulo ${size}, forming ${cycles.length} separate ${cycles.length === 1 ? "cycle" : "cycles"}`}
    >
      <defs>
        {cycles.map((_, ci) => (
          <marker
            key={ci}
            id={`cycle-arrow-${ci}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={5}
            markerHeight={5}
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 Z" fill={colorFor(ci)} />
          </marker>
        ))}
      </defs>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_R}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />

      {/* displacement arrows, drawn per cycle so each cycle reads as one loop */}
      {cycles.map((cycle, ci) =>
        cycle.map((from, j) => {
          const to = cycle[(j + 1) % cycle.length];
          const a1 = angleFor(from, size);
          const a2 = angleFor(to, size);
          const start = pointAt(RING_R - NODE_R - 3, a1);
          const end = pointAt(RING_R - NODE_R - 3, a2);
          // bow toward the centre so opposing chords stay distinguishable
          const midAngle = Math.atan2(
            (start.y + end.y) / 2 - CENTER,
            (start.x + end.x) / 2 - CENTER,
          );
          const control = pointAt(RING_R * 0.3, midAngle);
          return (
            <path
              key={`${ci}-${from}`}
              d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
              fill="none"
              stroke={colorFor(ci)}
              strokeWidth={1.5}
              strokeOpacity={0.75}
              markerEnd={`url(#cycle-arrow-${ci})`}
            />
          );
        }),
      )}

      {/* index nodes */}
      {Array.from({ length: size }, (_, i) => {
        const cycleIndex = cycles.findIndex((c) => c.includes(i));
        const at = pointAt(RING_R, angleFor(i, size));
        const color = colorFor(cycleIndex);
        return (
          <g key={i}>
            <circle
              cx={at.x}
              cy={at.y}
              r={NODE_R}
              fill="var(--background)"
              stroke={color}
              strokeWidth={1.75}
            />
            <text
              x={at.x}
              y={at.y}
              fontSize={12}
              fontWeight={700}
              fill={color}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
            >
              {i}
            </text>
          </g>
        );
      })}

      <text
        x={CENTER}
        y={SIZE - 6}
        fontSize={10}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        {`n = ${size}, k = ${shift} → ${cycles.length} ${cycles.length === 1 ? "cycle" : "cycles"}`}
      </text>
    </svg>
  );
}
