"use client";

import { Browser, CheckCircle, Clock, HardDrives, XCircle } from "@phosphor-icons/react";
import { BrowserMockup, FilledRow, SkeletonRow } from "@/components/md/diagrams/BrowserMockup";

export interface QueryHydrationHandoffDiagramProps {
  /** The query key the Server Component actually prefetches. */
  serverKey?: string;
  /** The query key a correctly-wired client component uses — must equal `serverKey`. */
  matchedClientKey?: string;
  /** The query key a mis-wired client component uses instead — the lesson's gotcha. */
  mismatchedClientKey?: string;
}

/* Per-character advance estimates for each rendered type role — the viewBox
   is derived from these, not a guessed constant, so a longer query key
   widens the canvas instead of clipping. */
const CH_TITLE = 6.6; // 12.5px sans, weight 600
const CH_MONO = 5.85; // 10px mono
const CH_CAPTION = 4.95; // 9.5px sans

const NODE_PAD = 14;
const EDGE = 16;
const GAP = 26;

/**
 * The hand-off between two systems that don't know about each other by
 * default: Next.js's server render and React Query's client cache.
 *
 * A flat `flow-steps` chain ("prefetch → dehydrate → HydrationBoundary →
 * resolves") states the four function calls but not the lesson's actual
 * gotcha, which is conditional: `useQuery` only skips its own fetch when its
 * key is byte-for-byte the same string the server prefetched. So this canvas
 * draws one shared server-side prefetch crossing a single Server/Client
 * boundary through a `HydrationBoundary` gate, then forks into two client
 * outcomes that receive the exact same dehydrated cache but read it with two
 * different keys — the fork is the whole point, not decoration. The left
 * branch's `useQuery` key is drawn identical, character for character, to
 * the server's `prefetchQuery` key (both highlighted in the same color) and
 * lands on a browser mockup that is already showing content: no second
 * network request, no skeleton frame, ever rendered. The right branch's key
 * differs by one identifier, is highlighted in the "wrong" color, misses the
 * hydrated cache entirely, and lands on a mockup drawn as two stacked
 * moments in time — a skeleton at t=0 replaced by content at t≈200ms — which
 * is the loading flash the whole hand-off pattern exists to avoid.
 */
