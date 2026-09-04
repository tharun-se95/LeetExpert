"use client";

import { CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react";
import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

export interface FontSwapReflowDiagramProps {
  /** The system font shown before the custom font finishes loading. */
  fallbackLabel?: string;
  /** The custom font that swaps in once it finishes downloading. */
  customLabel?: string;
  /** When the custom font finishes downloading, in ms. */
  loadMs?: number;
  /** When the swap actually fires and paints, in ms. */
  swapMs?: number;
  /** CLS reading when the fallback's metrics don't match the real font. */
  clsMismatched?: string;
  /** CLS reading when `next/font` computes closely matching fallback metrics. */
  clsMatched?: string;
}

/**
 * The lesson's real point is not "a swap happens" (both rows have one, at the
 * same instant) — it's that `next/font` shrinks the SIZE of the reflow the
 * swap causes, by picking a fallback whose metrics are closer to the real
 * font. Two rows share one time axis (0ms fallback paint -> ~340ms load ->
 * 341ms swap), so the swap's timing is visibly identical between them. What
 * differs is drawn inside each row's second mini page mockup: a dashed ghost
 * marks where the headline and body lines sat before the swap, a solid block
 * marks where they land after, and a bracket + CLS badge measures the gap.
 * In the mismatched row that gap is large; in the metrics-matched row it's
 * barely there — the one comparison a reader needs to walk away with.
 */
export function FontSwapReflowDiagram({
  fallbackLabel = "Arial",
  customLabel = "Inter",
  loadMs = 340,
  swapMs = 341,
  clsMismatched = "+0.18",
  clsMatched = "~0.02",
}: FontSwapReflowDiagramProps) {
  // Rough advance widths at the sizes used below, so layout is derived from
  // real string lengths rather than a guessed constant (a longer CLS string
  // or label must still fit without clipping).
  const SANS_95 = 5.35;
  const SANS_9 = 5.05;
  const MONO_9 = 5.7;

  const swapLabel = `${loadMs}ms loaded → ${swapMs}ms swap`;
  const clsLabelA = `CLS ${clsMismatched}`;
  const clsLabelB = `CLS ${clsMatched}`;
  const caption =
    "Same swap, same instant, in both rows — next/font shrinks the reflow's size, not the swap itself.";

  const mockupW = 116;
  const mockupH = 100;
  const chromeH = 18;
  const padIn = 10;
  const contentW = mockupW - 2 * padIn;

  const leftPad = 26;
  const mockup1X = leftPad;
  const gapW = Math.max(150, swapLabel.length * SANS_9 + 30);
  const mockup2X = mockup1X + mockupW + gapW;
  const mockup2Right = mockup2X + mockupW;

  const pillPad = 22;
  const pillW = (label: string) => label.length * SANS_9 + pillPad;
  const maxPillW = Math.max(pillW(clsLabelA), pillW(clsLabelB));
  const rightMargin = Math.ceil(maxPillW) + 34;

  const width = Math.max(
    Math.round(mockup2Right + rightMargin),
    Math.round(caption.length * SANS_95 + 2 * leftPad),
  );

  // ---- Vertical layout: fixed constants, since row structure doesn't
  // depend on prop-driven text length. ----
  const panelH = 172;
  const laneGap = 22;
  const laneAPanelTop = 16;
  const laneBPanelTop = laneAPanelTop + panelH + laneGap;
  const axisY = laneBPanelTop + panelH + 28;
  const height = axisY + 46;

  const panelX = 10;
  const panelW = width - 20;

  // ---- Fallback (t = 0) content, identical in both rows. ----
  const fallbackHeadlineW = 56;
  const fallbackPara = [
    { y: 32, w: 90 },
    { y: 44, w: 76 },
    { y: 56, w: 60 },
  ];

  // ---- Row A: mismatched fallback -> big headline width jump, big vertical shift. ----
  const rowAHeadlineW = 90;
  const rowADy = 16;

  // ---- Row B: metrics-matched fallback -> tiny headline width jump, tiny shift. ----
  const rowBHeadlineW = 62;
  const rowBDy = 3;

  function fallbackMockup(x: number, y: number) {
    return (
      <g>
        <BrowserMockup x={x} y={y} width={mockupW} height={mockupH}>
          <g transform={`translate(${padIn}, ${padIn})`}>
            <rect x={0} y={9} width={fallbackHeadlineW} height={11} rx={5.5} fill="var(--muted)" fillOpacity={0.75} />
            {fallbackPara.map((p, i) => (
              <rect key={i} x={0} y={p.y - padIn} width={p.w} height={7} rx={3.5} fill="var(--border)" />
            ))}
          </g>
        </BrowserMockup>
        <text
          x={x + mockupW / 2}
          y={y + mockupH + 14}
          fontSize={9}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          0ms — {fallbackLabel}
        </text>
      </g>
    );
  }

  function afterMockup(
    x: number,
    y: number,
    headlineW: number,
    dy: number,
    accentColor: string,
    tickMarkerId: string,
  ) {
    const bracketX = padIn + contentW + 4;
    const oldMidY = fallbackPara[0].y - padIn + 3.5;
    const newMidY = oldMidY + dy;
    return (
      <g>
        <BrowserMockup x={x} y={y} width={mockupW} height={mockupH}>
          <g transform={`translate(${padIn}, ${padIn})`}>
            {/* Ghost of the old (fallback) layout, dashed, faded. */}
            <rect
              x={0}
              y={9}
              width={fallbackHeadlineW}
              height={11}
              rx={5.5}
              fill="none"
              stroke={accentColor}
              strokeWidth={1}
              strokeDasharray="2 2"
              strokeOpacity={0.55}
            />
            {fallbackPara.map((p, i) => (
              <rect
                key={`ghost-${i}`}
                x={0}
                y={p.y - padIn}
                width={p.w}
                height={7}
                rx={3.5}
                fill="none"
                stroke={accentColor}
                strokeWidth={1}
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              />
            ))}
            {/* Solid final layout, shifted down by dy. */}
            <rect x={0} y={9} width={headlineW} height={11} rx={5.5} fill="var(--foreground)" fillOpacity={0.85} />
            {fallbackPara.map((p, i) => (
              <rect
                key={`solid-${i}`}
                x={0}
                y={p.y - padIn + dy}
                width={p.w}
                height={7}
                rx={3.5}
                fill="var(--muted)"
              />
            ))}
            {/* Measurement bracket between old and new body-line position. */}
            <line
              x1={bracketX}
              y1={oldMidY}
              x2={bracketX}
              y2={newMidY}
              stroke={accentColor}
              strokeWidth={1.25}
              strokeLinecap="round"
              markerStart={`url(#${tickMarkerId})`}
              markerEnd={`url(#${tickMarkerId})`}
            />
          </g>
        </BrowserMockup>
        {/* Tint the after-mockup's frame with the row's status color instead
            of BrowserMockup's neutral accent border. */}
        <rect
          x={x}
          y={y}
          width={mockupW}
          height={mockupH}
          rx={6}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
        />
        <text
          x={x + mockupW / 2}
          y={y + mockupH + 14}
          fontSize={9}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          {swapMs}ms — {customLabel}
        </text>
      </g>
    );
  }

  function lane(
    panelTop: number,
    tint: string,
    Icon: typeof WarningCircle,
    label: string,
    rightCaption: string,
    headlineW: number,
    dy: number,
    clsLabel: string,
    tickMarkerId: string,
  ) {
    const mockupY = panelTop + 34;
    const bracketLocalX = padIn + contentW + 4;
    const oldMidY = mockupY + chromeH + (fallbackPara[0].y - padIn + 3.5);
    const newMidY = oldMidY + dy;
    const pillCx = mockup2X + bracketLocalX + 30;
    const pillCy = (oldMidY + newMidY) / 2;
    const label9w = pillW(clsLabel);

    return (
      <g>
        <rect x={panelX} y={panelTop} width={panelW} height={panelH} rx={14} fill={tint} fillOpacity={0.05} />
        <rect x={panelX} y={panelTop} width={panelW} height={panelH} rx={14} fill="url(#fsr-dots)" fillOpacity={0.5} />

        <Icon x={mockup1X - 2} y={panelTop + 14} size={13} color={tint} />
        <text
          x={mockup1X + 16}
          y={panelTop + 24}
          fontSize={10}
          fontWeight={600}
          fill="var(--muted)"
          fontFamily="var(--font-sans), system-ui"
          letterSpacing={1}
        >
          {label}
        </text>
        <text
          x={width - leftPad}
          y={panelTop + 24}
          fontSize={9.5}
          fill="var(--muted)"
          textAnchor="end"
          fontFamily="var(--font-sans), system-ui"
        >
          {rightCaption}
        </text>

        {fallbackMockup(mockup1X, mockupY)}

        {/* Dashed arrow: fallback -> swap, carrying the shared timing label. */}
        <path
          d={`M ${mockup1X + mockupW + 4} ${mockupY + chromeH + 20} L ${mockup2X - 4} ${mockupY + chromeH + 20}`}
          stroke="var(--muted)"
          strokeWidth={1}
          strokeDasharray="1 4"
          strokeLinecap="round"
          markerEnd="url(#fsr-arrow)"
        />
        <rect
          x={mockup1X + mockupW + (gapW - (swapLabel.length * SANS_9 + 16)) / 2}
          y={mockupY + chromeH + 20 - 9}
          width={swapLabel.length * SANS_9 + 16}
          height={16}
          rx={8}
          fill="var(--elevated)"
          stroke="var(--border)"
          strokeWidth={1}
        />
        <text
          x={mockup1X + mockupW + gapW / 2}
          y={mockupY + chromeH + 20 + 3.5}
          fontSize={8.5}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          {swapLabel}
        </text>

        {afterMockup(mockup2X, mockupY, headlineW, dy, tint, tickMarkerId)}

        {/* CLS readout, connected to the in-mockup bracket by a short leader. */}
        <line
          x1={mockup2X + bracketLocalX}
          y1={pillCy}
          x2={pillCx - label9w / 2}
          y2={pillCy}
          stroke={tint}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="1 3"
        />
        <rect
          x={pillCx - label9w / 2}
          y={pillCy - 9}
          width={label9w}
          height={18}
          rx={9}
          fill="var(--elevated)"
          stroke={tint}
          strokeWidth={1}
        />
        <text
          x={pillCx}
          y={pillCy + 3.5}
          fontSize={9.5}
          fontWeight={600}
          fill="var(--mark)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {clsLabel}
        </text>
      </g>
    );
  }

  const ticks = [
    { ms: 0, x: mockup1X + mockupW / 2, label: "0ms" },
    { ms: loadMs, x: mockup2X + mockupW / 2, label: `${swapMs}ms` },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `Two rows share one time axis running from 0 to ${swapMs} milliseconds, each showing a mini browser page ` +
        `before and after a font swap. In both rows a page paints at 0 milliseconds with the ${fallbackLabel} ` +
        `fallback font, ${customLabel} finishes loading at ${loadMs} milliseconds, and the swap fires and repaints ` +
        `at ${swapMs} milliseconds — the timing is identical between the two rows. The top row, using an ` +
        `unmatched fallback, shows a large reflow at the swap: a dashed ghost marks where the headline and body ` +
        `lines sat before, and the solid headline grows much wider while the body lines drop noticeably lower, ` +
        `measured by a bracket reading a cumulative layout shift of ${clsMismatched}. The bottom row, using a ` +
        `fallback with metrics adjusted to closely match the real font, shows the same swap at the same instant but ` +
        `the ghost and the solid layout nearly coincide — the headline barely widens and the body lines barely ` +
        `move, measured at a cumulative layout shift of only ${clsMatched}. The lesson this draws out: next/font ` +
        `does not eliminate the swap, it shrinks the size of the reflow the swap causes.`
      }
    >
      <defs>
        <pattern id="fsr-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <marker id="fsr-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="fsr-tick-bad" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M1,0.5 L1,6.5" stroke="var(--bad)" strokeWidth="1" />
        </marker>
        <marker id="fsr-tick-good" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M1,0.5 L1,6.5" stroke="var(--good)" strokeWidth="1" />
        </marker>
        <linearGradient id="fsr-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fsr-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {lane(
        laneAPanelTop,
        "var(--bad)",
        WarningCircle,
        "MISMATCHED FALLBACK",
        "large reflow at swap",
        rowAHeadlineW,
        rowADy,
        clsLabelA,
        "fsr-tick-bad",
      )}
      {lane(
        laneBPanelTop,
        "var(--good)",
        CheckCircle,
        "METRICS-MATCHED FALLBACK",
        "reflow barely visible",
        rowBHeadlineW,
        rowBDy,
        clsLabelB,
        "fsr-tick-good",
      )}

      {/* Shared time axis: same two x-positions under both rows. */}
      <line
        x1={leftPad - 10}
        y1={axisY}
        x2={ticks[0].x}
        y2={axisY}
        stroke="url(#fsr-fade-left)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1={ticks[0].x}
        y1={axisY}
        x2={ticks[1].x}
        y2={axisY}
        stroke="var(--border)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1={ticks[1].x}
        y1={axisY}
        x2={ticks[1].x + 20}
        y2={axisY}
        stroke="url(#fsr-fade-right)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      {ticks.map((t) => (
        <g key={t.ms}>
          <line
            x1={t.x}
            y1={laneAPanelTop}
            x2={t.x}
            y2={axisY}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="1 4"
            strokeLinecap="round"
            opacity={0.5}
          />
          <line x1={t.x} y1={axisY} x2={t.x} y2={axisY + 5} stroke="var(--border)" strokeWidth={1.25} strokeLinecap="round" />
          <text
            x={t.x}
            y={axisY + 18}
            fontSize={9.5}
            fill="var(--muted)"
            textAnchor="middle"
            fontFamily="var(--font-sans), system-ui"
          >
            {t.label}
          </text>
        </g>
      ))}
      <Clock x={leftPad - 10} y={axisY + 8} size={12} color="var(--muted)" />

      <text
        x={width / 2}
        y={height - 8}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {caption}
      </text>
    </svg>
  );
}
