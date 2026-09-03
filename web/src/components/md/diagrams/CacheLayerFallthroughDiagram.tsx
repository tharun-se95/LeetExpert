"use client";

import { Globe, HardDrives, Layout, Repeat } from "@phosphor-icons/react";

export interface CacheLayerFallthroughDiagramProps {
  /** The route/URL the illustrated request is asking for. */
  route?: string;
  /** Two closing lines under the stack. */
  caption?: [string, string];
}

/* Per-character advance estimates, used to size the viewBox from the actual
   strings rendered rather than from a guessed constant. Deliberately a little
   generous so the widest realistic label still clears its box's padding. */
const CH_TITLE = 7.0; // 13px semibold sans
const CH_CAPTION = 5.0; // 9.5px sans
const CH_PILL = 4.8; // 9px sans inside a pill
const CH_LEAD = 6.3; // 10.5px sans in the entry pill
const CH_BOXHDR = 5.0; // 9.5px sans in the render-pass box header

const PAD = 18; // canvas edge -> content
const GUTTER = 34; // left channel reserved for the dashed write-back path
const BOXPAD = 14; // render-pass box edge -> the gate inside it
/* Gate right edge -> outcome box left edge. Wide enough that the "hit" pill
   can sit in the outer half of the channel: at 78 the pill straddled the
   render-pass box's right border, which reads as the label belonging half to
   the render pass and half to the outside — the exact ambiguity the box exists
   to remove. */
const GAP = 104;
const GH = 66; // gate height
const RH = 56; // outcome box height
const OH = 62; // origin node height
const STEP = 54; // vertical distance between stacked elements (holds a miss pill)

type GateKey = "route" | "memo" | "data";

interface Gate {
  key: GateKey;
  title: string;
  scope: string;
  /** What the caller receives if this layer answers. */
  hitTitle: string;
  /** The lesson's concrete scenario that lands on this layer. */
  hitCaption: string;
  /** Why the request keeps descending when this layer has nothing. */
  miss: string;
}

const GATES: Gate[] = [
  {
    key: "route",
    title: "Full Route Cache",
    scope: "scope: the entire route's rendered output",
    hitTitle: "Prerendered HTML + RSC payload",
    hitCaption: "the route was static — no render runs at all",
    miss: "miss → render the route",
  },
  {
    key: "memo",
    title: "Request Memoization",
    scope: "scope: this one render pass",
    hitTitle: "The first call's value, reused",
    hitCaption: "layout and page asked for the same URL",
    miss: "miss → not seen in this render",
  },
  {
    key: "data",
    title: "Data Cache",
    scope: "scope: server-wide, every user, every request",
    hitTitle: "The stored response body",
    hitCaption: "another user's request, minutes later",
    miss: "miss → nothing stored yet",
  },
];

const BOX_LABEL = "RENDER PASS";
const BOX_NOTE = "discarded the moment the response is sent";
const ORIGIN_TITLE = "One real network / database call";
const ORIGIN_CAPTION = "cold key — nothing above it matched";
const ORIGIN_NOTE = "no layer answered — you pay full cost";
const HIT_PILL = "hit → stop";
const WRITEBACK = "writes back";
const LEAD_PREFIX = "Incoming request for ";

const DEFAULT_CAPTION: [string, string] = [
  "Checked top to bottom: the first layer that hits answers immediately, and every layer below it is never consulted.",
  "Dashed: only a full fall-through does real work, and its result is written back up into the layers that missed.",
];

/**
 * The three server caches drawn as what they actually are — a descent with
 * three exits — instead of three flat bars in a list.
 *
 * One request enters at the top and travels down a single path. Each layer is
 * a gate: a solid accent arrow leaves it to the right (this layer answered,
 * the request stops here) and a muted arrow continues down (this layer had
 * nothing). Only a request that misses all three reaches the origin at the
 * bottom, whose dashed return path populates the layers that missed on the way
 * back out. Reading the picture alone tells you what happens, in what order,
 * and what each outcome costs.
 *
 * The scope distinction the lesson turns on is carried by containment, not by
 * a caption: Request Memoization is drawn *inside* a dotted "render pass" box
 * that begins only after the Full Route Cache misses and ends when the
 * response is sent, while the Data Cache sits outside and below that box —
 * which is exactly why one resets every request and the other does not.
 *
 * Phosphor icon components render their own `<svg>`, which nests validly
 * inside this canvas (SVG allows nested viewports) and takes `x`/`y`/`size`/
 * `color` directly.
 */
