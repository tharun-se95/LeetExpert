"use client";

/**
 * log2(n) as repeated halving: a bar of size n, halved each row, down to 1 —
 * the row count IS log2(n). Same bar-and-shrink visual language as the
 * Euclid diagram, for a consistent module feel.
 */

interface LogHalvingDiagramProps {
  n?: number;
}

const MAX_ROWS = 8;
const BAR_WIDTH = 200;
const BAR_HEIGHT = 20;
const ROW_GAP = 32;
const LEFT_PAD = 4;
const TOP_PAD = 6;

function buildRows(n: number): number[] {
  const rows: number[] = [Math.max(1, Math.round(n))];
  while (rows[rows.length - 1] > 1 && rows.length <= MAX_ROWS) {
    rows.push(Math.floor(rows[rows.length - 1] / 2));
  }
  return rows;
}

export function LogHalvingDiagram({ n = 8 }: LogHalvingDiagramProps) {
  const rows = buildRows(n);
  const scale = rows.length > 0 ? BAR_WIDTH / rows[0] : 1;
  const height = rows.length * ROW_GAP + TOP_PAD + 24;
  const halvings = rows.length - 1;

  return (
    <svg
      viewBox={`0 0 320 ${height}`}
      className="mx-auto h-auto w-full max-w-[380px]"
      role="img"
      aria-label={`Halving ${n} down to 1 takes ${halvings} steps, which is log base 2 of ${n}`}
    >
      {rows.map((value, i) => {
        const y = TOP_PAD + i * ROW_GAP;
        const w = Math.max(value * scale, 6);
        const isLast = i === rows.length - 1;
        return (
          <g key={i}>
            <rect
              x={LEFT_PAD}
              y={y}
              width={w}
              height={BAR_HEIGHT}
              rx={3}
              fill={isLast ? "var(--accent)" : "var(--surface)"}
              fillOpacity={isLast ? 0.85 : 1}
              stroke={isLast ? "none" : "var(--border)"}
              strokeWidth={1.25}
            />
            <text
              x={LEFT_PAD + w + 10}
              y={y + BAR_HEIGHT / 2}
              fontSize={11}
              dominantBaseline="middle"
              fill={isLast ? "var(--accent)" : "var(--muted)"}
              fontWeight={isLast ? 700 : 500}
              fontFamily="var(--font-mono), monospace"
            >
              n = {value}
              {isLast ? `  (${halvings} halvings = log₂ ${n})` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
