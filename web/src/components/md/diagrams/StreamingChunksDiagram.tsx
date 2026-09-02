"use client";

import { BrowserMockup, FilledRow, SkeletonRow } from "@/components/md/diagrams/BrowserMockup";

/**
 * Server-to-browser streaming: fast content arrives and paints immediately
 * while a slow chunk is still in flight, shown as a browser mid-stream —
 * some rows already filled, one still a skeleton — with small squares
 * mid-air between the server and the browser representing chunks still
 * arriving. Illustrates Module 4's Streaming SSR & Suspense lesson.
 */
export function StreamingChunksDiagram() {
  const width = 460;
  const height = 160;
  const serverX = 20;
  const serverW = 70;
  const browserX = 250;
  const browserW = 190;
  const browserY = 20;
  const browserH = 120;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label="A server streams response chunks to the browser as each one finishes — fast content (header, product info) renders immediately, while a still-loading chunk (recommendations) shows a skeleton placeholder until its own data resolves."
    >
      <rect
        x={serverX}
        y={browserY + browserH / 2 - 30}
        width={serverW}
        height={60}
        rx={6}
        fill="var(--elevated)"
        stroke="var(--border)"
      />
      <text
        x={serverX + serverW / 2}
        y={browserY + browserH / 2 - 8}
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        Server
      </text>
      <text
        x={serverX + serverW / 2}
        y={browserY + browserH / 2 + 8}
        fontSize={9}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        renders
      </text>

      {/* Chunks mid-flight, each a small square drifting toward the browser. */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={serverX + serverW + 24 + i * 30}
          y={browserY + browserH / 2 - 6 + (i % 2 === 0 ? -10 : 10)}
          width={12}
          height={12}
          rx={2}
          fill="var(--family-accent, var(--accent))"
          fillOpacity={0.35 + i * 0.2}
        />
      ))}
      <path
        d={`M ${serverX + serverW + 6} ${browserY + browserH / 2} L ${browserX - 10} ${browserY + browserH / 2}`}
        stroke="var(--muted)"
        strokeWidth={1}
        strokeDasharray="3 3"
        markerEnd="url(#streamArrow)"
      />
      <defs>
        <marker id="streamArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
        </marker>
      </defs>

      <BrowserMockup x={browserX} y={browserY} width={browserW} height={browserH} url="acme.com/product/42">
        <g transform="translate(12, 14)">
          <FilledRow x={0} y={0} width={70} height={9} />
          <FilledRow x={0} y={18} width={166} height={9} />
          <FilledRow x={0} y={32} width={140} height={7} />
          <SkeletonRow x={0} y={56} width={166} height={9} />
          <SkeletonRow x={0} y={70} width={166} height={9} />
          <SkeletonRow x={0} y={84} width={100} height={9} />
        </g>
      </BrowserMockup>

      <text
        x={browserX + browserW / 2}
        y={height - 6}
        fontSize={10}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        header + product info streamed in; recommendations still loading
      </text>
    </svg>
  );
}