export function QueryHydrationHandoffDiagram({
  serverKey = '["posts"]',
  matchedClientKey = '["posts"]',
  mismatchedClientKey = '["blogPosts"]',
}: QueryHydrationHandoffDiagramProps = {}) {
  const serverMono = `prefetchQuery({ queryKey: ${serverKey} })`;
  const matchMono = `useQuery({ queryKey: ${matchedClientKey} })`;
  const missMono = `useQuery({ queryKey: ${mismatchedClientKey} })`;

  const title = (s: string) => NODE_PAD * 2 + s.length * CH_TITLE;
  const mono = (s: string) => NODE_PAD * 2 + s.length * CH_MONO;

  // Column width from the longest thing a single column actually renders —
  // its useQuery node's mono line, its captions, and the browser mockup's
  // own content, so a longer mismatched key widens the whole canvas rather
  // than overflowing its node.
  const colW = Math.max(
    mono(matchMono),
    mono(missMono),
    title("cache hit — no fetch"),
    title("cache miss — fetches fresh"),
    220, // floor: the browser mockup needs room for its rows + labels
  );

  const width = EDGE * 2 + colW * 2 + GAP;
  const serverNodeW = Math.max(mono(serverMono) + 20, width - EDGE * 2 - 40);
  const serverNodeX = (width - serverNodeW) / 2;

  const colLX = EDGE;
  const colRX = EDGE + colW + GAP;
  const centerX = width / 2;

  // Vertical rhythm. The gap from the server node down to the boundary has
  // to hold two separate pills stacked on the same vertical line — the
  // "dehydrate()" label at its midpoint and the "HydrationBoundary" label
  // sitting above the gate — with a real gap between them. A tighter gap
  // shipped once already: DEHYDRATE_Y and the gate label ended up 1px apart
  // in vertical extent, so one rendered invisibly under the other.
  const HEADER_Y = 16;
  const SERVER_NODE_Y = 34;
  const SERVER_NODE_H = 62;
  const SERVER_NODE_BOTTOM = SERVER_NODE_Y + SERVER_NODE_H;
  const ARROW1_LEN = 120;
  const BOUNDARY_Y = SERVER_NODE_BOTTOM + ARROW1_LEN;
  const DEHYDRATE_Y = SERVER_NODE_BOTTOM + ARROW1_LEN / 2; // pill center, ~12px clear of both neighbors
  const GATE_LABEL_Y = BOUNDARY_Y - 40; // rect y; ~12px clear of the dehydrate pill, ~10px clear of the gate circle
  // +22/+12 once left the "CLIENT" header icon overlapping the gate circle's
  // bottom edge by ~1px and the client bands' top edge by ~0px — both are
  // real overlaps at these font/icon sizes, not just tight, so both gaps are
  // widened here with margin rather than eyeballed back to the minimum.
  const CLIENT_LABEL_Y = BOUNDARY_Y + 28;
  const QUERY_NODE_Y = CLIENT_LABEL_Y + 16;
  const QUERY_NODE_H = 58;
  const MOCK_Y = QUERY_NODE_Y + QUERY_NODE_H + 34;
  // Not a smaller guess: the right mockup's chrome (18) plus its last text
  // baseline (117) plus descender clearance is ~138 — anything tighter has
  // shipped as either a clipped line or a line overlapping the row above it.
  const MOCK_H = 150;
  const CAPTION1_Y = MOCK_Y + MOCK_H + 30;
  const CAPTION2_Y = CAPTION1_Y + 15;
  const HEIGHT = CAPTION2_Y + 14;

  const arrow = (id: string, color: string) => (
    <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" key={id}>
      <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill={color} />
    </marker>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `A Server Component prefetches the query key ${serverKey} with prefetchQuery, then hands the result across ` +
        "the server/client boundary through a single HydrationBoundary gate, drawn as one shared path that then " +
        "forks into two different client outcomes depending on what key the client component reads it with. On the " +
        `left, a client component calls useQuery with the identical key ${matchedClientKey} — the same string, ` +
        "highlighted in the same color as the server's key — so it reads the already-hydrated cache entry directly; " +
        "its browser mockup shows the content already filled in with no loading state ever drawn. On the right, a " +
        `client component instead calls useQuery with a different key, ${mismatchedClientKey}, highlighted in a ` +
        "warning color; that key has no entry in the hydrated cache, so React Query treats it as a cold query and " +
        "fetches again. Its browser mockup shows two moments in time stacked vertically: a skeleton placeholder at " +
        "the moment of first paint, then real content only after a fresh fetch resolves — the loading flash the " +
        "hydration hand-off exists to prevent, appearing anyway once the keys stop matching."
      }
    >
      <defs>
        {arrow("qh-arrow-muted", "var(--muted)")}
        {arrow("qh-arrow-accent", "var(--accent)")}
        {arrow("qh-arrow-bad", "var(--bad)")}
        <pattern id="qh-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="qh-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="qh-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Server band (top). HEADER_Y sits a full 7px clear of the band's own
          top edge below it — 22 once left only 1px of clearance. */}
      <HardDrives x={centerX - 46} y={HEADER_Y - 11} size={12} color="var(--muted)" />
      <text x={centerX - 30} y={HEADER_Y} fontSize={10} fontWeight={600} fill="var(--muted)" textAnchor="start" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        SERVER
      </text>

      <rect x={EDGE - 4} y={SERVER_NODE_Y - 10} width={width - (EDGE - 4) * 2} height={SERVER_NODE_H + 20} rx={14} fill="var(--accent)" fillOpacity={0.05} />
      <rect x={EDGE - 4} y={SERVER_NODE_Y - 10} width={width - (EDGE - 4) * 2} height={SERVER_NODE_H + 20} rx={14} fill="url(#qh-dots)" fillOpacity={0.5} />

      <rect x={serverNodeX} y={SERVER_NODE_Y} width={serverNodeW} height={SERVER_NODE_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={centerX} y={SERVER_NODE_Y + 21} fontSize={12.5} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        Server Component
      </text>
      <text x={centerX} y={SERVER_NODE_Y + 40} fontSize={10} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        {"prefetchQuery({ queryKey: "}
        <tspan fill="var(--mark)" fontWeight={600}>{serverKey}</tspan>
        {" })"}
      </text>
      <text x={centerX} y={SERVER_NODE_Y + 54} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        runs during the server render, before any HTML is sent
      </text>

      {/* Arrow down to dehydrate(), then a second leg continuing to the gate —
          one continuous vertical path, with the two labels stacked on it far
          enough apart that neither's pill overlaps the other's. */}
      <line x1={centerX} y1={SERVER_NODE_Y + SERVER_NODE_H + 2} x2={centerX} y2={DEHYDRATE_Y - 10} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-muted)" />
      <rect x={centerX - 78} y={DEHYDRATE_Y - 9} width={156} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={centerX} y={DEHYDRATE_Y + 3} fontSize={9.5} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        dehydrate(queryClient)
      </text>
      <line x1={centerX} y1={DEHYDRATE_Y + 10} x2={centerX} y2={GATE_LABEL_Y - 2} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-muted)" />

      {/* Server / Client boundary, faded at both ends */}
      <line x1={EDGE - 4} y1={BOUNDARY_Y} x2={EDGE + 60} y2={BOUNDARY_Y} stroke="url(#qh-fade-left)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={EDGE + 60} y1={BOUNDARY_Y} x2={width - EDGE - 60} y2={BOUNDARY_Y} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={width - EDGE - 60} y1={BOUNDARY_Y} x2={width - EDGE + 4} y2={BOUNDARY_Y} stroke="url(#qh-fade-right)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />

      {/* HydrationBoundary gate, sitting on the line */}
      <circle cx={centerX} cy={BOUNDARY_Y} r={13} fill="var(--accent)" fillOpacity={0.12} />
      <circle cx={centerX} cy={BOUNDARY_Y} r={7} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.25} />
      <rect x={centerX - 62} y={GATE_LABEL_Y} width={124} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
      <text x={centerX} y={GATE_LABEL_Y + 12} fontSize={9.5} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        HydrationBoundary
      </text>

      {/* Client band label */}
      <Browser x={centerX - 40} y={CLIENT_LABEL_Y - 10} size={12} color="var(--muted)" />
      <text x={centerX - 24} y={CLIENT_LABEL_Y} fontSize={10} fontWeight={600} fill="var(--muted)" textAnchor="start" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        CLIENT
      </text>

      {/* Client bands, one per outcome, dot-textured like the server band */}
      <rect x={colLX - 4} y={QUERY_NODE_Y - 10} width={colW + 8} height={MOCK_Y + MOCK_H - QUERY_NODE_Y + 4} rx={14} fill="var(--surface)" />
      <rect x={colLX - 4} y={QUERY_NODE_Y - 10} width={colW + 8} height={MOCK_Y + MOCK_H - QUERY_NODE_Y + 4} rx={14} fill="url(#qh-dots)" fillOpacity={0.5} />
      <rect x={colRX - 4} y={QUERY_NODE_Y - 10} width={colW + 8} height={MOCK_Y + MOCK_H - QUERY_NODE_Y + 4} rx={14} fill="var(--surface)" />
      <rect x={colRX - 4} y={QUERY_NODE_Y - 10} width={colW + 8} height={MOCK_Y + MOCK_H - QUERY_NODE_Y + 4} rx={14} fill="url(#qh-dots)" fillOpacity={0.5} />

      {/* Fork: gate -> each column's useQuery node */}
      <path d={`M ${centerX - 8} ${BOUNDARY_Y + 6} Q ${centerX - 8} ${QUERY_NODE_Y - 14} ${colLX + colW / 2} ${QUERY_NODE_Y - 6}`} fill="none" stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-accent)" />
      <path d={`M ${centerX + 8} ${BOUNDARY_Y + 6} Q ${centerX + 8} ${QUERY_NODE_Y - 14} ${colRX + colW / 2} ${QUERY_NODE_Y - 6}`} fill="none" stroke="var(--bad)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-bad)" />

      {/* Left column — matching key, cache hit */}
      <rect x={colLX} y={QUERY_NODE_Y} width={colW} height={QUERY_NODE_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <CheckCircle x={colLX + NODE_PAD} y={QUERY_NODE_Y + 10} size={13} color="var(--accent)" weight="fill" />
      <text x={colLX + colW / 2} y={QUERY_NODE_Y + 20} fontSize={12.5} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        cache hit — no fetch
      </text>
      <text x={colLX + colW / 2} y={QUERY_NODE_Y + 37} fontSize={10} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        {"useQuery({ queryKey: "}
        <tspan fill="var(--mark)" fontWeight={600}>{matchedClientKey}</tspan>
        {" })"}
      </text>
      <text x={colLX + colW / 2} y={QUERY_NODE_Y + 51} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        same key as the server — reads the hydrated entry
      </text>

      {/* Right column — mismatched key, cache miss */}
      <rect x={colRX} y={QUERY_NODE_Y} width={colW} height={QUERY_NODE_H} rx={12} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1.5} />
      <XCircle x={colRX + NODE_PAD} y={QUERY_NODE_Y + 10} size={13} color="var(--bad)" weight="fill" />
      <text x={colRX + colW / 2} y={QUERY_NODE_Y + 20} fontSize={12.5} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        cache miss — fetches fresh
      </text>
      <text x={colRX + colW / 2} y={QUERY_NODE_Y + 37} fontSize={10} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        {"useQuery({ queryKey: "}
        <tspan fill="var(--bad)" fontWeight={600}>{mismatchedClientKey}</tspan>
        {" })"}
      </text>
      <text x={colRX + colW / 2} y={QUERY_NODE_Y + 51} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        different key — no entry under it, so it fetches cold
      </text>

      {/* Arrows down to each browser mockup */}
      <line x1={colLX + colW / 2} y1={QUERY_NODE_Y + QUERY_NODE_H + 2} x2={colLX + colW / 2} y2={MOCK_Y - 10} stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-accent)" />
      <line x1={colRX + colW / 2} y1={QUERY_NODE_Y + QUERY_NODE_H + 2} x2={colRX + colW / 2} y2={MOCK_Y - 10} stroke="var(--bad)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#qh-arrow-bad)" />

      {/* Left mockup: instant, no flash — one filled row, one moment in time */}
      <BrowserMockup x={colLX + (colW - 200) / 2} y={MOCK_Y} width={200} height={MOCK_H} url="/posts" accent>
        <FilledRow x={14} y={20} width={172} height={9} />
        <FilledRow x={14} y={38} width={130} height={9} />
        <Clock x={14} y={58} size={11} color="var(--muted)" />
        <text x={30} y={67} fontSize={9} fill="var(--accent)" fontFamily="var(--font-sans), system-ui">
          t=0ms — already in cache
        </text>
        <text x={14} y={84} fontSize={9} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
          no skeleton is ever drawn
        </text>
      </BrowserMockup>

      {/* Right mockup: two stacked moments in time — the flash. The second
          caption shipped once sitting only 2px below its own row's bottom
          edge, so its ascenders visibly overlapped the filled bar above it —
          each row/caption pair below now clears the one above by >=10px. */}
      <BrowserMockup x={colRX + (colW - 200) / 2} y={MOCK_Y} width={200} height={MOCK_H} url="/posts">
        <SkeletonRow x={14} y={20} width={172} />
        <SkeletonRow x={14} y={36} width={130} />
        <Clock x={14} y={54} size={11} color="var(--muted)" />
        <text x={30} y={63} fontSize={9} fill="var(--bad)" fontFamily="var(--font-sans), system-ui">
          t=0ms — cold, fetching
        </text>
        <FilledRow x={14} y={78} width={172} height={9} />
        <FilledRow x={14} y={96} width={130} height={9} />
        <text x={14} y={117} fontSize={9} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
          t≈200ms — the loading flash
        </text>
      </BrowserMockup>

      <text x={width / 2} y={CAPTION1_Y} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        One dehydrated cache crosses the boundary once — what happens next depends only on the key each side used.
      </text>
      <text x={width / 2} y={CAPTION2_Y} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        Same string on both sides: instant. One character different: the fetch — and the flash — happen anyway.
      </text>
    </svg>
  );
}
