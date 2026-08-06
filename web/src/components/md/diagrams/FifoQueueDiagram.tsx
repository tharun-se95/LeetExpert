"use client";

/**
 * FIFO queue: front ← cells ← back, with enqueue/dequeue callouts.
 */

interface FifoQueueDiagramProps {
  values?: (string | number)[];
  frontLabel?: string;
  backLabel?: string;
}

const CELL_W = 44;
const CELL_H = 36;
const PAD = 20;

export function FifoQueueDiagram({
  values = [1, 2, 3, 4],
  frontLabel = "front · dequeue",
  backLabel = "back · enqueue",
}: FifoQueueDiagramProps) {
  const vals = values.length > 0 ? values : [1, 2, 3, 4];
  const n = vals.length;
  const width = PAD * 2 + n * CELL_W + 120;
  const height = 110;
  const originX = PAD + 50;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`A FIFO queue holding ${vals.join(", ")}; dequeue from front, enqueue at back`}
    >
      <text
        x={originX - 8}
        y={PAD + CELL_H / 2 + 4}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {frontLabel}
      </text>
      <polygon
        points={`${originX - 4},${PAD + 8} ${originX - 16},${PAD + CELL_H / 2} ${originX - 4},${PAD + CELL_H - 8}`}
        fill="var(--family-accent, var(--accent))"
      />

      {vals.map((v, i) => {
        const x = originX + i * CELL_W;
        const isFront = i === 0;
        const isBack = i === n - 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={PAD}
              width={CELL_W - 4}
              height={CELL_H}
              rx={5}
              fill={
                isFront || isBack
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={isFront || isBack ? 0.18 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={isFront || isBack ? 1.75 : 1.25}
            />
            <text
              x={x + (CELL_W - 4) / 2}
              y={PAD + CELL_H / 2 + 4}
              fontSize={13}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v}
            </text>
          </g>
        );
      })}

      <polygon
        points={`${originX + n * CELL_W + 4},${PAD + 8} ${originX + n * CELL_W + 16},${PAD + CELL_H / 2} ${originX + n * CELL_W + 4},${PAD + CELL_H - 8}`}
        fill="var(--family-accent, var(--accent))"
      />
      <text
        x={originX + n * CELL_W + 22}
        y={PAD + CELL_H / 2 + 4}
        fontSize={11}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
      >
        {backLabel}
      </text>

      <text
        x={width / 2}
        y={height - 12}
        fontSize={12}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        first in → first out
      </text>
    </svg>
  );
}
