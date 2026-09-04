"use client";

import { ChartBar, Cursor, Package } from "@phosphor-icons/react";

export interface DynamicImportTimingDiagramProps {
  /** Label for the small always-shipped part of the initial bundle. */
  mainBundleLabel?: string;
  /** Label for the deferred component's JS chunk. */
  chunkLabel?: string;
  /** When (ms on the shared axis) the user click happens. */
  clickAtMs?: number;
  /** Total axis span in ms. */
  totalMs?: number;
}

/**
 * The lesson's actual claim is about *when* a JS chunk crosses the network,
 * not about the sequence of on-screen events — so this is drawn as two
 * lanes sharing one literal time axis, the same shape as
 * `FetchWaterfallTimelineDiagram`, rather than another labeled-box chain.
 *
 * Top lane: a plain `import AnalyticsChart from "./AnalyticsChart"` — the
 * chunk is bundled into the initial download and starts fetching at t=0
 * regardless of the `show` state, which never even appears on this lane's
 * axis because it has no effect on the network. Bottom lane: `next/dynamic`
 * — only the small main bundle downloads at t=0; the chart chunk's bar
 * doesn't exist on the timeline at all until a click event fires partway
 * through, and only then does it start. Stacking both lanes on the same
 * axis makes the one thing prose struggles to convey obvious at a glance:
 * the conditional `{show && ...}` in the top lane changes nothing about
 * when bytes move, while `dynamic()` in the bottom lane visibly moves the
 * chunk's bar to start later, anchored to the click marker instead of t=0.
 */
