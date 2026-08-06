"use client";

/**
 * Growth-rate curves for the common Big-O classes. Utility diagram —
 * stays on neutral `--accent` (no family). Modes:
 * - `ladder` — all classes overlaid (common-complexity-classes)
 * - `compare` — two named curves head-to-head (why-efficiency-matters)
 * - `bound`  — f(n) under c·g(n) past n₀ (big-o-notation)
 * - `space`  — total vs auxiliary bars (space-complexity)
 */

type Mode = "ladder" | "compare" | "bound" | "space";

interface Curve {
  id: string;
  label: string;
  /** Relative height at each sample point (0..1 after normalize). */
  values: number[];
}

interface ComplexityCurveDiagramProps {
  mode?: Mode;
  /** For compare: left/right curve labels. */
  leftLabel?: string;
  rightLabel?: string;
  /** For bound: f / g / c / n0 labels. */
  fLabel?: string;
  gLabel?: string;
  c?: number;
  n0?: number;
}

const W = 420;
const H = 240;
const PAD_L = 36;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 36;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const LADDER_N = [1, 2, 4, 8, 12, 16, 20];

function ladderCurves(): Curve[] {
  return [
    { id: "1", label: "O(1)", values: LADDER_N.map(() => 1) },
    { id: "log", label: "O(log n)", values: LADDER_N.map((n) => Math.log2(n + 1)) },
    { id: "n", label: "O(n)", values: LADDER_N.map((n) => n) },
    {
      id: "nlog",
      label: "O(n log n)",
      values: LADDER_N.map((n) => n * Math.log2(n + 1)),
    },
    { id: "n2", label: "O(n²)", values: LADDER_N.map((n) => (n * n) / 4) },
    { id: "2n", label: "O(2ⁿ)", values: LADDER_N.map((n) => Math.pow(1.35, n)) },
  ];
}

function compareCurves(leftLabel: string, rightLabel: string): Curve[] {
  const ns = [2, 4, 6, 8, 10, 12, 14];
  return [
    {
      id: "a",
      label: leftLabel,
      values: ns.map((n) => (n * n) / 2),
    },
    {
      id: "b",
      label: rightLabel,
      values: ns.map((n) => n),
    },
  ];
}

