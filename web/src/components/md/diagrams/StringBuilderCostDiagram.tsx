"use client";

/**
 * The `join_bad` vs `join_good` cost shape from strings-in-memory: bad
 * re-copies the accumulated prefix on every append (bars grow 1..n, a
 * triangle); good appends O(1) each and pays one O(total) copy at the end.
 */

interface StringBuilderCostDiagramProps {
  count?: number;
}

const BAR_W = 14;
const BAR_GAP = 6;
const ROW_H = 70;
const MAX_BAR_H = 46;

export function StringBuilderCostDiagram({ count = 6 }: StringBuilderCostDiagramProps) {
  const n = Math.max(2, Math.min(10, Math.round(count)));
  const width = 60 + n * (BAR_W + BAR_GAP) + 40;
  const height = ROW_H * 2 + 30;
  const triangular = (n * (n + 1)) / 2;

  const badY = 20;
  const goodY = badY + ROW_H;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label={`Cost of building a string from ${n} pieces: join_bad copies grow with each step, totaling ${triangular} character copies; join_good appends in constant time and copies once at the end`}
    >
      {[
        { label: "join_bad", y: badY, growing: true },
        { label: "join_good", y: goodY, growing: false },
      ].map(({ label, y, growing }) => (
        <g key={label}>
          <text
            x={0}
            y={y + MAX_BAR_H / 2}
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
            dominantBaseline="central"
            fontFamily="var(--font-mono), monospace"
          >
            {label}
          </text>
          {Array.from({ length: n }, (_, i) => {
            const h = growing
              ? ((i + 1) / n) * MAX_BAR_H
              : (1 / n) * MAX_BAR_H;
            const x = 64 + i * (BAR_W + BAR_GAP);
            return (
              <rect
                key={i}
                x={x}
                y={y + MAX_BAR_H - h}
                width={BAR_W}
                height={h}
                rx={2}
                fill={
                  growing
                    ? "var(--family-accent, var(--accent))"
                    : "var(--muted)"
                }
                fillOpacity={growing ? 0.35 + (0.5 * (i + 1)) / n : 0.5}
              />
            );
          })}
          {!growing ? (
            <rect
              x={64 + n * (BAR_W + BAR_GAP)}
              y={y + MAX_BAR_H - MAX_BAR_H * 0.85}
              width={BAR_W + 6}
              height={MAX_BAR_H * 0.85}
              rx={2}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.85}
            />
          ) : null}
          <text
            x={width - 4}
            y={y + MAX_BAR_H + 12}
            fontSize={9}
            fill="var(--muted)"
            textAnchor="end"
            fontFamily="var(--font-mono), monospace"
          >
            {growing ? `1+2+…+${n} = ${triangular} copies` : "n appends + 1 join"}
          </text>
        </g>
      ))}
    </svg>
  );
}
