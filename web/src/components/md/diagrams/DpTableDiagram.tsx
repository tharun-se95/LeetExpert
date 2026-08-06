"use client";

/**
 * DP table snapshot — 1D strip or 2D grid with filled cells and a
 * highlighted "current" cell.
 */

interface DpTableDiagramProps {
  mode?: "1d" | "2d";
  values?: (number | string | null)[];
  /** 2D: row-major flat values, with cols. */
  cols?: number;
  current?: number;
  /** 2D current as [r,c] */
  currentCell?: [number, number];
  caption?: string;
  labels?: string[];
}

const CELL = 36;
const GAP = 4;
const PAD = 16;

export function DpTableDiagram({
  mode = "1d",
  values,
  cols = 5,
  current,
  currentCell,
  caption,
  labels,
}: DpTableDiagramProps) {
  if (mode === "2d") {
    return (
      <Dp2D
        values={values}
        cols={cols}
        currentCell={currentCell}
        caption={caption}
      />
    );
  }

  const vals =
    values && values.length > 0
      ? values
      : [0, 1, 1, 2, 3, 5, 8, 13];
  const n = vals.length;
  const cur = current ?? n - 1;
  const width = PAD * 2 + n * (CELL + GAP) - GAP;
  const height = 96;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`1D DP table of ${n} cells; current index ${cur}`}
    >
      {vals.map((v, i) => {
        const x = PAD + i * (CELL + GAP);
        const on = i === cur;
        const filled = v !== null && v !== undefined;
        return (
          <g key={i}>
            <rect
              x={x}
              y={28}
              width={CELL}
              height={CELL}
              rx={5}
              fill={
                on
                  ? "var(--family-accent, var(--accent))"
                  : filled
                    ? "var(--family-accent, var(--accent))"
                    : "var(--surface)"
              }
              fillOpacity={on ? 0.28 : filled ? 0.12 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={on ? 2 : 1.25}
              strokeOpacity={filled || on ? 1 : 0.4}
            />
            <text
              x={x + CELL / 2}
              y={28 + CELL / 2 + 4}
              fontSize={12}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v === null || v === undefined ? "·" : String(v)}
            </text>
            <text
              x={x + CELL / 2}
              y={28 + CELL + 14}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {labels?.[i] ?? `i=${i}`}
            </text>
          </g>
        );
      })}
      <text
        x={width / 2}
        y={14}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {caption ?? "bottom-up: fill left → right"}
      </text>
    </svg>
  );
}

function Dp2D({
  values,
  cols,
  currentCell,
  caption,
}: {
  values?: (number | string | null)[];
  cols: number;
  currentCell?: [number, number];
  caption?: string;
}) {
  const C = Math.max(2, Math.min(cols, 8));
  const raw =
    values && values.length > 0
      ? values
      : [
          1, 1, 1, 1,
          1, 2, 3, 4,
          1, 3, 6, 10,
        ];
  const R = Math.ceil(raw.length / C);
  const [cr, cc] = currentCell ?? [R - 1, C - 1];
  const width = PAD * 2 + C * (CELL + GAP) - GAP + 28;
  const height = PAD * 2 + R * (CELL + GAP) - GAP + 36;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label={`2D DP table ${R}×${C}; current cell (${cr},${cc})`}
    >
      <text
        x={width / 2}
        y={14}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
      >
        {caption ?? "dp[r][c] depends on earlier cells"}
      </text>
      {Array.from({ length: R }, (_, r) =>
        Array.from({ length: C }, (_, c) => {
          const idx = r * C + c;
          const v = raw[idx];
          const x = PAD + 20 + c * (CELL + GAP);
          const y = PAD + 14 + r * (CELL + GAP);
          const on = r === cr && c === cc;
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={4}
                fill={
                  on
                    ? "var(--family-accent, var(--accent))"
                    : "var(--family-accent, var(--accent))"
                }
                fillOpacity={on ? 0.28 : 0.1}
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={on ? 2 : 1.2}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 4}
                fontSize={12}
                fontWeight={600}
                fill="var(--foreground)"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
              >
                {v === null || v === undefined ? "·" : String(v)}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}
