"use client";

/**
 * 2D grid beside its row-major flat memory layout, with one cell
 * highlighted to show offset = i*C + j.
 */

interface GridCoordsDiagramProps {
  rows?: number;
  cols?: number;
  /** Highlighted cell [row, col]. */
  highlight?: [number, number];
  /** Optional cell labels (row-major). */
  labels?: string[];
}

const CELL = 36;
const GAP = 4;
const PAD = 16;

export function GridCoordsDiagram({
  rows = 3,
  cols = 4,
  highlight = [1, 2],
  labels,
}: GridCoordsDiagramProps) {
  const R = Math.max(1, Math.min(rows, 6));
  const C = Math.max(1, Math.min(cols, 8));
  const cells =
    labels && labels.length >= R * C
      ? labels.slice(0, R * C)
      : Array.from({ length: R * C }, (_, i) =>
          String.fromCharCode(97 + (i % 26)),
        );
  const [hi, hj] = highlight;
  const highlightFlat = hi * C + hj;

  const gridW = C * (CELL + GAP) - GAP;
  const gridH = R * (CELL + GAP) - GAP;
  const flatY = PAD + gridH + 36;
  const flatW = R * C * (CELL * 0.7 + 2);
  const width = Math.max(PAD * 2 + gridW + 48, PAD * 2 + flatW, 360);
  const height = flatY + CELL + 40;
  const gridOriginX = PAD + 28;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`A ${R}×${C} grid in row-major order; cell (${hi},${hj}) is flat offset ${highlightFlat}`}
    >
      <text
        x={gridOriginX + gridW / 2}
        y={14}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        textAnchor="middle"
      >
        grid ({R}×{C})
      </text>

      {Array.from({ length: C }, (_, j) => (
        <text
          key={`c-${j}`}
          x={gridOriginX + j * (CELL + GAP) + CELL / 2}
          y={PAD + 10}
          fontSize={10}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          {j}
        </text>
      ))}

      {Array.from({ length: R }, (_, i) => (
        <g key={`row-${i}`}>
          <text
            x={gridOriginX - 10}
            y={PAD + 14 + i * (CELL + GAP) + CELL / 2}
            fontSize={10}
            fill="var(--muted)"
            textAnchor="end"
            fontFamily="var(--font-mono), monospace"
          >
            {i}
          </text>
          {Array.from({ length: C }, (_, j) => {
            const idx = i * C + j;
            const x = gridOriginX + j * (CELL + GAP);
            const y = PAD + 14 + i * (CELL + GAP);
            const on = i === hi && j === hj;
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
                      : "var(--surface)"
                  }
                  fillOpacity={on ? 0.2 : 1}
                  stroke="var(--family-accent, var(--accent))"
                  strokeWidth={on ? 2 : 1.25}
                />
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 4}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--foreground)"
                  textAnchor="middle"
                  fontFamily="var(--font-mono), monospace"
                >
                  {cells[idx]}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      <text
        x={width / 2}
        y={flatY - 10}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        textAnchor="middle"
      >
        flat memory · offset = i×{C}+j
      </text>

      {cells.map((lab, idx) => {
        const cw = CELL * 0.7;
        const x = PAD + idx * (cw + 2);
        const on = idx === highlightFlat;
        return (
          <g key={`f-${idx}`}>
            <rect
              x={x}
              y={flatY}
              width={cw}
              height={CELL * 0.85}
              rx={3}
              fill={
                on ? "var(--family-accent, var(--accent))" : "var(--surface)"
              }
              fillOpacity={on ? 0.2 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={on ? 1.75 : 1}
            />
            <text
              x={x + cw / 2}
              y={flatY + (CELL * 0.85) / 2 + 4}
              fontSize={11}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {lab}
            </text>
            <text
              x={x + cw / 2}
              y={flatY + CELL * 0.85 + 12}
              fontSize={9}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {idx}
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
        ({hi},{hj}) → {hi}×{C}+{hj} = {highlightFlat}
      </text>
    </svg>
  );
}
