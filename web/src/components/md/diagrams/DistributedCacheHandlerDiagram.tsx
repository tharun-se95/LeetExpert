"use client";

import { Cpu, Database, HardDrives, Lock, ShareNetwork } from "@phosphor-icons/react";

export interface DistributedCacheHandlerDiagramProps {
  /** How many containers sit behind the load balancer. The lesson's worked example uses 6. */
  containerCount?: number;
  /** The single key every container is being asked for at the same instant. */
  cacheKey?: string;
  /** The value some containers still hold — the older, diverged one. */
  staleVersion?: string;
  /** The value other containers hold — same key, different content. */
  freshVersion?: string;
  /** Two closing lines under both panels. */
  caption?: [string, string];
}

/* Per-character advance estimates, used to size the viewBox from the actual
   strings rendered rather than from a guessed constant. Deliberately slightly
   generous so the widest realistic label still clears the panel padding. */
const CH_HEADER = 6.3; // 10.5px semibold sans / mono tspan
const CH_TITLE = 7.0; // 13px semibold sans
const CH_PILL = 4.8; // 9px sans inside a pill
const CH_CAPTION = 5.0; // 9.5px sans
const CH_CHIP = 5.1; // 8.5px mono inside a container's cache chip

const PAD = 18; // canvas edge -> panel edge
const PIP = 16; // panel edge -> content
const CHANNEL = 46; // reserved gutter beside the container grid, for the bypass path
const CW = 80; // container width
const CH = 58; // container height
const CGAP = 15;
const DB_W = 170;
const DB_H = 44;

const HEADER_A = "Default handler · local disk inside every container";
const HEADER_B = "Custom handler · one shared store for the whole fleet";
const TAG_A = "what breaks";
const TAG_B = "the fix";
const DB_TITLE = "Origin database";
const DB_CAPTION = "the expensive query";
const BRACKET_A = "same key, two different values";
const BADGE_A = "3× the same query, all at once";
const BAR_TITLE = "Shared cache store (Redis)";
const BAR_CAPTION = "① every container reads and writes this one store";
const LOCK_LABEL = "② single-flight lock";
const BADGE_B = "③ 1 regeneration, not 3";
const BYPASS_LABEL = "Redis down → compute fresh";

const DEFAULT_CAPTION: [string, string] = [
  "Same containers, same key, same instant — only the number of database queries changes.",
  "Dashed: if the shared store is unreachable, a container bypasses it and computes fresh — slower, still correct.",
];

/**
 * The capstone distributed-cache mechanism, drawn as a before/after of the
 * *same* container fleet so the only thing the eye has to track is where the
 * arrows go.
 *
 * Top panel (broken): every container owns a cache chip *inside its own box* —
 * that containment is the whole failure. Three containers hold the same key at
 * two different values (inconsistency), and the three whose copy has expired
 * each fire their own arrow at the database in the same instant (the thundering
 * herd). Arrow count into the database is the payload of the diagram: three.
 *
 * Bottom panel (fixed): the chips are gone from inside the boxes and there is
 * one shared bar underneath all of them; a single-flight lock sits on the one
 * arrow that still reaches the database. Arrow count: one. The dashed path down
 * the right gutter routes *around* the shared store — the failure-isolation
 * case, drawn as a literal detour rather than described in a bullet.
 *
 * Phosphor icons render their own `<svg>`, which nests validly inside this
 * canvas (SVG allows nested viewports) and takes `x`/`y`/`size`/`color`
 * directly.
 */
