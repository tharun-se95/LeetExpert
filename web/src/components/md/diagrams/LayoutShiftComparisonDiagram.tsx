"use client";

import { ArrowDown, Clock, Image as ImageIcon, ImageSquare, Warning } from "@phosphor-icons/react";

import { BrowserMockup, FilledRow } from "@/components/md/diagrams/BrowserMockup";

/**
 * The actual visible consequence of skipping `width`/`height`, drawn as two
 * timelines of the SAME page rather than as a list of facts about each API.
 *
 * Top lane (`<img>`): at t=0 the browser has no idea how tall the image will
 * be, so it renders zero height for it and the paragraph below sits flush
 * against where the image tag is. At t=650ms the image finishes downloading,
 * the browser discovers its real height, and everything below is shoved
 * down — drawn explicitly as a dashed "before" outline of the paragraph next
 * to its solid "after" position, joined by a downward arrow labelled with the
 * pixel shift. That jump IS the CLS metric; the diagram makes the jump
 * itself the thing you look at, not an assertion that one exists.
 *
 * Bottom lane (`next/image`): at t=0 the `width`/`height` props let Next.js
 * reserve the exact aspect-ratio box up front — shown as a placeholder tile
 * already sized correctly — so the paragraph is already sitting in its final
 * position before a single image byte has arrived. At t=650ms the image
 * fills that same reserved box and a dashed tie-line shows the paragraph
 * never moved at all.
 */
export interface LayoutShiftComparisonDiagramProps {
  url?: string;
  paragraph?: string;
  shiftAmount?: string;
}

const sansW = (s: string, size: number) => s.length * size * 0.55;

