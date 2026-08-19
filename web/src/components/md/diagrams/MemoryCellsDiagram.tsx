"use client";

/**
 * An array as one contiguous RAM block — cells with index + hex address,
 * replacing the arrays module's old mermaid subgraph with a picture that
 * matches the rest of the diagram system.
 */

interface MemoryCellsDiagramProps {
  count?: number;
  baseAddress?: number;
  slotBytes?: number;
}

const CELL_W = 68;
const CELL_H = 44;
const GAP = 6;
const PAD_X = 16;
// Room for the bracket label above the cells — same failure mode as the
// pre-fix column-scan diagram (alphabetic baseline clips at y≈0).
const BRACKET_H = 28;

export function MemoryCellsDiagram({
  count = 5,
  baseAddress = 0x1000,
  slotBytes = 8,
}: MemoryCellsDiagramProps) {
  const n = Math.max(2, Math.min(8, Math.round(count)));
  const innerWidth = n * CELL_W + (n - 1) * GAP;
  const width = innerWidth + PAD_X * 2;
  const height = BRACKET_H + CELL_H + 24;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`An array of ${n} elements laid out as one contiguous block in memory, starting at address 0x${baseAddress.toString(16)}, each slot ${slotBytes} bytes apart`}
    >
      <text
        x={PAD_X + innerWidth / 2}
        y={11}
        fontSize={10}
        fontWeight={600}
        fill="var(--family-accent, var(--accent))"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        one contiguous block
      </text>
      <path
        d={`M ${PAD_X} ${BRACKET_H - 2} L ${PAD_X} 15 L ${PAD_X + innerWidth} 15 L ${PAD_X + innerWidth} ${BRACKET_H - 2}`}
        fill="none"
        stroke="var(--family-accent, var(--accent))"
        strokeWidth={1.25}
        strokeOpacity={0.7}
      />

      {Array.from({ length: n }, (_, i) => {
        const x = PAD_X + i * (CELL_W + GAP);
        const addr = baseAddress + i * slotBytes;
        return (
          <g key={i}>
            <rect
              x={x}
              y={BRACKET_H}
              width={CELL_W}
              height={CELL_H}
              rx={4}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.25}
            />
            <text
              x={x + CELL_W / 2}
              y={BRACKET_H + 17}
              fontSize={11}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              idx {i}
            </text>
            <text
              x={x + CELL_W / 2}
              y={BRACKET_H + 32}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {addr.toString(16)}h
            </text>
          </g>
        );
      })}
    </svg>
  );
}