export function DistributedCacheHandlerDiagram({
  containerCount = 6,
  cacheKey = "/products/42",
  staleVersion = "v7",
  freshVersion = "v9",
  caption = DEFAULT_CAPTION,
}: DistributedCacheHandlerDiagramProps = {}) {
  const n = Math.max(2, Math.min(8, Math.round(containerCount)));
  const hitCount = Math.ceil(n / 2);
  const missCount = n - hitCount;

  const leadPrefix = `${n} concurrent requests for `;
  const leadW = leadPrefix.length * CH_HEADER + cacheKey.length * CH_HEADER;
  const leadPillW = leadW + 30;

  const gridW = n * CW + (n - 1) * CGAP;
  const tagAW = TAG_A.length * CH_PILL + 20;
  const tagBW = TAG_B.length * CH_PILL + 20;

  // Width is driven by whichever is actually widest: the container grid plus
  // its two gutters, a panel header plus its right-hand tag, the lead pill, or
  // a caption line. Nothing here is a guessed constant.
  const contentW = Math.max(
    gridW + 2 * CHANNEL,
    HEADER_A.length * CH_HEADER + 24 + 16 + tagAW,
    HEADER_B.length * CH_HEADER + 24 + 16 + tagBW,
    leadPillW,
    caption[0].length * CH_CAPTION,
    caption[1].length * CH_CAPTION,
  );
  const panelW = contentW + 2 * PIP;
  const width = panelW + 2 * PAD;
  const cx = width / 2;

  const panelX = PAD;
  const innerL = PAD + PIP;
  const innerR = innerL + contentW;

  const gx = innerL + (contentW - gridW) / 2;
  const colX = (i: number) => gx + i * (CW + CGAP);
  const colCx = (i: number) => colX(i) + CW / 2;

  // The database sits under the centre of the *missing* group, because that is
  // the group whose arrows reach it.
  const dbCx = (colX(hitCount) + colX(n - 1) + CW) / 2;
  const dbX = dbCx - DB_W / 2;

  // Vertical rhythm. Both panels share the same header/tick/container offsets
  // so the two rows of containers line up exactly.
  const leadY = 8;
  const leadH = 20;
  const aY = 42;
  const aH = 224;
  const bY = aY + aH + 24;
  const bH = 290;
  const height = bY + bH + 50;

  const hdrDY = 24;
  const rowDY = 48;
  const rowBottomDY = rowDY + CH;

  const aDbY = aY + 158;
  const bBarY = bY + 134;
  const bBarH = 46;
  const bDbY = bY + 224;

  const barX = gx - 8;
  const barW = gridW + 16;
  const barCx = barX + barW / 2;
  const bypassX = (barX + barW + innerR) / 2;

  const dividerY = (aY + aH + bY) / 2;

  const sans = "var(--font-sans), system-ui";
  const mono = "var(--font-mono), monospace";
  // --accent is already the family's UI-safe derived color (clears the 3:1
  // floor for borders/icons/fills) — --family-accent is the raw, un-derived
  // brand hex and fails contrast at small sizes; never use it directly here.
  const accent = "var(--accent)";
  // Any text (not a border, icon, or fill) painted in the accent hue needs
  // the full 4.5:1 text floor, which --mark — not --accent — guarantees.
  const accentText = "var(--mark)";

  const cols = Array.from({ length: n }, (_, i) => i);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `${n} containers behind a load balancer all receive a request for the same cache key, ${cacheKey}, at the same instant, shown twice. ` +
        "In the top panel Next.js's default cache handler gives each container its own cache stored inside itself on local disk: " +
        `${hitCount} containers hold the key but disagree about its value — some serve ${staleVersion} while another serves ${freshVersion} — and the other ${missCount} containers find their copy expired and each independently fire the same expensive query at the origin database in the same instant, three duplicate arrows converging on one database, the thundering herd. ` +
        "In the bottom panel a custom cache handler removes the per-container caches entirely and puts one shared Redis store underneath the whole fleet: every container reads and writes that single store, so they all see one consistent value, and only the first container to notice the expired key takes a short-lived single-flight lock and regenerates it while the others wait briefly or serve the stale value — one arrow reaches the database instead of three. " +
        "A dashed path runs down the right-hand side, around the shared store rather than through it: if Redis itself is unreachable, a container bypasses the cache and computes fresh, which is slower but still correct rather than crashing or serving corrupted state."
      }
    >
      <defs>
        <marker id="dch-arrow-bad" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--bad)" />
        </marker>
        <marker id="dch-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill={accent} />
        </marker>
        <marker id="dch-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        {/* Reversed head, so a container's link to the shared store can be
            drawn as the two-way read *and* write that it actually is. */}
        <marker id="dch-arrow-accent-rev" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M5.5,0.5 L0.5,3 L5.5,5.5 Z" fill={accent} />
        </marker>
        <pattern id="dch-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="dch-fade-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Shared premise for both panels */}
      <rect
        x={cx - leadPillW / 2}
        y={leadY}
        width={leadPillW}
        height={leadH}
        rx={leadH / 2}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text x={cx} y={leadY + 14} fontSize={10.5} textAnchor="middle" fill="var(--muted)" fontFamily={sans}>
        {leadPrefix}
        <tspan fontFamily={mono} fontWeight={600} fill="var(--foreground)">
          {cacheKey}
        </tspan>
      </text>

      {/* ─── Panel A: the broken, per-container model ─────────────────── */}
      <rect x={panelX} y={aY} width={panelW} height={aH} rx={14} fill="var(--surface)" />
      <rect x={panelX} y={aY} width={panelW} height={aH} rx={14} fill="url(#dch-dots)" fillOpacity={0.5} />

      <HardDrives x={innerL} y={aY + hdrDY - 11} size={13} color="var(--muted)" />
      <text x={innerL + 20} y={aY + hdrDY} fontSize={10.5} fontWeight={600} fill="var(--foreground)" fontFamily={sans}>
        {HEADER_A}
      </text>
      <rect
        x={innerR - tagAW}
        y={aY + hdrDY - 13}
        width={tagAW}
        height={17}
        rx={8.5}
        fill="var(--elevated)"
        stroke="var(--bad)"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <text
        x={innerR - tagAW / 2}
        y={aY + hdrDY - 1.5}
        fontSize={9}
        fontWeight={600}
        fill="var(--bad)"
        textAnchor="middle"
        fontFamily={sans}
      >
        {TAG_A}
      </text>

      {cols.map((i) => {
        const x = colX(i);
        const y = aY + rowDY;
        const expired = i >= hitCount;
        const chipX = x + 9;
        const chipW = CW - 18;
        const chipY = y + 26;
        const label = expired ? "expired" : i === 1 ? freshVersion : staleVersion;
        return (
          <g key={`a-${i}`}>
            {/* incoming concurrent request */}
            <line
              x1={colCx(i)}
              y1={y - 15}
              x2={colCx(i)}
              y2={y - 5}
              stroke="var(--muted)"
              strokeWidth={1.25}
              strokeLinecap="round"
              markerEnd="url(#dch-arrow-muted)"
            />
            <rect x={x} y={y} width={CW} height={CH} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
            <Cpu x={x + CW / 2 - 23} y={y + 9} size={12} color="var(--muted)" />
            <text
              x={x + CW / 2 + 8}
              y={y + 19}
              fontSize={13}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {`C${i + 1}`}
            </text>
            <rect
              x={chipX}
              y={chipY}
              width={chipW}
              height={18}
              rx={9}
              fill="var(--surface)"
              stroke={expired ? "var(--bad)" : "var(--border)"}
              strokeOpacity={expired ? 0.6 : 1}
              strokeWidth={1}
            />
            <HardDrives x={chipX + 7} y={chipY + 4.5} size={9} color={expired ? "var(--bad)" : "var(--muted)"} />
            <text
              x={chipX + 20 + (chipW - 26) / 2}
              y={chipY + 12.5}
              fontSize={8.5}
              fontWeight={600}
              fill={expired ? "var(--bad)" : "var(--foreground)"}
              textAnchor="middle"
              fontFamily={mono}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Inconsistency bracket under the containers that DO hold the key */}
      <path
        d={`M ${colCx(0)} ${aY + rowBottomDY + 7} L ${colCx(0)} ${aY + rowBottomDY + 12} L ${colCx(hitCount - 1)} ${aY + rowBottomDY + 12} L ${colCx(hitCount - 1)} ${aY + rowBottomDY + 7}`}
        fill="none"
        stroke="var(--bad)"
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      {(() => {
        const w = BRACKET_A.length * CH_PILL + 22;
        const bcx = (colCx(0) + colCx(hitCount - 1)) / 2;
        return (
          <>
            <rect
              x={bcx - w / 2}
              y={aY + rowBottomDY + 18}
              width={w}
              height={18}
              rx={9}
              fill="var(--elevated)"
              stroke="var(--bad)"
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            <text
              x={bcx}
              y={aY + rowBottomDY + 30.5}
              fontSize={9}
              fontWeight={600}
              fill="var(--bad)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {BRACKET_A}
            </text>
          </>
        );
      })()}

      {/* The thundering herd: one arrow per expired container, all at once */}
      {cols.slice(hitCount).map((i, k) => {
        const from = colCx(i);
        const spread = (k - (missCount - 1) / 2) * 45;
        const to = dbCx + spread;
        const y0 = aY + rowBottomDY;
        const y1 = aDbY - 3;
        return (
          <path
            key={`herd-${i}`}
            d={`M ${from} ${y0} C ${from} ${y0 + 26}, ${to} ${y1 - 26}, ${to} ${y1}`}
            fill="none"
            stroke="var(--bad)"
            strokeWidth={1.4}
            strokeLinecap="round"
            markerEnd="url(#dch-arrow-bad)"
          />
        );
      })}

      <DbNode
        x={dbX}
        y={aDbY}
        cxv={dbCx}
        sans={sans}
        badge={BADGE_A}
        badgeColor="var(--bad)"
      />

      {/* Faded separator between the two worlds */}
      <line
        x1={panelX + 40}
        y1={dividerY}
        x2={panelX + panelW - 40}
        y2={dividerY}
        stroke="url(#dch-fade-x)"
        strokeWidth={1.5}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />

      {/* ─── Panel B: the shared-store model ──────────────────────────── */}
      <rect x={panelX} y={bY} width={panelW} height={bH} rx={14} fill={accent} fillOpacity={0.05} />
      <rect x={panelX} y={bY} width={panelW} height={bH} rx={14} fill="url(#dch-dots)" fillOpacity={0.5} />

      <ShareNetwork x={innerL} y={bY + hdrDY - 11} size={13} color="var(--muted)" />
      <text x={innerL + 20} y={bY + hdrDY} fontSize={10.5} fontWeight={600} fill="var(--foreground)" fontFamily={sans}>
        {HEADER_B}
      </text>
      <rect
        x={innerR - tagBW}
        y={bY + hdrDY - 13}
        width={tagBW}
        height={17}
        rx={8.5}
        fill="var(--elevated)"
        stroke={accent}
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      <text
        x={innerR - tagBW / 2}
        y={bY + hdrDY - 1.5}
        fontSize={9}
        fontWeight={600}
        fill={accentText}
        textAnchor="middle"
        fontFamily={sans}
      >
        {TAG_B}
      </text>

      {cols.map((i) => {
        const x = colX(i);
        const y = bY + rowDY;
        const missIndex = i - hitCount;
        const isLock = missIndex === 0;
        const label = missIndex < 0 ? `hit ${freshVersion}` : isLock ? "locked" : missIndex === 1 ? "waits" : "stale ok";
        const chipX = x + 9;
        const chipW = CW - 18;
        const chipY = y + 26;
        return (
          <g key={`b-${i}`}>
            <line
              x1={colCx(i)}
              y1={y - 15}
              x2={colCx(i)}
              y2={y - 5}
              stroke="var(--muted)"
              strokeWidth={1.25}
              strokeLinecap="round"
              markerEnd="url(#dch-arrow-muted)"
            />
            <rect x={x} y={y} width={CW} height={CH} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
            <Cpu x={x + CW / 2 - 23} y={y + 9} size={12} color="var(--muted)" />
            <text
              x={x + CW / 2 + 8}
              y={y + 19}
              fontSize={13}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {`C${i + 1}`}
            </text>
            <rect
              x={chipX}
              y={chipY}
              width={chipW}
              height={18}
              rx={9}
              fill="var(--surface)"
              stroke={isLock ? "var(--insight)" : "var(--border)"}
              strokeOpacity={isLock ? 0.7 : 1}
              strokeWidth={1}
            />
            {isLock ? <Lock x={chipX + 7} y={chipY + 4.5} size={9} color="var(--insight)" weight="fill" /> : null}
            <text
              x={isLock ? chipX + 20 + (chipW - 26) / 2 : chipX + chipW / 2}
              y={chipY + 12.5}
              fontSize={8.5}
              fontWeight={600}
              fill={isLock ? "var(--insight)" : missIndex < 0 ? "var(--foreground)" : "var(--muted)"}
              textAnchor="middle"
              fontFamily={mono}
            >
              {label}
            </text>
            {/* every container connects down into the one shared store */}
            <line
              x1={colCx(i)}
              y1={bY + rowBottomDY + 3}
              x2={colCx(i)}
              y2={bBarY - 3}
              stroke={accent}
              strokeOpacity={0.75}
              strokeWidth={1.25}
              strokeLinecap="round"
              markerStart="url(#dch-arrow-accent-rev)"
              markerEnd="url(#dch-arrow-accent)"
            />
          </g>
        );
      })}

      {/* The one shared store */}
      <rect x={barX} y={bBarY} width={barW} height={bBarH} rx={12} fill="var(--elevated)" stroke={accent} strokeWidth={1.5} />
      <ShareNetwork x={barCx - 105} y={bBarY + 10} size={14} color={accent} />
      <text x={barCx + 12} y={bBarY + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily={sans}>
        {BAR_TITLE}
      </text>
      <text x={barCx} y={bBarY + 36} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {BAR_CAPTION}
      </text>

      {/* Exactly one regeneration escapes to the database, held by the lock */}
      <line
        x1={dbCx}
        y1={bBarY + bBarH}
        x2={dbCx}
        y2={bDbY - 3}
        stroke={accent}
        strokeWidth={1.6}
        strokeLinecap="round"
        markerEnd="url(#dch-arrow-accent)"
      />
      {(() => {
        const my = (bBarY + bBarH + bDbY) / 2;
        const w = LOCK_LABEL.length * CH_PILL + 22;
        return (
          <>
            <circle cx={dbCx} cy={my} r={12} fill="var(--insight)" fillOpacity={0.14} />
            <circle cx={dbCx} cy={my} r={7.5} fill="var(--elevated)" stroke="var(--insight)" strokeWidth={1.25} />
            <Lock x={dbCx - 4.5} y={my - 4.5} size={9} color="var(--insight)" weight="fill" />
            <rect
              x={dbCx - 16 - w}
              y={my - 9}
              width={w}
              height={18}
              rx={9}
              fill="var(--elevated)"
              stroke="var(--insight)"
              strokeOpacity={0.45}
              strokeWidth={1}
            />
            <text
              x={dbCx - 16 - w / 2}
              y={my + 3.5}
              fontSize={9}
              fontWeight={600}
              fill="var(--insight)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {LOCK_LABEL}
            </text>
          </>
        );
      })()}

      {/* Failure isolation: a literal detour around the shared store */}
      {(() => {
        const y0 = bY + rowBottomDY;
        const startX = colX(n - 1) + CW - 20;
        const enterY = bDbY + DB_H / 2;
        const my = (bBarY + bBarH + bDbY) / 2;
        const w = BYPASS_LABEL.length * CH_PILL + 20;
        return (
          <>
            <path
              d={
                `M ${startX} ${y0} Q ${bypassX} ${y0 + 6} ${bypassX} ${y0 + 28} ` +
                `L ${bypassX} ${enterY - 20} Q ${bypassX} ${enterY} ${bypassX - 24} ${enterY} ` +
                `L ${dbX + DB_W + 6} ${enterY}`
              }
              fill="none"
              stroke="var(--muted)"
              strokeWidth={1.25}
              strokeDasharray="1 4"
              strokeLinecap="round"
              markerEnd="url(#dch-arrow-muted)"
            />
            <rect
              x={dbCx + 12}
              y={my - 9}
              width={w}
              height={18}
              rx={9}
              fill="var(--elevated)"
              stroke="var(--muted)"
              strokeOpacity={0.55}
              strokeWidth={1}
              strokeDasharray="1 3"
              strokeLinecap="round"
            />
            <text
              x={dbCx + 12 + w / 2}
              y={my + 3.5}
              fontSize={9}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {BYPASS_LABEL}
            </text>
          </>
        );
      })()}

      <DbNode x={dbX} y={bDbY} cxv={dbCx} sans={sans} badge={BADGE_B} badgeColor={accent} badgeTextColor="var(--mark)" />

      <text x={cx} y={height - 30} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[0]}
      </text>
      <text x={cx} y={height - 15} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[1]}
      </text>
    </svg>
  );
}

