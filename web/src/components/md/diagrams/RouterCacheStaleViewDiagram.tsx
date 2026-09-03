"use client";

import {
  ArrowClockwise,
  ArrowsClockwise,
  Database,
  Prohibit,
} from "@phosphor-icons/react";

import {
  BrowserMockup,
  FilledRow,
  SkeletonRow,
} from "@/components/md/diagrams/BrowserMockup";

/**
 * The Router Cache's actual symptom, drawn as what the user SEES rather than
 * as a four-step label chain.
 *
 * One server-truth lane at the top (the mutation already committed — the
 * database is archived for the whole span below), and two snapshots of the
 * SAME document underneath it. The causal core is the pair of droplines: the
 * server state is identical for both snapshots, and the only difference is
 * whether the browser ever asked for it again. Snapshot 1's dropline stops
 * dead at a "no request" marker — the fresh row never travels — so the
 * client's cached pre-mutation snapshot is still on screen. Snapshot 2's
 * dropline completes, because `router.refresh()` issued the re-fetch.
 *
 * The "no full reload" claim is made visible rather than asserted: chrome,
 * title bar, the two unchanged rows and the scroll thumb are drawn in
 * identical positions across snapshots 1 and 2 (with a tie-line across the
 * gap), and the counterexample below shows `location.reload()` painting the
 * same route as skeletons with the scroll thumb snapped back to the top.
 */
export interface RouterCacheStaleViewDiagramProps {
  /** Route shown in each browser's address bar. */
  url?: string;
  /** The two rows that survive the mutation, identical in both snapshots. */
  keptRows?: [string, string];
  /** The row the mutation removed server-side but the Router Cache still shows. */
  staleRow?: string;
}

/**
 * Conservative advance-width estimates. The viewBox is derived from these so a
 * longer prop or caption widens the canvas instead of clipping off the right
 * edge (the bug that shipped in FileTreeDiagram, where only some of the text
 * was counted).
 */
const sansW = (s: string, size: number) => s.length * size * 0.55;
const monoW = (s: string, size: number) => s.length * size * 0.6;