export function LayoutShiftComparisonDiagram({
  url = "shop.com/product",
  paragraph = "Free shipping on orders over $50",
  shiftAmount = "+180px",
}: LayoutShiftComparisonDiagramProps) {
  const PAD = 26;
  const BW = 190; // browser width
  const CH = 18; // BrowserMockup chrome height
  const GAP = 150; // room for the timing arrow between t=0 and t=X snapshots
  const LABEL_W = 118; // left-hand lane label column

  const b1x = PAD + LABEL_W;
  const b2x = b1x + BW + GAP;

  const laneGap = 46;
  const bh = 148; // browser height including chrome
  const topLaneY = 56;
  const bottomLaneY = topLaneY + bh + laneGap + 34;

  const heading = "same page, two ways of sizing the hero image";
  const caption1a = "no height hint — layout guesses 0px";
  const caption1b = `image arrives — page jumps ${shiftAmount}`;
  const caption2a = "width/height reserve the box up front";
  const caption2b = "image fills the reserved box — 0px shift";

  const longestCaption = Math.max(
    sansW(caption1a, 9),
    sansW(caption1b, 9),
    sansW(caption2a, 9),
    sansW(caption2b, 9),
  );

  const rowWidth = PAD + LABEL_W + BW + GAP + BW + PAD;
  const captionWidth = PAD + LABEL_W + longestCaption * 2 + GAP + PAD + 40;
  const headingWidth = PAD * 2 + sansW(heading, 10.5);

  const width = Math.ceil(Math.max(rowWidth, captionWidth, headingWidth));
  const height = bottomLaneY + bh + 56;

  const gapMid = (b1x + BW + b2x) / 2;

  // ---- geometry inside each browser viewport (children translated by BrowserMockup) ----
  const contentX = 12;
  const contentW = BW - 24;
  const imgBoxH = 44;
  const imgBoxY = 14;
  const paraBeforeY = imgBoxY; // paragraph sits flush against the image slot when it's 0-height
  const paraAfterY = imgBoxY + imgBoxH + 10;
  const paraH = 20;

  const renderImgIcon = (x: number, y: number, loaded: boolean) => (
    <g>
      <rect
        x={x}
        y={y}
        width={contentW}
        height={imgBoxH}
        rx={8}
        fill={loaded ? "none" : "var(--border)"}
        fillOpacity={loaded ? 1 : 0.25}
        stroke={loaded ? "var(--border)" : "none"}
      />
      {loaded ? (
        <>
          <rect x={x} y={y} width={contentW} height={imgBoxH} rx={8} fill="var(--accent)" fillOpacity={0.16} />
          <ImageIcon x={x + contentW / 2 - 9} y={y + imgBoxH / 2 - 9} size={18} color="var(--accent)" />
        </>
      ) : null}
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        "Two timelines of the same product page, comparing a plain img tag against next/image. Top timeline: at t=0ms the " +
        "img has no width or height, so the browser renders zero height for its slot and the paragraph below sits flush " +
        "against it; at t=650ms the image finishes loading, the browser discovers its real size, and the paragraph is " +
        `shoved down ${shiftAmount} — shown as a dashed outline of its old position next to its solid new position, joined ` +
        "by a downward arrow. That visible jump is a layout shift. Bottom timeline: at t=0ms next/image's width and height " +
        "props let the browser reserve the correct aspect-ratio box immediately, shown as a placeholder tile, so the " +
        "paragraph is already sitting in its final position before any image data has arrived; at t=650ms the real image " +
        "fills that same reserved box and a dashed tie-line shows the paragraph never moved at all."
      }
    >
      <defs>
        <marker id="lsc-arrow-bad" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--bad)" />
        </marker>
        <marker id="lsc-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--accent)" />
        </marker>
        <pattern id="lsc-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
      </defs>

      <text
        x={width / 2}
        y={22}
        fontSize={10.5}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {heading}
      </text>

      {/* ================= TOP LANE: <img> ================= */}
      <rect x={PAD} y={topLaneY - 10} width={LABEL_W - 14} height={bh + 20} rx={12} fill="var(--bad)" fillOpacity={0.08} />
      <Warning x={PAD + 12} y={topLaneY + 4} size={13} color="var(--bad)" />
      <text
        x={PAD + 32}
        y={topLaneY + 10.5}
        fontSize={10}
        fontWeight={600}
        fill="var(--bad)"
        fontFamily="var(--font-mono), monospace"
      >
        {"<img>"}
      </text>
      <text x={PAD + 12} y={topLaneY + 30} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        no sizing
      </text>
      <text x={PAD + 12} y={topLaneY + 43} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        hint
      </text>

      {/* t=0ms snapshot: image slot has zero height, paragraph sits flush at top */}
      <text x={b1x + BW / 2} y={topLaneY - 16} fontSize={8.5} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        t = 0ms
      </text>
      <BrowserMockup x={b1x} y={topLaneY} width={BW} height={bh} url={url}>
        <rect x={contentX} y={imgBoxY} width={contentW} height={2} rx={1} fill="var(--bad)" fillOpacity={0.5} />
        <text x={contentX} y={imgBoxY - 5} fontSize={7.5} fill="var(--bad)" fontFamily="var(--font-mono), monospace">
          height: 0px (unknown)
        </text>
        <rect x={contentX} y={paraBeforeY + 6} width={contentW} height={paraH} rx={6} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
        <text
          x={contentX + 8}
          y={paraBeforeY + 6 + paraH / 2}
          fontSize={7.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {paragraph}
        </text>
      </BrowserMockup>

      {/* timing arrow between the two <img> snapshots */}
      <Clock x={gapMid - 6} y={topLaneY + bh / 2 - 30} size={12} color="var(--muted)" />
      <text x={gapMid} y={topLaneY + bh / 2 - 12} fontSize={8} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        650ms later
      </text>
      <line
        x1={b1x + BW + 10}
        y1={topLaneY + bh / 2}
        x2={b2x - 10}
        y2={topLaneY + bh / 2}
        stroke="var(--bad)"
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd="url(#lsc-arrow-bad)"
      />
      <text x={gapMid} y={topLaneY + bh / 2 + 16} fontSize={8} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        image loads
      </text>

      {/* t=650ms snapshot: image fills in, paragraph shifted down — dashed "before" ghost shown */}
      <text x={b2x + BW / 2} y={topLaneY - 16} fontSize={8.5} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        t = 650ms
      </text>
      <BrowserMockup x={b2x} y={topLaneY} width={BW} height={bh} url={url}>
        {renderImgIcon(contentX, imgBoxY, true)}
        {/* dashed ghost at the OLD paragraph position */}
        <rect
          x={contentX}
          y={paraBeforeY + 6}
          width={contentW}
          height={paraH}
          rx={6}
          fill="none"
          stroke="var(--bad)"
          strokeWidth={1}
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        {/* solid paragraph at its NEW, shifted position */}
        <rect x={contentX} y={paraAfterY + 6} width={contentW} height={paraH} rx={6} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1.25} />
        <text
          x={contentX + 8}
          y={paraAfterY + 6 + paraH / 2}
          fontSize={7.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {paragraph}
        </text>
        {/* shift arrow connecting ghost to new position */}
        <line
          x1={contentX + contentW - 14}
          y1={paraBeforeY + 6 + paraH + 2}
          x2={contentX + contentW - 14}
          y2={paraAfterY + 4}
          stroke="var(--bad)"
          strokeWidth={1.25}
          strokeLinecap="round"
          markerEnd="url(#lsc-arrow-bad)"
        />
      </BrowserMockup>
      <rect x={b2x + BW - 58} y={topLaneY + bh + 4} width={58} height={15} rx={7.5} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1} />
      <ArrowDown x={b2x + BW - 53} y={topLaneY + bh + 6.5} size={10} color="var(--bad)" />
      <text x={b2x + BW - 26} y={topLaneY + bh + 11.5} fontSize={8} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        {shiftAmount}
      </text>

      {/* captions under top lane */}
      <text x={b1x + BW / 2} y={topLaneY + bh + 26} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption1a}
      </text>
      <text x={b2x + BW / 2} y={topLaneY + bh + 26} fontSize={9} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption1b}
      </text>

      {/* ================= BOTTOM LANE: next/image ================= */}
      <rect x={PAD} y={bottomLaneY - 10} width={LABEL_W - 14} height={bh + 20} rx={12} fill="var(--accent)" fillOpacity={0.08} />
      <ImageSquare x={PAD + 12} y={bottomLaneY + 4} size={13} color="var(--accent)" />
      <text
        x={PAD + 32}
        y={bottomLaneY + 10.5}
        fontSize={10}
        fontWeight={600}
        fill="var(--mark)"
        fontFamily="var(--font-mono), monospace"
      >
        {"<Image>"}
      </text>
      <text x={PAD + 12} y={bottomLaneY + 30} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        width/height
      </text>
      <text x={PAD + 12} y={bottomLaneY + 43} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        reserved
      </text>

      {/* t=0ms snapshot: reserved placeholder box already at full height, paragraph already final */}
      <text x={b1x + BW / 2} y={bottomLaneY - 16} fontSize={8.5} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        t = 0ms
      </text>
      <BrowserMockup x={b1x} y={bottomLaneY} width={BW} height={bh} url={url} accent>
        <rect x={contentX} y={imgBoxY} width={contentW} height={imgBoxH} rx={8} fill="var(--accent)" fillOpacity={0.1} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
        <text x={contentX + contentW / 2} y={imgBoxY + imgBoxH / 2} fontSize={7.5} fill="var(--muted)" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono), monospace">
          reserved 1200×630
        </text>
        <rect x={contentX} y={paraAfterY + 6} width={contentW} height={paraH} rx={6} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
        <text
          x={contentX + 8}
          y={paraAfterY + 6 + paraH / 2}
          fontSize={7.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {paragraph}
        </text>
      </BrowserMockup>

      {/* timing arrow between the two next/image snapshots */}
      <Clock x={gapMid - 6} y={bottomLaneY + bh / 2 - 30} size={12} color="var(--muted)" />
      <text x={gapMid} y={bottomLaneY + bh / 2 - 12} fontSize={8} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        650ms later
      </text>
      <line
        x1={b1x + BW + 10}
        y1={bottomLaneY + bh / 2}
        x2={b2x - 10}
        y2={bottomLaneY + bh / 2}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd="url(#lsc-arrow-accent)"
      />
      <text x={gapMid} y={bottomLaneY + bh / 2 + 16} fontSize={8} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        image loads
      </text>

      {/* t=650ms snapshot: image fills reserved box exactly, paragraph tied to same position */}
      <text x={b2x + BW / 2} y={bottomLaneY - 16} fontSize={8.5} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        t = 650ms
      </text>
      <BrowserMockup x={b2x} y={bottomLaneY} width={BW} height={bh} url={url} accent>
        {renderImgIcon(contentX, imgBoxY, true)}
        <rect x={contentX} y={paraAfterY + 6} width={contentW} height={paraH} rx={6} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
        <text
          x={contentX + 8}
          y={paraAfterY + 6 + paraH / 2}
          fontSize={7.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {paragraph}
        </text>
      </BrowserMockup>

      {/* tie-line across the gap at the paragraph's y-position, showing it never moved */}
      <line
        x1={b1x + BW}
        y1={bottomLaneY + paraAfterY + 6 + paraH / 2}
        x2={b2x}
        y2={bottomLaneY + paraAfterY + 6 + paraH / 2}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <rect x={b2x + BW - 58} y={bottomLaneY + bh + 4} width={58} height={15} rx={7.5} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
      <text x={b2x + BW - 29} y={bottomLaneY + bh + 11.5} fontSize={8} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        0px shift
      </text>

      {/* captions under bottom lane */}
      <text x={b1x + BW / 2} y={bottomLaneY + bh + 26} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption2a}
      </text>
      <text x={b2x + BW / 2} y={bottomLaneY + bh + 26} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption2b}
      </text>
    </svg>
  );
}
