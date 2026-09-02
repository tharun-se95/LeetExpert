"use client";

import type { ReactNode } from "react";

/**
 * Shared "browser window" chrome (traffic-light dots + address bar) used by
 * every Next.js-course diagram that needs to show a page's on-screen state.
 * Not registered in DIAGRAM_REGISTRY itself — it's a building block the
 * actual diagram components below compose, the same way none of the DSA
 * diagrams register their own internal `<rect>` helpers.
 */
export function BrowserMockup({
  x,
  y,
  width,
  height,
  url,
  accent = false,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  url?: string;
  /** Tints the chrome border with the theme accent instead of a neutral border. */
  accent?: boolean;
  children?: ReactNode;
}) {
  const chromeH = 18;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill="var(--surface)"
        stroke={accent ? "var(--family-accent, var(--accent))" : "var(--border)"}
        strokeWidth={accent ? 1.5 : 1}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={chromeH}
        rx={6}
        fill="var(--elevated)"
      />
      {/* Square off the chrome's bottom corners so it reads as one bar, not a pill. */}
      <rect x={x} y={y + chromeH - 6} width={width} height={6} fill="var(--elevated)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 10 + i * 8} cy={y + chromeH / 2} r={2.25} fill="var(--muted)" fillOpacity={0.5} />
      ))}
      {url ? (
        <text
          x={x + 36}
          y={y + chromeH / 2}
          fontSize={8}
          fill="var(--muted)"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {url}
        </text>
      ) : null}
      <g transform={`translate(${x}, ${y + chromeH})`}>{children}</g>
    </g>
  );
}

/** A skeleton loading row — a pill-shaped bar with no fill content yet. */
export function SkeletonRow({ x, y, width, height = 8 }: { x: number; y: number; width: number; height?: number }) {
  return <rect x={x} y={y} width={width} height={height} rx={height / 2} fill="var(--border)" />;
}

/** A resolved content row, tinted with the active theme accent. */
export function FilledRow({ x, y, width, height = 8 }: { x: number; y: number; width: number; height?: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={height / 2}
      fill="var(--family-accent, var(--accent))"
      fillOpacity={0.7}
    />
  );
}
