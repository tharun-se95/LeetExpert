"use client";

import { Clock, CursorClick, Image as ImageIcon, Megaphone } from "@phosphor-icons/react";
import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

export interface CoreWebVitalsTimelineDiagramProps {
  /** When the hero image finishes painting — the LCP moment, in ms. */
  lcpMs?: number;
  /** When the user clicks the button — the start of the INP interaction, in ms. */
  inpClickMs?: number;
  /** When the page visibly responds to that click, in ms. The gap between this and inpClickMs IS the INP number. */
  inpResponseMs?: number;
  /** When the late banner injects and pushes the card down — the CLS moment, in ms. */
  clsMs?: number;
}

/**
 * One page, one timeline — not three cards restating three definitions.
 *
 * The lesson's actual point is that "make it faster" is unanswerable until
 * you can name the specific moment and the specific on-page cause behind a
 * complaint. This diagram forces exactly that: a browser mockup of a
 * settled page, with three concrete things that just happened on it (a
 * hero image finishing paint, a click that sat unanswered, a banner
 * shoving a card down), each tagged with a small colored badge right on
 * the element responsible. A real millisecond time axis underneath names
 * *when* each one happened, and a dotted leader line runs from each axis
 * moment up to the exact column of the page it explains. A reader can
 * point at one spot in the picture and say "that's the LCP element,"
 * "that's the INP gap," "that's the CLS shift" — the shape prose can only
 * narrate one metric at a time.
 */