function pathFor(values: number[], maxY: number): string {
  return values
    .map((v, i) => {
      const x = PAD_L + (i / Math.max(1, values.length - 1)) * PLOT_W;
      const y = PAD_T + PLOT_H - (v / maxY) * PLOT_H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const STROKES = [
  "var(--muted)",
  "var(--family-accent, var(--accent))",
  "var(--foreground)",
  "color-mix(in oklab, var(--accent) 70%, var(--foreground))",
  "color-mix(in oklab, var(--accent) 45%, var(--muted))",
  "color-mix(in oklab, var(--foreground) 55%, var(--accent))",
];

export function ComplexityCurveDiagram({
  mode = "ladder",
  leftLabel = "O(n²) pairs",
  rightLabel = "O(n) hash",
  fLabel = "f(n)",
  gLabel = "c · g(n)",
  c = 4,
  n0 = 14,
}: ComplexityCurveDiagramProps) {
  if (mode === "space") {
    return <SpaceBars />;
  }

  if (mode === "bound") {
    return <BoundPicture fLabel={fLabel} gLabel={gLabel} c={c} n0={n0} />;
  }

  const curves =
    mode === "compare"
      ? compareCurves(leftLabel, rightLabel)
      : ladderCurves();
  const maxY = Math.max(...curves.flatMap((c) => c.values)) * 1.05;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + (mode === "ladder" ? 28 : 8)}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={
        mode === "compare"
          ? `Growth comparison: ${leftLabel} rises much faster than ${rightLabel}`
          : "Growth curves for common Big-O classes as n increases"
      }
    >
      <line
        x1={PAD_L}
        y1={PAD_T + PLOT_H}
        x2={PAD_L + PLOT_W}
        y2={PAD_T + PLOT_H}
        stroke="var(--border)"
        strokeWidth={1.25}
      />
      <line
        x1={PAD_L}
        y1={PAD_T}
        x2={PAD_L}
        y2={PAD_T + PLOT_H}
        stroke="var(--border)"
        strokeWidth={1.25}
      />
      <text
        x={PAD_L + PLOT_W}
        y={PAD_T + PLOT_H + 18}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        n →
      </text>
      <text
        x={12}
        y={PAD_T + 8}
        fontSize={11}
        fill="var(--muted)"
        fontFamily="var(--font-mono), monospace"
      >
        ops
      </text>

      {curves.map((curve, i) => (
        <path
          key={curve.id}
          d={pathFor(curve.values, maxY)}
          fill="none"
          stroke={STROKES[i % STROKES.length]}
          strokeWidth={i === curves.length - 1 || mode === "compare" ? 2.25 : 1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={mode === "ladder" && i < 2 ? 0.7 : 1}
        />
      ))}

      {curves.map((curve, i) => {
        const last = curve.values[curve.values.length - 1] ?? 0;
        const x = PAD_L + PLOT_W + 2;
        const y = PAD_T + PLOT_H - (last / maxY) * PLOT_H;
        // Ladder labels go in a bottom legend to avoid overlap.
        if (mode === "ladder") return null;
        return (
          <text
            key={`lbl-${curve.id}`}
            x={Math.min(x - 4, PAD_L + PLOT_W - 4)}
            y={y}
            fontSize={11}
            fontWeight={600}
            fill={STROKES[i % STROKES.length]}
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {curve.label}
          </text>
        );
      })}

      {mode === "ladder" &&
        curves.map((curve, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = PAD_L + col * 130;
          const y = H + 4 + row * 14;
          return (
            <g key={`leg-${curve.id}`}>
              <line
                x1={x}
                y1={y}
                x2={x + 16}
                y2={y}
                stroke={STROKES[i % STROKES.length]}
                strokeWidth={2}
              />
              <text
                x={x + 22}
                y={y + 3}
                fontSize={10}
                fill="var(--muted)"
                fontFamily="var(--font-mono), monospace"
              >
                {curve.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

function BoundPicture({
  fLabel,
  gLabel,
  c,
  n0,
}: {
  fLabel: string;
  gLabel: string;
  c: number;
  n0: number;
}) {
  const ns = Array.from({ length: 24 }, (_, i) => i + 1);
  const f = ns.map((n) => 3 * n * n + 10 * n + 50);
  const cg = ns.map((n) => c * n * n);
  const maxY = Math.max(...cg, ...f) * 1.05;
  const n0Idx = Math.min(ns.length - 1, Math.max(0, n0 - 1));
  const n0X = PAD_L + (n0Idx / (ns.length - 1)) * PLOT_W;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`${fLabel} stays under ${gLabel} past n₀ = ${n0}`}
    >
      <line
        x1={PAD_L}
        y1={PAD_T + PLOT_H}
        x2={PAD_L + PLOT_W}
        y2={PAD_T + PLOT_H}
        stroke="var(--border)"
        strokeWidth={1.25}
      />
      <line
        x1={PAD_L}
        y1={PAD_T}
        x2={PAD_L}
        y2={PAD_T + PLOT_H}
        stroke="var(--border)"
        strokeWidth={1.25}
      />
      <path
        d={pathFor(cg, maxY)}
        fill="none"
        stroke="var(--family-accent, var(--accent))"
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      <path
        d={pathFor(f, maxY)}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={2.25}
      />
      <line
        x1={n0X}
        y1={PAD_T}
        x2={n0X}
        y2={PAD_T + PLOT_H}
        stroke="var(--muted)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text
        x={n0X}
        y={PAD_T + PLOT_H + 16}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        n₀ = {n0}
      </text>
      <text
        x={PAD_L + PLOT_W - 4}
        y={PAD_T + 14}
        fontSize={11}
        fill="var(--family-accent, var(--accent))"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {gLabel}
      </text>
      <text
        x={PAD_L + PLOT_W - 4}
        y={PAD_T + 30}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {fLabel}
      </text>
    </svg>
  );
}

function SpaceBars() {
  const rows = [
    { label: "max_of — aux", aux: 1, total: 1, note: "O(1)" },
    { label: "sorted_copy", aux: 6, total: 12, note: "O(n) aux" },
    { label: "sum_to(n) frames", aux: 8, total: 8, note: "O(n) stack" },
    { label: "sum_iter", aux: 1, total: 1, note: "O(1) stack" },
  ];
  const barH = 22;
  const gap = 28;
  const labelW = 130;
  const maxBar = 200;
  const height = 20 + rows.length * gap;

  return (
    <svg
      viewBox={`0 0 420 ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label="Auxiliary space: in-place and iterative stay flat; recursive frames and copies grow with n"
    >
      {rows.map((row, i) => {
        const y = 12 + i * gap;
        const w = (row.aux / 12) * maxBar;
        return (
          <g key={row.label}>
            <text
              x={4}
              y={y + barH / 2 + 4}
              fontSize={11}
              fill="var(--muted)"
              fontFamily="var(--font-mono), monospace"
            >
              {row.label}
            </text>
            <rect
              x={labelW}
              y={y}
              width={Math.max(w, 6)}
              height={barH}
              rx={4}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.15}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.25}
            />
            <text
              x={labelW + Math.max(w, 6) + 10}
              y={y + barH / 2 + 4}
              fontSize={11}
              fill="var(--foreground)"
              fontFamily="var(--font-mono), monospace"
            >
              {row.note}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