export function DynamicImportTimingDiagram({
  mainBundleLabel = "main bundle",
  chunkLabel = "AnalyticsChart.js",
  clickAtMs = 3000,
  totalMs = 6000,
}: DynamicImportTimingDiagramProps) {
  const MONO_11 = 6.7;
  const SANS_11 = 6.2;
  const SANS_95 = 5.35;

  const clickLabel = "user clicks “Show analytics”";
  const axisLabel = "elapsed time";
  const wrongCaption = "plain import — chunk ships regardless of whether show is ever true";
  const rightCaption = "next/dynamic(() => import(...)) — chunk doesn't exist on the wire until the click";
  const footCaption =
    "Conditionally rendering a component only controls when it's displayed — only dynamic() controls when its JS is downloaded.";

  const gutterTextW = Math.max(
    mainBundleLabel.length * MONO_11,
    chunkLabel.length * MONO_11,
    axisLabel.length * SANS_95 + 18,
  );

  const padX = 18;
  const plotX0 = Math.round(padX + gutterTextW + 18);
  const plotW = 380;
  const plotX1 = plotX0 + plotW;
  const rightMargin = Math.ceil((`${totalMs}`.length * SANS_95) / 2) + 30;
  const width = Math.round(
    Math.max(
      plotX1 + rightMargin,
      wrongCaption.length * SANS_95 + 2 * padX + 8,
      rightCaption.length * SANS_95 + 2 * padX + 8,
      footCaption.length * SANS_95 + 2 * padX + 8,
    ),
  );

  const msToX = (ms: number) => plotX0 + (ms / totalMs) * plotW;

  const barH = 26;
  const panelA = { y: 34, h: 90 };
  const rowA1 = 48;
  const rowA2 = 84;
  const panelB = { y: 184, h: 118 };
  const rowB1 = 226;
  const rowB2 = 268;
  const axisY = 322;
  const height = 364;

  const panelX = padX;
  const panelW = width - 2 * padX;
  const gutterRight = plotX0 - 14;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * totalMs));

  // Top lane: both bundled together, both start at t=0. The chunk is drawn
  // as the same width as a real dynamic-import chunk (below) so the only
  // visual difference between the lanes is *when* it starts, not its size.
  const mainW0 = msToX(900) - msToX(0);
  const chunkDurMs = 1400;
  const wrongChunkW = msToX(chunkDurMs) - msToX(0);

  // Bottom lane: main bundle is smaller (chart excluded), then nothing
  // until the click, then the chunk starts exactly at the click marker.
  const mainWDeferred = msToX(500) - msToX(0);
  const chunkStart = clickAtMs;
  const chunkEnd = Math.min(chunkStart + chunkDurMs, totalMs);
  const deferredChunkW = msToX(chunkEnd) - msToX(chunkStart);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `Two network timelines sharing one axis from 0 to ${totalMs} milliseconds, contrasting a plain import with next/dynamic. ` +
        `In the top lane, a plain "import AnalyticsChart" statement, both the ${mainBundleLabel} and the ${chunkLabel} chunk start ` +
        `downloading together at 0 milliseconds — the chunk's bar sits right next to the main bundle's bar from the very start, ` +
        `with no marker for whether the user ever clicks, because the conditional render has no effect on the network at all. ` +
        `In the bottom lane, the same component wrapped in next/dynamic, only a smaller ${mainBundleLabel} bar downloads at 0 ` +
        `milliseconds; there is a visibly empty gap on the timeline with no chunk bar at all until a click event marker at ` +
        `${clickAtMs} milliseconds, and only at that point does the ${chunkLabel} bar begin, running from ${clickAtMs} to ` +
        `${chunkEnd} milliseconds. The two lanes make the one difference visible: the same chunk's bar starts at the same left ` +
        `edge in the top lane no matter what, but is anchored to the click marker instead of zero in the bottom lane.`
      }
    >
      <defs>
        <pattern id="dit-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="dit-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="dit-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---- Lane A: plain import (wrong) ---- */}
      <Package x={padX} y={15} size={13} color="var(--bad)" />
      <text
        x={padX + 18}
        y={26}
        fontSize={10}
        fontWeight={600}
        fill="var(--bad)"
        fontFamily="var(--font-sans), system-ui"
        letterSpacing={1.2}
      >
        PLAIN IMPORT
      </text>
      <text
        x={width - padX}
        y={26}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {wrongCaption}
      </text>

      <rect x={panelX} y={panelA.y} width={panelW} height={panelA.h} rx={12} fill="var(--surface)" />
      <rect
        x={panelX}
        y={panelA.y}
        width={panelW}
        height={panelA.h}
        rx={12}
        fill="url(#dit-dots)"
        fillOpacity={0.5}
      />

      {/* ---- Lane B: next/dynamic (correct) ---- */}
      <ChartBar x={padX} y={165} size={13} color="var(--accent)" weight="fill" />
      <text
        x={padX + 18}
        y={176}
        fontSize={10}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
        letterSpacing={1.2}
      >
        NEXT/DYNAMIC
      </text>
      <text
        x={width - padX}
        y={176}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {rightCaption}
      </text>

      <rect
        x={panelX}
        y={panelB.y}
        width={panelW}
        height={panelB.h}
        rx={12}
        fill="var(--accent)"
        fillOpacity={0.06}
      />
      <rect
        x={panelX}
        y={panelB.y}
        width={panelW}
        height={panelB.h}
        rx={12}
        fill="url(#dit-dots)"
        fillOpacity={0.5}
      />

      {/* Shared gridlines across both lanes and the axis below them. */}
      {ticks.map((t) => (
        <line
          key={`grid-${t}`}
          x1={msToX(t)}
          y1={panelA.y}
          x2={msToX(t)}
          y2={axisY}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="1 4"
          strokeLinecap="round"
        />
      ))}

      {/* Lane A: both bars start at 0, back-to-back — the chunk ships no
          matter what `show` is, so there is nothing on this axis tied to
          user interaction at all. */}
      <text
        x={gutterRight}
        y={rowA1 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {mainBundleLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowA1}
        width={mainW0}
        height={barH}
        rx={12}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />

      <text
        x={gutterRight}
        y={rowA2 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {chunkLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowA2}
        width={wrongChunkW}
        height={barH}
        rx={12}
        fill="none"
        stroke="var(--bad)"
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />
      <text
        x={msToX(0) + wrongChunkW / 2}
        y={rowA2 + barH / 2 + 4}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--bad)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {chunkDurMs} ms
      </text>
      <text
        x={msToX(0) + wrongChunkW + 8}
        y={rowA2 + barH / 2 + 4}
        fontSize={9.5}
        fill="var(--bad)"
        fontFamily="var(--font-sans), system-ui"
      >
        ships at t=0 regardless of show
      </text>

      {/* Lane B: smaller main bundle at 0, then a real gap, then the chunk
          starts exactly at the click marker — the load-bearing contrast. */}
      <text
        x={gutterRight}
        y={rowB1 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {mainBundleLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowB1}
        width={mainWDeferred}
        height={barH}
        rx={12}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={msToX(0) + mainWDeferred + 8}
        y={rowB1 + barH / 2 + 4}
        fontSize={9.5}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
      >
        AnalyticsChart excluded
      </text>

      {/* The click event marker — a vertical line the chunk bar is anchored
          to, not to t=0. */}
      <line
        x1={msToX(clickAtMs)}
        y1={rowB1 - 6}
        x2={msToX(clickAtMs)}
        y2={rowB2 + barH + 6}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <circle cx={msToX(clickAtMs)} cy={rowB1 - 6} r={9} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <Cursor
        x={msToX(clickAtMs) - 5}
        y={rowB1 - 11}
        size={10}
        color="var(--mark)"
        weight="fill"
      />
      <rect
        x={msToX(clickAtMs) - (clickLabel.length * SANS_95) / 2 - 8}
        y={rowB1 - 34}
        width={clickLabel.length * SANS_95 + 16}
        height={16}
        rx={8}
        fill="var(--elevated)"
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <text
        x={msToX(clickAtMs)}
        y={rowB1 - 22.5}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {clickLabel}
      </text>

      <text
        x={gutterRight}
        y={rowB2 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {chunkLabel}
      </text>
      {/* Nothing on the wire for this row before the click — drawn as
          genuinely empty track, not even a placeholder outline. */}
      <rect
        x={msToX(clickAtMs)}
        y={rowB2}
        width={deferredChunkW}
        height={barH}
        rx={12}
        fill="var(--accent)"
        fillOpacity={0.16}
      />
      <rect
        x={msToX(clickAtMs)}
        y={rowB2}
        width={deferredChunkW}
        height={barH}
        rx={12}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <text
        x={msToX(clickAtMs) + deferredChunkW / 2}
        y={rowB2 + barH / 2 + 4}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {chunkDurMs} ms
      </text>
      <text
        x={msToX(clickAtMs) + deferredChunkW + 8}
        y={rowB2 + barH / 2 + 4}
        fontSize={9.5}
        fill="var(--mark)"
        fontFamily="var(--font-sans), system-ui"
      >
        starts only now
      </text>

      {/* ---- Shared time axis ---- */}
      <line
        x1={plotX0 - 16}
        y1={axisY}
        x2={plotX0}
        y2={axisY}
        stroke="url(#dit-fade-left)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1={plotX0}
        y1={axisY}
        x2={plotX1}
        y2={axisY}
        stroke="var(--border)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1={plotX1}
        y1={axisY}
        x2={plotX1 + 12}
        y2={axisY}
        stroke="url(#dit-fade-right)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      {ticks.map((t) => (
        <g key={`tick-${t}`}>
          <line
            x1={msToX(t)}
            y1={axisY}
            x2={msToX(t)}
            y2={axisY + 5}
            stroke="var(--border)"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <text
            x={msToX(t)}
            y={axisY + 18}
            fontSize={9.5}
            fill="var(--muted)"
            textAnchor="middle"
            fontFamily="var(--font-sans), system-ui"
          >
            {t}
          </text>
        </g>
      ))}
      <text
        x={gutterRight}
        y={axisY + 18}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {axisLabel}
      </text>

      <text
        x={width / 2}
        y={height - 10}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {footCaption}
      </text>
    </svg>
  );
}