export function CacheLayerFallthroughDiagram({
  route = "/products/42",
  caption = DEFAULT_CAPTION,
}: CacheLayerFallthroughDiagramProps = {}) {
  // --accent is the family's UI-safe derived colour: correct for strokes,
  // borders and category icons, but it does not clear the 4.5:1 text floor.
  const accent = "var(--accent)";
  // Any *text* in the accent hue must use --mark, which does clear it.
  const accentText = "var(--mark)";
  const sans = "var(--font-sans), system-ui";
  const mono = "var(--font-mono), monospace";

  // ── Widths, all derived from the strings actually rendered ──────────────
  // Gate box: number badge + icon + title on one row, scope pill beneath.
  const gateW = Math.max(
    ...GATES.map((g) => 42 + g.title.length * CH_TITLE + 18),
    ...GATES.map((g) => 18 + g.scope.length * CH_PILL + 20 + 18),
    42 + ORIGIN_TITLE.length * CH_TITLE + 18,
    18 + ORIGIN_CAPTION.length * CH_CAPTION + 18,
    BOXPAD + BOX_LABEL.length * 7.2 + 12 + BOX_NOTE.length * CH_BOXHDR + BOXPAD,
  );
  const resW = Math.max(
    ...GATES.map((g) => 18 + g.hitTitle.length * CH_TITLE + 18),
    ...GATES.map((g) => 18 + g.hitCaption.length * CH_CAPTION + 18),
    ORIGIN_NOTE.length * CH_PILL + 24,
  );

  const boxX = PAD + GUTTER;
  const gateX = boxX + BOXPAD;
  const resX = gateX + gateW + GAP;
  const width = Math.max(
    resX + resW + PAD,
    ...caption.map((c) => c.length * CH_CAPTION + 2 * PAD),
  );
  const pathX = gateX + gateW / 2; // the descending request path
  const channelX = PAD + 8; // the dashed write-back channel

  // ── Vertical rhythm ────────────────────────────────────────────────────
  const leadY = 10;
  const leadH = 22;
  const gate1Y = leadY + leadH + 16;
  const boxY = gate1Y + GH + STEP;
  const gate2Y = boxY + 34;
  const boxBottom = gate2Y + GH + 16;
  const gate3Y = boxBottom + STEP;
  const originY = gate3Y + GH + STEP;
  const height = originY + OH + 46;

  const gateY: Record<GateKey, number> = { route: gate1Y, memo: gate2Y, data: gate3Y };

  const leadW = (LEAD_PREFIX.length + route.length) * CH_LEAD + 30;
  const hitPillW = HIT_PILL.length * CH_PILL + 20;
  const writebackW = WRITEBACK.length * CH_PILL + 20;
  const originNoteW = ORIGIN_NOTE.length * CH_PILL + 24;

  /** Each miss arrow runs gate-bottom → pill → next-element-top. */
  const missSegments: { from: number; to: number; label: string }[] = [
    { from: gate1Y + GH, to: boxY, label: GATES[0].miss },
    { from: boxBottom, to: gate3Y, label: GATES[1].miss },
    { from: gate3Y + GH, to: originY, label: GATES[2].miss },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `A single server request for ${route} descending through Next.js's three server caches, drawn as three gates on one path rather than as a list. ` +
        "The request meets the Full Route Cache first: if that route's entire rendered output is already stored, the prerendered HTML and RSC payload are returned straight away and no rendering happens at all. " +
        "Only if it misses does a render pass begin, drawn as a dotted box that is created for this request and discarded the moment the response is sent. " +
        "Request Memoization sits inside that box, which is why its scope is a single render: if a layout and a nested page both fetch the same URL during this one render, the second call is answered from the first call's value without a network request. " +
        "If the memo has never seen the URL in this render, the request falls through to the Data Cache, drawn outside and below the render box because it is server-wide and persists across requests and across different users — a hit there returns the stored response body, which is how a second user's request minutes later completes without a fresh fetch. " +
        "Only a request that misses all three reaches the bottom node and does the real work: one actual network or database call. " +
        "Each layer has a second arrow leaving it to the right, showing that whichever layer hits first answers immediately and the layers beneath it are never consulted; a dashed return path runs back up the left side, writing the real call's result into the Data Cache and the memo so the next request stops higher up the stack."
      }
    >
      <defs>
        <marker id="clf-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="clf-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill={accent} />
        </marker>
        <marker id="clf-arrow-insight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--insight)" />
        </marker>
        <pattern id="clf-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="clf-fade-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="0.65" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The request entering the top of the stack */}
      <rect
        x={pathX - leadW / 2}
        y={leadY}
        width={leadW}
        height={leadH}
        rx={leadH / 2}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text x={pathX} y={leadY + 15} fontSize={10.5} textAnchor="middle" fill="var(--muted)" fontFamily={sans}>
        {LEAD_PREFIX}
        <tspan fontFamily={mono} fontWeight={600} fill="var(--foreground)">
          {route}
        </tspan>
      </text>
      <line
        x1={pathX}
        y1={leadY + leadH + 2}
        x2={pathX}
        y2={gate1Y - 5}
        stroke="var(--muted)"
        strokeWidth={1.4}
        strokeLinecap="round"
        markerEnd="url(#clf-arrow-muted)"
      />

      {/* The render pass — a real container, because Request Memoization's
          scope IS this box: it exists only while the box does. */}
      <rect
        x={boxX}
        y={boxY}
        width={gateW + 2 * BOXPAD}
        height={boxBottom - boxY}
        rx={14}
        fill="var(--surface)"
      />
      <rect
        x={boxX}
        y={boxY}
        width={gateW + 2 * BOXPAD}
        height={boxBottom - boxY}
        rx={14}
        fill="url(#clf-dots)"
        fillOpacity={0.5}
      />
      <rect
        x={boxX}
        y={boxY}
        width={gateW + 2 * BOXPAD}
        height={boxBottom - boxY}
        rx={14}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.25}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <text
        x={boxX + BOXPAD}
        y={boxY + 21}
        fontSize={10}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily={sans}
        letterSpacing={1.2}
      >
        {BOX_LABEL}
      </text>
      <text x={boxX + gateW + BOXPAD} y={boxY + 21} fontSize={9.5} fill="var(--muted)" textAnchor="end" fontFamily={sans}>
        {BOX_NOTE}
      </text>

      {/* Fall-through: each miss continues down the same path */}
      {missSegments.map((seg) => {
        const midY = (seg.from + seg.to) / 2;
        const w = seg.label.length * CH_PILL + 20;
        return (
          <g key={seg.label}>
            <line
              x1={pathX}
              y1={seg.from + 3}
              x2={pathX}
              y2={midY - 11}
              stroke="var(--muted)"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <rect
              x={pathX - w / 2}
              y={midY - 9}
              width={w}
              height={18}
              rx={9}
              fill="var(--elevated)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={pathX} y={midY + 3.5} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
              {seg.label}
            </text>
            <line
              x1={pathX}
              y1={midY + 11}
              x2={pathX}
              y2={seg.to - 5}
              stroke="var(--muted)"
              strokeWidth={1.4}
              strokeLinecap="round"
              markerEnd="url(#clf-arrow-muted)"
            />
          </g>
        );
      })}

      {/* The three gates, each with its own exit to the right */}
      {GATES.map((g) => {
        const y = gateY[g.key];
        const midY = y + GH / 2;
        const resY = midY - RH / 2;
        const scopeW = g.scope.length * CH_PILL + 20;
        const Icon = g.key === "route" ? Layout : g.key === "memo" ? Repeat : HardDrives;
        return (
          <g key={g.key}>
            <rect x={gateX} y={y} width={gateW} height={GH} rx={12} fill="var(--elevated)" stroke={accent} strokeWidth={1.5} />
            <Icon x={gateX + 18} y={y + 17} size={15} color={accent} />
            <text x={gateX + 42} y={y + 29} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily={sans}>
              {g.title}
            </text>
            <rect
              x={gateX + 18}
              y={y + 40}
              width={scopeW}
              height={18}
              rx={9}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={gateX + 28} y={y + 52.5} fontSize={9} fill="var(--muted)" fontFamily={sans}>
              {g.scope}
            </text>

            {/* Hit: leaves sideways and the descent stops here */}
            <line
              x1={gateX + gateW + 3}
              y1={midY}
              x2={resX - 5}
              y2={midY}
              stroke={accent}
              strokeWidth={1.6}
              strokeLinecap="round"
              markerEnd="url(#clf-arrow-accent)"
            />
            <rect
              x={resX - 12 - hitPillW}
              y={midY - 27}
              width={hitPillW}
              height={18}
              rx={9}
              fill="var(--elevated)"
              stroke={accent}
              strokeOpacity={0.6}
              strokeWidth={1}
            />
            <text
              x={resX - 12 - hitPillW / 2}
              y={midY - 14.5}
              fontSize={9}
              fontWeight={600}
              fill={accentText}
              textAnchor="middle"
              fontFamily={sans}
            >
              {HIT_PILL}
            </text>

            <rect x={resX} y={resY} width={resW} height={RH} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
            <text x={resX + 18} y={resY + 24} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily={sans}>
              {g.hitTitle}
            </text>
            <text x={resX + 18} y={resY + 41} fontSize={9.5} fill="var(--muted)" fontFamily={sans}>
              {g.hitCaption}
            </text>
          </g>
        );
      })}

      {/* Origin — reached only by a request that missed all three */}
      <rect
        x={gateX}
        y={originY}
        width={gateW}
        height={OH}
        rx={12}
        fill="var(--elevated)"
        stroke="var(--insight)"
        strokeWidth={1.5}
      />
      <Globe x={gateX + 18} y={originY + 16} size={15} color="var(--insight)" />
      <text x={gateX + 42} y={originY + 28} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily={sans}>
        {ORIGIN_TITLE}
      </text>
      <text x={gateX + 18} y={originY + 45} fontSize={9.5} fill="var(--muted)" fontFamily={sans}>
        {ORIGIN_CAPTION}
      </text>
      <rect
        x={resX}
        y={originY + OH / 2 - 9}
        width={originNoteW}
        height={18}
        rx={9}
        fill="var(--elevated)"
        stroke="var(--insight)"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <text
        x={resX + originNoteW / 2}
        y={originY + OH / 2 + 3.5}
        fontSize={9}
        fontWeight={600}
        fill="var(--insight)"
        textAnchor="middle"
        fontFamily={sans}
      >
        {ORIGIN_NOTE}
      </text>
      <line
        x1={gateX + gateW + 3}
        y1={originY + OH / 2}
        x2={resX - 5}
        y2={originY + OH / 2}
        stroke="var(--insight)"
        strokeWidth={1.4}
        strokeLinecap="round"
        markerEnd="url(#clf-arrow-insight)"
      />

      {/* Dashed write-back: the real result populates the layers that missed,
          so the next request stops higher up the stack. */}
      <path
        d={
          `M ${gateX - 3} ${originY + OH / 2} L ${channelX} ${originY + OH / 2} ` +
          `L ${channelX} ${gate2Y + GH / 2} L ${gateX - 5} ${gate2Y + GH / 2}`
        }
        fill="none"
        stroke="var(--insight)"
        strokeWidth={1.3}
        strokeDasharray="1 4"
        strokeLinecap="round"
        markerEnd="url(#clf-arrow-insight)"
      />
      <line
        x1={channelX}
        y1={gate3Y + GH / 2}
        x2={gateX - 5}
        y2={gate3Y + GH / 2}
        stroke="var(--insight)"
        strokeWidth={1.3}
        strokeDasharray="1 4"
        strokeLinecap="round"
        markerEnd="url(#clf-arrow-insight)"
      />
      <rect
        x={channelX + 6}
        y={(gate3Y + GH + originY) / 2 - 9}
        width={writebackW}
        height={18}
        rx={9}
        fill="var(--elevated)"
        stroke="var(--insight)"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <text
        x={channelX + 6 + writebackW / 2}
        y={(gate3Y + GH + originY) / 2 + 3.5}
        fontSize={9}
        fontWeight={600}
        fill="var(--insight)"
        textAnchor="middle"
        fontFamily={sans}
      >
        {WRITEBACK}
      </text>

      <line
        x1={PAD + 30}
        y1={height - 40}
        x2={width - PAD - 30}
        y2={height - 40}
        stroke="url(#clf-fade-x)"
        strokeWidth={1.5}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <text x={width / 2} y={height - 22} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[0]}
      </text>
      <text x={width / 2} y={height - 7} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[1]}
      </text>
    </svg>
  );
}
