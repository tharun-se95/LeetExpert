"use client";

/**
 * A horizontal sequence of labeled steps connected by arrows — the single
 * most reusable shape across the Next.js course: a rendering pipeline, a
 * request lifecycle, a migration sequence, a build-vs-request timeline.
 * Wraps to a second row automatically once steps would overflow a
 * reasonable width, so 4-6 step sequences stay readable.
 */
export interface FlowStep {
  label: string;
  detail?: string;
  /** Tints this step's box with the theme accent instead of a neutral fill. */
  highlight?: boolean;
}

interface FlowStepsDiagramProps {
  steps?: FlowStep[];
  caption?: string;
  /** Max steps per row before wrapping (default 4). */
  perRow?: number;
}

const BOX_W = 120;
const BOX_H = 56;
const GAP = 36;
const PAD = 12;

export function FlowStepsDiagram({
  steps = [
    { label: "Step 1" },
    { label: "Step 2" },
    { label: "Step 3" },
  ],
  caption,
  perRow = 4,
}: FlowStepsDiagramProps) {
  const rows: FlowStep[][] = [];
  for (let i = 0; i < steps.length; i += perRow) {
    rows.push(steps.slice(i, i + perRow));
  }
  const cols = Math.min(perRow, steps.length);
  const width = PAD * 2 + cols * BOX_W + (cols - 1) * GAP;
  const rowH = BOX_H + GAP;
  const height = PAD * 2 + rows.length * rowH - GAP + (caption ? 22 : 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[560px]"
      role="img"
      aria-label={
        (caption ? `${caption}: ` : "") +
        steps.map((s) => s.label + (s.detail ? ` (${s.detail})` : "")).join(" → ")
      }
    >
      <defs>
        <marker id="flowArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
        </marker>
      </defs>
      {rows.map((row, rIdx) => {
        const y = PAD + rIdx * rowH;
        return (
          <g key={rIdx}>
            {row.map((step, i) => {
              const x = PAD + i * (BOX_W + GAP);
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={BOX_W}
                    height={BOX_H}
                    rx={6}
                    fill={step.highlight ? "var(--family-accent, var(--accent))" : "var(--surface)"}
                    fillOpacity={step.highlight ? 0.16 : 1}
                    stroke={step.highlight ? "var(--family-accent, var(--accent))" : "var(--border)"}
                    strokeWidth={step.highlight ? 1.5 : 1}
                  />
                  <text
                    x={x + BOX_W / 2}
                    y={y + BOX_H / 2 - (step.detail ? 6 : 0)}
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--foreground)"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-sans), system-ui"
                  >
                    {step.label}
                  </text>
                  {step.detail ? (
                    <text
                      x={x + BOX_W / 2}
                      y={y + BOX_H / 2 + 12}
                      fontSize={9}
                      fill="var(--muted)"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="var(--font-sans), system-ui"
                    >
                      {step.detail}
                    </text>
                  ) : null}
                  {i < row.length - 1 ? (
                    <line
                      x1={x + BOX_W + 4}
                      y1={y + BOX_H / 2}
                      x2={x + BOX_W + GAP - 4}
                      y2={y + BOX_H / 2}
                      stroke="var(--muted)"
                      strokeWidth={1}
                      markerEnd="url(#flowArrow)"
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {caption ? (
        <text
          x={width / 2}
          y={height - 6}
          fontSize={10}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {caption}
        </text>
      ) : null}
    </svg>
  );
}
