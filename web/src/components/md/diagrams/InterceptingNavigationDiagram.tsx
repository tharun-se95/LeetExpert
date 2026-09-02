"use client";

import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

/**
 * The soft-nav/hard-nav contrast Intercepting Routes turns on: the exact
 * same target URL renders as a modal over the feed when reached via a
 * client-side `<Link>` click, but as a full standalone page when reached
 * by a hard navigation (typed URL, refresh, shared link) — same two-panel
 * layout in both rows so only the trigger (and the outcome) differs.
 */
export function InterceptingNavigationDiagram() {
  const width = 460;
  const rowH = 100;
  const height = rowH * 2 + 20;
  const leftX = 20;
  const rightX = 250;
  const boxW = 180;
  const boxH = 78;

  const row = (
    y: number,
    label: string,
    leftUrl: string,
    leftLabel: string,
    rightUrl: string,
    rightLabel: string,
    modal: boolean,
  ) => (
    <g>
      <text
        x={0}
        y={y - 6}
        fontSize={10}
        fontWeight={700}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
      >
        {label}
      </text>
      <BrowserMockup x={leftX} y={y} width={boxW} height={boxH} url={leftUrl}>
        <text
          x={boxW / 2}
          y={boxH / 2 - 18}
          fontSize={9.5}
          fill="var(--foreground)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {leftLabel}
        </text>
      </BrowserMockup>
      <path
        d={`M ${leftX + boxW + 8} ${y + boxH / 2} L ${rightX - 8} ${y + boxH / 2}`}
        stroke="var(--muted)"
        strokeWidth={1}
        markerEnd="url(#navArrow)"
      />
      <BrowserMockup x={rightX} y={y} width={boxW} height={boxH} url={rightUrl} accent={modal}>
        {modal ? (
          <rect
            x={boxW / 2 - 34}
            y={boxH / 2 - 34}
            width={68}
            height={44}
            rx={5}
            fill="var(--family-accent, var(--accent))"
            fillOpacity={0.85}
          />
        ) : null}
        <text
          x={boxW / 2}
          y={boxH / 2 - (modal ? -16 : 18)}
          fontSize={9.5}
          fill={modal ? "var(--on-pop)" : "var(--foreground)"}
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {rightLabel}
        </text>
      </BrowserMockup>
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label="Soft navigation: clicking a Link from the feed opens the photo as a modal layered over the feed. Hard navigation: visiting the same photo URL directly (typed, refreshed, or shared) renders the photo as a full standalone page instead."
    >
      <defs>
        <marker id="navArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
        </marker>
      </defs>
      {row(20, "SOFT NAVIGATION — <Link> click from the feed", "acme.com/feed", "feed (click photo)", "acme.com/feed", "modal over feed", true)}
      {row(20 + rowH, "HARD NAVIGATION — typed URL, refresh, or shared link", "acme.com/photo/123", "direct visit", "acme.com/photo/123", "full standalone page", false)}
    </svg>
  );
}
