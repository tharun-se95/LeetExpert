"use client";

/**
 * A horizontal timeline with a handful of marked points — for anything
 * framed as "at time X, this happens" rather than a data-flow pipeline:
 * build-time vs. request-time, a font-swap CLS moment, an OAuth round
 * trip. Distinct from `FlowStepsDiagram` in that points sit on one line
 * (a real timeline), not separate boxes connected by arrows.
 */
export interface TimelinePoint {
  time: string;
  label: string;
  highlight?: boolean;
}

interface TimelineDiagramProps {
  points?: TimelinePoint[];
  caption?: string;
}

const PAD = 20;
const POINT_GAP = 130;

export function TimelineDiagram({
  points = [
    { time: "t=0", label: "Start" },
    { time: "t=1", label: "End" },
  ],
  caption,
}: TimelineDiagramProps) {
  const width = PAD * 2 + Math.max(points.length - 1, 1) * POINT_GAP;
  const height = 110;
  const lineY = 44;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={
        (caption ? `${caption}: ` : "") +
        points.map((p) => `${p.time} — ${p.label}`).join("; then ")
      }
    >
      <line x1={PAD} y1={lineY} x2={width - PAD} y2={lineY} stroke="var(--border)" strokeWidth={2} />
      {points.map((p, i) => {
        const x = points.length === 1 ? width / 2 : PAD + i * ((width - PAD * 2) / (points.length - 1));
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={lineY}
              r={6}
              fill={p.highlight ? "var(--family-accent, var(--accent))" : "var(--surface)"}
              stroke={p.highlight ? "var(--family-accent, var(--accent))" : "var(--muted)"}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={lineY - 16}
              fontSize={10}
              fontWeight={700}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {p.time}
            </text>
            <text
              x={x}
              y={lineY + 26}
              fontSize={11}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {p.label}
            </text>
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
