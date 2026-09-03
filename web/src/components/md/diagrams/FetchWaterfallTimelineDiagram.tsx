"use client";

import { Clock, Hourglass, Lightning } from "@phosphor-icons/react";

export interface FetchWaterfallTimelineDiagramProps {
  /** Label for the first request (the one nothing waits on). */
  firstLabel?: string;
  /** Label for the second request (the one wrongly serialised behind the first). */
  secondLabel?: string;
  /** Duration of the first request, in milliseconds. */
  firstMs?: number;
  /** Duration of the second request, in milliseconds. */
  secondMs?: number;
}

/**
 * Sequential `await`s vs. `Promise.all`, drawn as a real waterfall against a
 * shared time axis rather than two cards restating the numbers in prose.
 *
 * The whole argument of the lesson is a *length* comparison: the two total
 * bars sit one above the other on the same millisecond scale, so the
 * sequential bar is visibly twice the parallel one before the reader has
 * read a single number. The second lane also draws the thing the numbers
 * alone hide — the dead span where `getPosts` is merely *blocked*, not
 * working — which is exactly the waste `Promise.all` recovers.
 *
 * Everything is positioned through `msToX`, so changing the props moves the
 * bars, the gridlines and the totals together and the picture stays honest.
 */
export function FetchWaterfallTimelineDiagram({
  firstLabel = "getUser()",
  secondLabel = "getPosts()",
  firstMs = 300,
  secondMs = 300,
}: FetchWaterfallTimelineDiagramProps) {
  const sequentialMs = firstMs + secondMs;
  const parallelMs = Math.max(firstMs, secondMs);
  const savedMs = sequentialMs - parallelMs;

  // Approximate advance widths at the sizes actually used below, so the
  // viewBox is derived from the real longest string rather than guessed.
  const MONO_11 = 6.7;
  const SANS_11 = 6.2;
  const SANS_95 = 5.35;

  const seqTotalLabel = `${sequentialMs} ms total`;
  const parTotalLabel = `${parallelMs} ms total`;
  const axisLabel = "elapsed ms";
  const caption =
    "Sequential total = both requests added up. Promise.all total = the slower request alone.";
  const blockedLabel = `blocked — waiting on ${firstLabel}`;
  const savedLabel = `≈ ${savedMs} ms saved`;

  // Gutter must hold every left-hand label: request names, both totals, and
  // the axis caption (which also carries a 16px icon).
  const gutterTextW = Math.max(
    firstLabel.length * MONO_11,
    secondLabel.length * MONO_11,
    seqTotalLabel.length * SANS_11,
    parTotalLabel.length * SANS_11,
    axisLabel.length * SANS_95 + 18,
  );

  const padX = 18;
  const plotX0 = Math.round(padX + gutterTextW + 18);
  const plotW = 380;
  const plotX1 = plotX0 + plotW;
  // Right margin holds half of the final tick label ("600") plus enough
  // breathing room that the full-length sequential bar doesn't touch the
  // panel edge it sits inside.
  const rightMargin = Math.ceil((`${sequentialMs}`.length * SANS_95) / 2) + 30;
  const width = Math.round(
    Math.max(plotX1 + rightMargin, caption.length * SANS_95 + 2 * padX + 8),
  );

  const msToX = (ms: number) => plotX0 + (ms / sequentialMs) * plotW;

  const barH = 26;
  const panelA = { y: 34, h: 90 };
  const rowA1 = 48;
  const rowA2 = 84;
  const totalA = 132;
  const panelB = { y: 184, h: 90 };
  const rowB1 = 198;
  const rowB2 = 234;
  const totalB = 282;
  const totalH = 10;
  const axisY = 310;
  const height = 352;

  const panelX = padX;
  const panelW = width - 2 * padX;
  const gutterRight = plotX0 - 14;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * sequentialMs));

  const blockedW = msToX(firstMs) - plotX0;
  const savedW = msToX(sequentialMs) - msToX(parallelMs);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `Two request waterfalls drawn against one shared time axis running from 0 to ${sequentialMs} milliseconds. ` +
        `In the top lane, written as two sequential awaits, ${firstLabel} runs from 0 to ${firstMs} milliseconds and ` +
        `${secondLabel} cannot start until it finishes, so ${secondLabel} sits blocked and idle for that whole first ` +
        `stretch and only runs from ${firstMs} to ${sequentialMs} milliseconds; the two bars never overlap and the ` +
        `total bar spans the full axis at ${sequentialMs} milliseconds. In the bottom lane, written as Promise.all, ` +
        `both bars start at the same 0 millisecond position and run side by side, finishing together at ` +
        `${parallelMs} milliseconds, so the total bar reaches only halfway across the axis. The empty stretch beyond ` +
        `it, roughly ${savedMs} milliseconds, is time the sequential version spent waiting rather than fetching.`
      }
    >
      <defs>
        <pattern id="fwt-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="fwt-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fwt-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---- Lane A: sequential awaits ---- */}
      <Hourglass x={padX} y={15} size={13} color="var(--muted)" />
      <text
        x={padX + 18}
        y={26}
        fontSize={10}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
        letterSpacing={1.2}
      >
        SEQUENTIAL
      </text>
      <text
        x={width - padX}
        y={26}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        each await blocks the next line
      </text>

      <rect x={panelX} y={panelA.y} width={panelW} height={panelA.h} rx={12} fill="var(--surface)" />
      <rect
        x={panelX}
        y={panelA.y}
        width={panelW}
        height={panelA.h}
        rx={12}
        fill="url(#fwt-dots)"
        fillOpacity={0.5}
      />

      {/* ---- Lane B: Promise.all ---- */}
      <Lightning x={padX} y={165} size={13} color="var(--accent)" weight="fill" />
      <text
        x={padX + 18}
        y={176}
        fontSize={10}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
        letterSpacing={1.2}
      >
        PROMISE.ALL
      </text>
      <text
        x={width - padX}
        y={176}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        both requests start at 0 ms
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
        fill="url(#fwt-dots)"
        fillOpacity={0.5}
      />

      {/* Shared gridlines — the only reason the two lanes are comparable. */}
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

      {/* Lane A bars: end to end, never overlapping. */}
      <text
        x={gutterRight}
        y={rowA1 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {firstLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowA1}
        width={msToX(firstMs) - msToX(0)}
        height={barH}
        rx={12}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={(msToX(0) + msToX(firstMs)) / 2}
        y={rowA1 + barH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {firstMs} ms
      </text>

      <text
        x={gutterRight}
        y={rowA2 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {secondLabel}
      </text>
      {/* The dead span: not working, just waiting for the await above. */}
      <rect
        x={msToX(0)}
        y={rowA2}
        width={blockedW}
        height={barH}
        rx={12}
        fill="none"
        stroke="var(--bad)"
        strokeWidth={1}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
      <text
        x={msToX(0) + blockedW / 2}
        y={rowA2 + barH / 2 + 3.5}
        fontSize={9.5}
        fill="var(--bad)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {blockedLabel.length * SANS_95 < blockedW - 16 ? blockedLabel : "blocked"}
      </text>
      <rect
        x={msToX(firstMs)}
        y={rowA2}
        width={msToX(sequentialMs) - msToX(firstMs)}
        height={barH}
        rx={12}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={(msToX(firstMs) + msToX(sequentialMs)) / 2}
        y={rowA2 + barH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {secondMs} ms
      </text>

      {/* Lane A total. */}
      <text
        x={gutterRight}
        y={totalA + totalH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {seqTotalLabel}
      </text>
      <rect
        x={msToX(0)}
        y={totalA}
        width={msToX(sequentialMs) - msToX(0)}
        height={totalH}
        rx={5}
        fill="var(--muted)"
        fillOpacity={0.45}
      />

      {/* Lane B bars: both start at 0, overlapping in time. */}
      <text
        x={gutterRight}
        y={rowB1 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {firstLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowB1}
        width={msToX(firstMs) - msToX(0)}
        height={barH}
        rx={12}
        fill="var(--accent)"
        fillOpacity={0.16}
      />
      <rect
        x={msToX(0)}
        y={rowB1}
        width={msToX(firstMs) - msToX(0)}
        height={barH}
        rx={12}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <text
        x={(msToX(0) + msToX(firstMs)) / 2}
        y={rowB1 + barH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {firstMs} ms
      </text>

      <text
        x={gutterRight}
        y={rowB2 + barH / 2 + 4}
        fontSize={11}
        fill="var(--foreground)"
        textAnchor="end"
        fontFamily="var(--font-mono), monospace"
      >
        {secondLabel}
      </text>
      <rect
        x={msToX(0)}
        y={rowB2}
        width={msToX(secondMs) - msToX(0)}
        height={barH}
        rx={12}
        fill="var(--accent)"
        fillOpacity={0.16}
      />
      <rect
        x={msToX(0)}
        y={rowB2}
        width={msToX(secondMs) - msToX(0)}
        height={barH}
        rx={12}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <text
        x={(msToX(0) + msToX(secondMs)) / 2}
        y={rowB2 + barH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {secondMs} ms
      </text>

      {/* Lane B total, plus the stretch it never needed to spend. */}
      <text
        x={gutterRight}
        y={totalB + totalH / 2 + 4}
        fontSize={11}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="end"
        fontFamily="var(--font-sans), system-ui"
      >
        {parTotalLabel}
      </text>
      <rect
        x={msToX(0)}
        y={totalB}
        width={msToX(parallelMs) - msToX(0)}
        height={totalH}
        rx={5}
        fill="var(--accent)"
      />
      <rect
        x={msToX(parallelMs)}
        y={totalB - 1}
        width={savedW}
        height={totalH + 2}
        rx={6}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
      <rect
        x={msToX(parallelMs) + savedW / 2 - (savedLabel.length * SANS_95) / 2 - 8}
        y={totalB - 24}
        width={savedLabel.length * SANS_95 + 16}
        height={16}
        rx={8}
        fill="var(--elevated)"
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <text
        x={msToX(parallelMs) + savedW / 2}
        y={totalB - 12.5}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {savedLabel}
      </text>

      {/* ---- Shared time axis ---- */}
      <line
        x1={plotX0 - 16}
        y1={axisY}
        x2={plotX0}
        y2={axisY}
        stroke="url(#fwt-fade-left)"
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
        stroke="url(#fwt-fade-right)"
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
      <Clock x={gutterRight - axisLabel.length * SANS_95 - 16} y={axisY + 8} size={12} color="var(--muted)" />
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
        {caption}
      </text>
    </svg>
  );
}