export function RouterCacheStaleViewDiagram({
  url = "app.com/tasks",
  keptRows = ["Ship v2 landing", "Fix login redirect"],
  staleRow = "Archive backlog",
}: RouterCacheStaleViewDiagramProps) {
  const PAD = 26;
  const BW = 250; // browser width
  const BH = 150; // browser height (18px chrome + 132px viewport)
  const CH = 18; // BrowserMockup's chrome height
  const GAP = 108; // room for the router.refresh() pill between snapshots

  const b1x = PAD;
  const b2x = PAD + BW + GAP;
  const b1cx = b1x + BW / 2;
  const b2cx = b2x + BW / 2;

  const laneY = 44;
  const laneH = 42;
  const browsersY = 138;
  const browsersBottom = browsersY + BH;

  const reloadHeadingY = 348;
  const b3y = 360;
  const b3h = 132;

  // Text that drives the canvas width, measured rather than guessed.
  const laneLeft = "SERVER · archiveTask(42) has already committed";
  const laneBadge = "task 42 · archived";
  const heading = "If the fix were location.reload() instead, the same route repaints from zero:";
  const reloadNotes = [
    "The whole document is torn down and re-requested.",
    "The user sees a blank flash, the scroll position",
    "resets to the top, and open modals are destroyed.",
  ];
  const b1Caption = ["Snapshot 1 — right after the", "mutation. No request was made."];
  const b2Caption = ["Snapshot 2 — after router.refresh().", "Same document, re-fetched data."];
  const footer =
    "Identical server truth in both snapshots — only snapshot 2 asked for it again.";

  const rowWidth = PAD + BW + GAP + BW + PAD;
  const notesWidth =
    PAD + BW + 26 + Math.max(...reloadNotes.map((n) => sansW(n, 9.5))) + PAD;
  const headingWidth = PAD * 2 + sansW(heading, 10);
  const footerWidth = PAD * 2 + sansW(footer, 9.5);
  const laneWidth =
    PAD * 2 + 22 + sansW(laneLeft, 9.5) + 40 + monoW(laneBadge, 9) + 34;
  const captionWidth =
    PAD * 2 +
    GAP +
    2 * Math.max(...[...b1Caption, ...b2Caption].map((c) => sansW(c, 9)));

  const width = Math.ceil(
    Math.max(rowWidth, notesWidth, headingWidth, footerWidth, laneWidth, captionWidth),
  );
  const height = 520;

  const laneRight = width - PAD;
  const badgeW = monoW(laneBadge, 9) + 30;
  const badgeX = laneRight - 16 - badgeW;

  // Row geometry inside a browser viewport (children are already translated
  // to the viewport's top-left by BrowserMockup).
  const rowX = 14;
  const rowW = BW - 38; // leaves a gutter for the scrollbar track
  const rowH = 24;
  const rowYs = [34, 62, 90];
  const trackX = BW - 11;

  const gapMid = (b1x + BW + b2x) / 2;

  const scrollTrack = (contentH: number, thumbY: number) => (
    <>
      <rect x={trackX} y={8} width={4} height={contentH - 16} rx={2} fill="var(--border)" />
      <rect x={trackX} y={thumbY} width={4} height={44} rx={2} fill="var(--muted)" fillOpacity={0.45} />
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        "The mutation has already committed on the server — the top lane shows the database holding task 42 as archived " +
        "for the entire span below. Two snapshots of the same route sit underneath it. In snapshot one, taken right after " +
        "the mutation, the dropline from the server stops at a 'no request' marker: the browser never asked again, so the " +
        "client-side Router Cache is still painting its pre-mutation snapshot and the archived task is still visible in the " +
        "list, flagged as stale. In snapshot two, router.refresh() completes the dropline — the route's data is re-fetched " +
        "and the archived row is gone. The window chrome, the page title, the two unchanged rows and the scroll thumb sit in " +
        "exactly the same positions in both snapshots, because refresh reconciles into the live document rather than " +
        "reloading it. Below, a counterexample shows what location.reload() would do instead: the same route repainted as " +
        "empty skeleton bars with the scroll thumb snapped back to the top — a visible blank flash and lost client state."
      }
    >
      <defs>
        <marker id="rcs-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--accent)" />
        </marker>
        <pattern id="rcs-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="rcs-rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---- Server truth lane: the mutation already happened ---- */}
      <rect x={PAD} y={laneY} width={laneRight - PAD} height={laneH} rx={12} fill="var(--surface)" />
      <rect x={PAD} y={laneY} width={laneRight - PAD} height={laneH} rx={12} fill="url(#rcs-dots)" fillOpacity={0.5} />
      <rect
        x={PAD}
        y={laneY}
        width={laneRight - PAD}
        height={laneH}
        rx={12}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <Database x={PAD + 16} y={laneY + laneH / 2 - 7} size={14} color="var(--muted)" />
      <text
        x={PAD + 38}
        y={laneY + laneH / 2}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--muted)"
        dominantBaseline="central"
        fontFamily="var(--font-sans), system-ui"
        letterSpacing={0.6}
      >
        {laneLeft}
      </text>
      <rect
        x={badgeX}
        y={laneY + laneH / 2 - 9}
        width={badgeW}
        height={18}
        rx={9}
        fill="var(--elevated)"
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <text
        x={badgeX + badgeW / 2}
        y={laneY + laneH / 2}
        fontSize={9}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono), monospace"
      >
        {laneBadge}
      </text>

      {/* ---- Dropline 1: the fresh row never travels ---- */}
      <line
        x1={b1cx}
        y1={laneY + laneH}
        x2={b1cx}
        y2={100}
        stroke="var(--bad)"
        strokeWidth={1.25}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <rect x={b1cx - 40} y={100} width={80} height={18} rx={9} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1} />
      <Prohibit x={b1cx - 32} y={104.5} size={10} color="var(--bad)" />
      <text
        x={b1cx + 10}
        y={109}
        fontSize={8.5}
        fontWeight={600}
        fill="var(--bad)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans), system-ui"
      >
        no request
      </text>

      {/* ---- Dropline 2: router.refresh() completes the path ---- */}
      <line
        x1={b2cx}
        y1={laneY + laneH}
        x2={b2cx}
        y2={100}
        stroke="var(--accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1={b2cx}
        y1={118}
        x2={b2cx}
        y2={browsersY - 4}
        stroke="var(--accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
        markerEnd="url(#rcs-arrow-accent)"
      />
      <rect x={b2cx - 40} y={100} width={80} height={18} rx={9} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
      <ArrowClockwise x={b2cx - 32} y={104.5} size={10} color="var(--accent)" />
      <text
        x={b2cx + 10}
        y={109}
        fontSize={8.5}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans), system-ui"
      >
        re-fetched
      </text>

      {/* ---- Snapshot 1: stale ---- */}
      <BrowserMockup x={b1x} y={browsersY} width={BW} height={BH} url={url}>
        <FilledRow x={rowX} y={12} width={90} height={9} />
        {scrollTrack(BH - CH, 46)}
        {keptRows.map((label, i) => (
          <g key={label}>
            <rect x={rowX} y={rowYs[i]} width={rowW} height={rowH} rx={8} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
            <circle cx={rowX + 12} cy={rowYs[i]! + rowH / 2} r={2.5} fill="var(--muted)" />
            <text
              x={rowX + 22}
              y={rowYs[i]! + rowH / 2}
              fontSize={9.5}
              fill="var(--foreground)"
              dominantBaseline="central"
              fontFamily="var(--font-sans), system-ui"
            >
              {label}
            </text>
          </g>
        ))}
        <rect
          x={rowX}
          y={rowYs[2]}
          width={rowW}
          height={rowH}
          rx={8}
          fill="var(--bad)"
          fillOpacity={0.08}
          stroke="var(--bad)"
          strokeWidth={1.25}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <circle cx={rowX + 12} cy={rowYs[2]! + rowH / 2} r={2.5} fill="var(--bad)" />
        <text
          x={rowX + 22}
          y={rowYs[2]! + rowH / 2}
          fontSize={9.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {staleRow}
        </text>
        <rect
          x={rowX + rowW - 62}
          y={rowYs[2]! + 5}
          width={54}
          height={14}
          rx={7}
          fill="var(--elevated)"
          stroke="var(--bad)"
          strokeWidth={1}
        />
        <text
          x={rowX + rowW - 35}
          y={rowYs[2]! + 12}
          fontSize={8}
          fontWeight={600}
          fill="var(--bad)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          archived
        </text>
        <text x={rowX} y={126} fontSize={9} fontWeight={600} fill="var(--bad)" fontFamily="var(--font-sans), system-ui">
          stale — cached pre-mutation snapshot
        </text>
      </BrowserMockup>

      {/* ---- Snapshot 2: refreshed ---- */}
      <BrowserMockup x={b2x} y={browsersY} width={BW} height={BH} url={url} accent>
        <FilledRow x={rowX} y={12} width={90} height={9} />
        {scrollTrack(BH - CH, 46)}
        {keptRows.map((label, i) => (
          <g key={label}>
            <rect x={rowX} y={rowYs[i]} width={rowW} height={rowH} rx={8} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
            <circle cx={rowX + 12} cy={rowYs[i]! + rowH / 2} r={2.5} fill="var(--muted)" />
            <text
              x={rowX + 22}
              y={rowYs[i]! + rowH / 2}
              fontSize={9.5}
              fill="var(--foreground)"
              dominantBaseline="central"
              fontFamily="var(--font-sans), system-ui"
            >
              {label}
            </text>
          </g>
        ))}
        <rect
          x={rowX}
          y={rowYs[2]}
          width={rowW}
          height={rowH}
          rx={8}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
        <text
          x={rowX + rowW / 2}
          y={rowYs[2]! + rowH / 2}
          fontSize={8.5}
          fill="var(--muted)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          archived row no longer returned
        </text>
        <text x={rowX} y={126} fontSize={9} fontWeight={600} fill="var(--mark)" fontFamily="var(--font-sans), system-ui">
          same document · same scroll · no flash
        </text>
      </BrowserMockup>

      {/* ---- "Nothing else moved" tie-line across the gap, at title-bar height ---- */}
      <line
        x1={b1x + BW}
        y1={browsersY + CH + 16}
        x2={b2x}
        y2={browsersY + CH + 16}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />

      {/* ---- The transition itself ---- */}
      <rect x={gapMid - 47} y={190} width={94} height={18} rx={9} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
      <text
        x={gapMid}
        y={199}
        fontSize={8.5}
        fontWeight={600}
        fill="var(--mark)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono), monospace"
      >
        router.refresh()
      </text>
      <line
        x1={b1x + BW + 8}
        y1={222}
        x2={b2x - 8}
        y2={222}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd="url(#rcs-arrow-accent)"
      />
      <text
        x={gapMid}
        y={240}
        fontSize={8}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        no page reload
      </text>

      {/* ---- Per-snapshot captions ---- */}
      {b1Caption.map((line, i) => (
        <text
          key={line}
          x={b1cx}
          y={browsersBottom + 18 + i * 13}
          fontSize={9}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}
      {b2Caption.map((line, i) => (
        <text
          key={line}
          x={b2cx}
          y={browsersBottom + 18 + i * 13}
          fontSize={9}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}

      {/* ---- Counterexample: what a full reload looks like ---- */}
      <line x1={PAD} y1={332} x2={width - PAD} y2={332} stroke="url(#rcs-rule)" strokeWidth={1} strokeLinecap="round" />
      <text x={PAD} y={reloadHeadingY} fontSize={10} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {heading}
      </text>

      <BrowserMockup x={PAD} y={b3y} width={BW} height={b3h} url={url}>
        <SkeletonRow x={rowX} y={12} width={90} height={9} />
        {scrollTrack(b3h - CH, 8)}
        <SkeletonRow x={rowX} y={38} width={rowW} height={10} />
        <SkeletonRow x={rowX} y={62} width={rowW - 40} height={10} />
        <SkeletonRow x={rowX} y={86} width={rowW - 18} height={10} />
      </BrowserMockup>

      <ArrowsClockwise x={PAD + BW + 26} y={b3y + 24} size={13} color="var(--bad)" />
      <text
        x={PAD + BW + 45}
        y={b3y + 31}
        fontSize={9.5}
        fontWeight={600}
        fill="var(--bad)"
        dominantBaseline="central"
        fontFamily="var(--font-sans), system-ui"
      >
        full document reload
      </text>
      {reloadNotes.map((line, i) => (
        <text
          key={line}
          x={PAD + BW + 26}
          y={b3y + 52 + i * 14}
          fontSize={9.5}
          fill="var(--muted)"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}

      <text
        x={width / 2}
        y={height - 12}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {footer}
      </text>
    </svg>
  );
}