/** The origin database, drawn identically in both panels so only its inbound
 *  arrow count and its badge differ between them. */
function DbNode({
  x,
  y,
  cxv,
  sans,
  badge,
  badgeColor,
  badgeTextColor = badgeColor,
}: {
  x: number;
  y: number;
  cxv: number;
  sans: string;
  badge: string;
  /** Border/stroke — only needs to clear the 3:1 UI floor, so the raw accent is fine here. */
  badgeColor: string;
  /** Text fill — needs the full 4.5:1 text floor, so this defaults separately from the border. */
  badgeTextColor?: string;
}) {
  const badgeW = badge.length * CH_PILL + 22;
  const titleHalf = (DB_TITLE.length * CH_TITLE) / 2;
  return (
    <g>
      <rect x={x} y={y} width={DB_W} height={DB_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <Database x={cxv + 8 - titleHalf - 18} y={y + 9} size={13} color="var(--muted)" />
      <text x={cxv + 8} y={y + 19} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily={sans}>
        {DB_TITLE}
      </text>
      <text x={cxv} y={y + 33} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {DB_CAPTION}
      </text>
      <rect
        x={cxv - badgeW / 2}
        y={y + DB_H - 9}
        width={badgeW}
        height={18}
        rx={9}
        fill="var(--elevated)"
        stroke={badgeColor}
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      <text x={cxv} y={y + DB_H + 3.5} fontSize={9} fontWeight={600} fill={badgeTextColor} textAnchor="middle" fontFamily={sans}>
        {badge}
      </text>
    </g>
  );
}