export function CoreWebVitalsTimelineDiagram({
  lcpMs = 1200,
  inpClickMs = 2100,
  inpResponseMs = 2620,
  clsMs = 2900,
}: CoreWebVitalsTimelineDiagramProps) {
  const inpGapMs = inpResponseMs - inpClickMs;

  // ---- Shared axis gutter, sized from the actual longest left-hand text ----
  const SANS_95 = 5.35;
  const padX = 18;
  const axisLabel = "elapsed ms";
  const gutterTextW = axisLabel.length * SANS_95 + 18;
  const plotX0 = Math.round(padX + gutterTextW + 18);
  const plotW = 460;
  const plotX1 = plotX0 + plotW;
  const rightMargin = 44;
  const width = plotX1 + rightMargin;

  const axisMax = 3400;
  const msToX = (ms: number) => plotX0 + (ms / axisMax) * plotW;
  const ticks = [0, 850, 1700, 2550, 3400];

  // ---- Browser mockup -------------------------------------------------
  const mockX = Math.round((width - (plotX1 - padX)) / 2) + padX - padX; // align mockup's right edge near plotX1
  const mockY = 26;
  const mockW = plotX1 - padX;
  const chromeH = 18;
  const contentPad = 16;

  // Left column: hero image + paragraph text + the clicked button.
  const heroX = contentPad;
  const heroY = 30;
  const heroW = 340;
  const heroH = 78;
  const paraY1 = heroY + heroH + 18;
  const paraY2 = paraY1 + 16;
  const paraY3 = paraY2 + 16;
  const btnX = contentPad;
  const btnY = paraY3 + 22;
  const btnW = 108;
  const btnH = 26;

  // Right column: the banner that arrives late and the card it pushes down.
  const sideX = heroX + heroW + 24;
  const sideW = mockW - 2 * contentPad - heroW - 24;
  const ghostY = heroY;
  const ghostH = 66;
  const bannerY = heroY;
  const bannerH = 26;
  const cardY = bannerY + bannerH + 8;
  const cardH = 66;

  const contentBottom = btnY + btnH + 16;
  const mockH = chromeH + contentBottom;
  const mockBottom = mockY + mockH;

  // ---- Timeline sits below the mockup, with a fixed gap that holds only
  // the leader lines (kept clear of text so nothing crosses a label). ----
  const leaderGap = 92;
  const axisY = mockBottom + leaderGap;
  const tickLabelY = axisY + 18;
  const eventNameY = axisY + 36;
  const eventDetailY = axisY + 48;
  const height = eventDetailY + 34;

  // Where each leader line touches the mockup's bottom edge — directly
  // under the element it explains, so "which column caused this" is
  // legible from x-position alone even before reading a label.
  const lcpAnchorX = mockX + heroX + heroW / 2;
  const inpAnchorX = mockX + btnX + btnW / 2;
  const clsAnchorX = mockX + sideX + sideW / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        "A browser mockup of a settled page sits above a millisecond time axis running from 0 to " +
        `${axisMax}. Three dotted leader lines run from specific moments on that axis up to the bottom edge of ` +
        "the exact column of the page each one explains. First, at " +
        `${lcpMs} milliseconds, a leader line rises to the hero image, tagged "LCP element" — the largest ` +
        "visible thing on the page — marking the moment it finishes painting. Second, a click lands on the " +
        `"Load more" button at ${inpClickMs} milliseconds, but the page does not visibly answer until ` +
        `${inpResponseMs} milliseconds; this gap of ${inpGapMs} milliseconds, drawn as a bracket over the axis ` +
        "and connected by its own leader line up to the button, is the INP number. Third, at " +
        `${clsMs} milliseconds a promo banner that was not there initially loads in above a content card in the ` +
        "right-hand column; a dashed outline behind it marks the card's original position and a downward arrow " +
        "shows it being pushed down, with a leader line tying this shift to that same moment on the axis — the " +
        "CLS event."
      }
    >
      <defs>
        <pattern id="cwv-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <marker id="cwv-arrow-bad" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--bad)" />
        </marker>
        <linearGradient id="cwv-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="cwv-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---------------- Browser mockup: the settled page ---------------- */}
      <BrowserMockup x={mockX} y={mockY} width={mockW} height={mockH} url="acme.com/store">
        {/* Hero image — the LCP element. A visible accent ring marks it as
            the specific thing being timed, not just "an image somewhere." */}
        <rect x={heroX - 2} y={heroY - 2} width={heroW + 4} height={heroH + 4} rx={12} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
        <rect x={heroX} y={heroY} width={heroW} height={heroH} rx={10} fill="var(--elevated)" />
        <rect x={heroX} y={heroY} width={heroW} height={heroH} rx={10} fill="url(#cwv-dots)" fillOpacity={0.5} />
        <ImageIcon x={heroX + heroW / 2 - 13} y={heroY + heroH / 2 - 13} size={26} color="var(--muted)" />
        <rect x={heroX + heroW - 78} y={heroY - 12} width={78} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
        <text x={heroX + heroW - 39} y={heroY - 0.5} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
          LCP element
        </text>

        {/* Paragraph text lines — plain neutral bars, not the subject of any metric here. */}
        <rect x={heroX} y={paraY1} width={heroW} height={8} rx={4} fill="var(--border)" />
        <rect x={heroX} y={paraY2} width={heroW * 0.82} height={8} rx={4} fill="var(--border)" />
        <rect x={heroX} y={paraY3} width={heroW * 0.55} height={8} rx={4} fill="var(--border)" />

        {/* The clicked button — the INP moment lives here. */}
        <rect x={btnX} y={btnY} width={btnW} height={btnH} rx={13} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
        <text x={btnX + btnW / 2} y={btnY + btnH / 2 + 3.5} fontSize={10} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
          Load more
        </text>
        <CursorClick x={btnX + btnW - 9} y={btnY - 9} size={16} color="var(--insight)" weight="fill" />
        <rect x={btnX + btnW + 6} y={btnY + btnH / 2 - 8.5} width={62} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--insight)" strokeWidth={1} />
        <text x={btnX + btnW + 37} y={btnY + btnH / 2 + 3.5} fontSize={9} fontWeight={600} fill="var(--insight)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
          clicked
        </text>

        {/* Right column: banner arrives late, pushes the card down. Ghost
            outline marks the card's original position so the shift has a
            visible "before" to measure against, not just an "after." */}
        <rect x={sideX} y={ghostY} width={sideW} height={ghostH} rx={10} fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" strokeLinecap="round" />
        <rect x={sideX} y={bannerY} width={sideW} height={bannerH} rx={7} fill="var(--bad)" fillOpacity={0.14} stroke="var(--bad)" strokeWidth={1} strokeDasharray="2 3" strokeLinecap="round" />
        <Megaphone x={sideX + 8} y={bannerY + bannerH / 2 - 6.5} size={13} color="var(--bad)" />
        <text x={sideX + 26} y={bannerY + bannerH / 2 + 3} fontSize={8.5} fontWeight={600} fill="var(--bad)" fontFamily="var(--font-sans), system-ui">
          banner loads late
        </text>
        <rect x={sideX} y={cardY} width={sideW} height={cardH} rx={10} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
        <rect x={sideX + 12} y={cardY + 12} width={sideW - 24} height={7} rx={3.5} fill="var(--border)" />
        <rect x={sideX + 12} y={cardY + 26} width={(sideW - 24) * 0.6} height={7} rx={3.5} fill="var(--border)" />
        <path
          d={`M ${sideX + sideW - 16} ${ghostY + ghostH - 6} L ${sideX + sideW - 16} ${cardY + 6}`}
          stroke="var(--bad)"
          strokeWidth={1.5}
          strokeLinecap="round"
          markerEnd="url(#cwv-arrow-bad)"
        />
        <rect x={sideX + sideW - 16 - 44} y={(ghostY + ghostH + cardY) / 2 - 8} width={88} height={16} rx={8} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1} />
        <text x={sideX + sideW - 16} y={(ghostY + ghostH + cardY) / 2 + 3.5} fontSize={8.5} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
          card shifts down
        </text>
      </BrowserMockup>

      {/* ---------------- Leader lines: axis moment -> page column ---------------- */}
      <path d={`M ${msToX(lcpMs)} ${axisY} L ${lcpAnchorX} ${mockBottom}`} stroke="var(--accent)" strokeWidth={1} strokeDasharray="1 4" strokeLinecap="round" fill="none" />
      <path d={`M ${msToX(inpClickMs)} ${axisY} L ${inpAnchorX} ${mockBottom}`} stroke="var(--insight)" strokeWidth={1} strokeDasharray="1 4" strokeLinecap="round" fill="none" />
      <path d={`M ${msToX(clsMs)} ${axisY} L ${clsAnchorX} ${mockBottom}`} stroke="var(--bad)" strokeWidth={1} strokeDasharray="1 4" strokeLinecap="round" fill="none" />

      {/* ---------------- Time axis ---------------- */}
      <line x1={plotX0 - 14} y1={axisY} x2={plotX0} y2={axisY} stroke="url(#cwv-fade-left)" strokeWidth={1.25} strokeLinecap="round" />
      <line x1={plotX0} y1={axisY} x2={plotX1} y2={axisY} stroke="var(--border)" strokeWidth={1.25} strokeLinecap="round" />
      <line x1={plotX1} y1={axisY} x2={plotX1 + 12} y2={axisY} stroke="url(#cwv-fade-right)" strokeWidth={1.25} strokeLinecap="round" />
      {ticks.map((t) => (
        <g key={`tick-${t}`}>
          <line x1={msToX(t)} y1={axisY} x2={msToX(t)} y2={axisY + 5} stroke="var(--border)" strokeWidth={1.25} strokeLinecap="round" />
          <text x={msToX(t)} y={tickLabelY} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
            {t}
          </text>
        </g>
      ))}
      <Clock x={plotX0 - 14 - axisLabel.length * SANS_95 - 16} y={axisY + 9} size={12} color="var(--muted)" />
      <text x={plotX0 - 14} y={tickLabelY} fontSize={9.5} fill="var(--muted)" textAnchor="end" fontFamily="var(--font-sans), system-ui">
        {axisLabel}
      </text>

      {/* ---------------- Event markers, each a dot (or bracket) plus a two-line label below the axis ---------------- */}
      {/* LCP: a single point in time. */}
      <circle cx={msToX(lcpMs)} cy={axisY} r={4.5} fill="var(--accent)" />
      <text x={msToX(lcpMs)} y={eventNameY} fontSize={10} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        LCP
      </text>
      <text x={msToX(lcpMs)} y={eventDetailY} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {lcpMs} ms
      </text>

      {/* INP: a click, a visible gap, then the response — a bracketed span, not a point. */}
      <circle cx={msToX(inpClickMs)} cy={axisY} r={4} fill="var(--insight)" />
      <circle cx={msToX(inpResponseMs)} cy={axisY} r={4} fill="var(--insight)" />
      <path
        d={`M ${msToX(inpClickMs)} ${axisY - 11} L ${msToX(inpClickMs)} ${axisY - 17} L ${msToX(inpResponseMs)} ${axisY - 17} L ${msToX(inpResponseMs)} ${axisY - 11}`}
        stroke="var(--insight)"
        strokeWidth={1.25}
        strokeLinecap="round"
        fill="none"
      />
      <text x={(msToX(inpClickMs) + msToX(inpResponseMs)) / 2} y={eventNameY} fontSize={10} fontWeight={600} fill="var(--insight)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        INP
      </text>
      <text x={(msToX(inpClickMs) + msToX(inpResponseMs)) / 2} y={eventDetailY} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {inpGapMs} ms gap
      </text>

      {/* CLS: a single point where the shift happens. */}
      <circle cx={msToX(clsMs)} cy={axisY} r={4.5} fill="var(--bad)" />
      <text x={msToX(clsMs)} y={eventNameY} fontSize={10} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        CLS
      </text>
      <text x={msToX(clsMs)} y={eventDetailY} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {clsMs} ms
      </text>

      <text x={width / 2} y={height - 6} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        each dotted line ties one moment on the axis to the exact element responsible for it
      </text>
    </svg>
  );
}
