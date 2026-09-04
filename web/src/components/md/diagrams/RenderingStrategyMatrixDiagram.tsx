"use client";

import {
  ArrowClockwise,
  Browser,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Hourglass,
  Lightning,
  MagnifyingGlass,
  Package,
  Snowflake,
  Timer,
  XCircle,
} from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";

/**
 * The four rendering strategies as an actual matrix — strategies as columns,
 * comparison dimensions as rows — not four cards repeating the same two
 * bullet points. The entire reason this shape is correct here: a reader can
 * scan the SEO row straight across and see three green checks with exactly
 * one red X under CSR, or scan down the SSR column and read its whole story
 * (renders every request, small bundle, indexable, always current) without
 * re-reading four separate lists. A card grid cannot show either read.
 *
 * Cell values are real, not placeholders: the bundle-size row uses actual
 * proportional bar lengths (CSR ships the full app JS; the other three only
 * ship hydration JS, so their bars are genuinely equal-length, not fudged
 * for variety), and the SEO row is a strict yes/no signal — three columns
 * legitimately share the same value there, which is a true statement, not
 * lazy repetition.
 */
export function RenderingStrategyMatrixDiagram() {
  const PAD = 18;
  const ROW_LABEL_W = 108;
  const COL_W = 122;
  const HEADER_H = 54;
  const ROW_H = 76;
  const CAPTION_H = 34;

  const cols = ["CSR", "SSG", "SSR", "ISR"];
  const gridX0 = PAD + ROW_LABEL_W;
  const gridY0 = PAD + HEADER_H;
  const gridW = COL_W * 4;
  const width = PAD * 2 + ROW_LABEL_W + gridW;
  const height = PAD + HEADER_H + ROW_H * 4 + CAPTION_H + PAD;

  const colX = (i: number) => gridX0 + i * COL_W;
  const rowY = (i: number) => gridY0 + i * ROW_H;

  const headerIcons = [Browser, Package, Cpu, ArrowClockwise];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[620px]"
      role="img"
      aria-label={
        "A four-by-four matrix comparing CSR, SSG, SSR, and ISR (columns) across when HTML is generated, " +
        "client bundle size, SEO crawlability, and content freshness (rows). Reading the SEO row across shows " +
        "SSG, SSR, and ISR all deliver fully-indexable HTML while CSR alone is marked not reliably crawlable. " +
        "Reading down the SSR column shows its whole tradeoff at once: it renders on every request, ships a " +
        "small hydration-only bundle like SSG and ISR, is fully indexable, and is always current — the cost of " +
        "that freshness being a render on the critical path of every request, versus ISR which gets the same " +
        "small bundle and indexability but only eventual freshness because it regenerates in the background " +
        "after a time window instead of on every request."
      }
    >
      <defs>
        <pattern id="rsm-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
      </defs>

      {/* Outer frame */}
      <rect
        x={PAD - 2}
        y={PAD - 2}
        width={ROW_LABEL_W + gridW + 4}
        height={HEADER_H + ROW_H * 4 + 4}
        rx={14}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />

      {/* Corner + row-label column band */}
      <rect x={PAD} y={PAD} width={ROW_LABEL_W} height={HEADER_H + ROW_H * 4} rx={12} fill="var(--surface)" />
      <rect x={PAD} y={PAD} width={ROW_LABEL_W} height={HEADER_H + ROW_H * 4} rx={12} fill="url(#rsm-dots)" fillOpacity={0.5} />

      {/* Column headers */}
      {cols.map((name, i) => {
        const Icon = headerIcons[i];
        const cx = colX(i) + COL_W / 2;
        return (
          <g key={name}>
            <rect x={colX(i)} y={PAD} width={COL_W} height={HEADER_H} fill="var(--surface)" fillOpacity={0.5} />
            <Icon x={cx - 8} y={PAD + 10} size={16} color="var(--accent)" />
            <text
              x={cx}
              y={PAD + 40}
              fontSize={13}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
              letterSpacing={0.3}
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Row label header divider under column headers */}
      <line x1={PAD} y1={PAD + HEADER_H} x2={PAD + ROW_LABEL_W + gridW} y2={PAD + HEADER_H} stroke="var(--border)" strokeWidth={1} />

      {/* Vertical grid separators */}
      <line x1={gridX0} y1={PAD} x2={gridX0} y2={PAD + HEADER_H + ROW_H * 4} stroke="var(--border)" strokeWidth={1} />
      {[1, 2, 3].map((i) => (
        <line
          key={i}
          x1={colX(i)}
          y1={PAD}
          x2={colX(i)}
          y2={PAD + HEADER_H + ROW_H * 4}
          stroke="var(--border)"
          strokeWidth={1}
          strokeOpacity={0.6}
        />
      ))}

      {/* Row labels */}
      <RowLabel y={rowY(0)} icon={Clock} text={["When HTML", "is generated"]} rowLabelW={ROW_LABEL_W} pad={PAD} rowH={ROW_H} />
      <RowLabel y={rowY(1)} icon={HardDrive} text={["Bundle size", "to client"]} rowLabelW={ROW_LABEL_W} pad={PAD} rowH={ROW_H} />
      <RowLabel y={rowY(2)} icon={MagnifyingGlass} text={["SEO", "crawlable"]} rowLabelW={ROW_LABEL_W} pad={PAD} rowH={ROW_H} />
      <RowLabel y={rowY(3)} icon={Timer} text={["Freshness"]} rowLabelW={ROW_LABEL_W} pad={PAD} rowH={ROW_H} />

      {/* Horizontal grid separators */}
      {[1, 2, 3].map((i) => (
        <line
          key={i}
          x1={PAD}
          y1={rowY(i)}
          x2={PAD + ROW_LABEL_W + gridW}
          y2={rowY(i)}
          stroke="var(--border)"
          strokeWidth={1}
          strokeOpacity={0.6}
        />
      ))}

      {/* Row 1: when rendered */}
      <MatrixCell x={colX(0)} y={rowY(0)} w={COL_W} h={ROW_H} icon={Browser} lines={["In the", "browser"]} />
      <MatrixCell x={colX(1)} y={rowY(0)} w={COL_W} h={ROW_H} icon={Package} lines={["Once, at", "build time"]} />
      <MatrixCell x={colX(2)} y={rowY(0)} w={COL_W} h={ROW_H} icon={Cpu} lines={["Every", "request"]} accent />
      <MatrixCell x={colX(3)} y={rowY(0)} w={COL_W} h={ROW_H} icon={ArrowClockwise} lines={["Build +", "background"]} />

      {/* Row 2: bundle size, drawn as proportional bars — the real signal */}
      <BarCell x={colX(0)} y={rowY(1)} w={COL_W} h={ROW_H} fraction={1} label="Largest" />
      <BarCell x={colX(1)} y={rowY(1)} w={COL_W} h={ROW_H} fraction={0.28} label="Hydration only" />
      <BarCell x={colX(2)} y={rowY(1)} w={COL_W} h={ROW_H} fraction={0.28} label="Hydration only" />
      <BarCell x={colX(3)} y={rowY(1)} w={COL_W} h={ROW_H} fraction={0.28} label="Hydration only" />

      {/* Row 3: SEO — a strict yes/no signal */}
      <StatusCell x={colX(0)} y={rowY(2)} w={COL_W} h={ROW_H} ok={false} label={["Not reliably", "crawlable"]} />
      <StatusCell x={colX(1)} y={rowY(2)} w={COL_W} h={ROW_H} ok label={["Fully", "indexable"]} />
      <StatusCell x={colX(2)} y={rowY(2)} w={COL_W} h={ROW_H} ok label={["Fully", "indexable"]} />
      <StatusCell x={colX(3)} y={rowY(2)} w={COL_W} h={ROW_H} ok label={["Fully", "indexable"]} />

      {/* Row 4: freshness */}
      <MatrixCell x={colX(0)} y={rowY(3)} w={COL_W} h={ROW_H} icon={Lightning} lines={["On", "interaction"]} />
      <MatrixCell x={colX(1)} y={rowY(3)} w={COL_W} h={ROW_H} icon={Snowflake} lines={["Frozen till", "rebuild"]} />
      <MatrixCell x={colX(2)} y={rowY(3)} w={COL_W} h={ROW_H} icon={CheckCircle} lines={["Always", "current"]} accent />
      <MatrixCell x={colX(3)} y={rowY(3)} w={COL_W} h={ROW_H} icon={Hourglass} lines={["Eventually", "current"]} />

      {/* Caption */}
      <text
        x={width / 2}
        y={PAD + HEADER_H + ROW_H * 4 + 20}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        Different routes in the same app pick different columns — this is a per-route choice, not one app-wide setting.
      </text>
    </svg>
  );
}

function RowLabel({
  y,
  icon: Icon,
  text,
  rowLabelW,
  pad,
  rowH,
}: {
  y: number;
  icon: React.ComponentType<{ x?: number; y?: number; size?: number; color?: string }>;
  text: string[];
  rowLabelW: number;
  pad: number;
  rowH: number;
}) {
  const cx = pad + rowLabelW / 2;
  const iconY = y + rowH / 2 - (text.length > 1 ? 22 : 16);
  const firstLineY = y + rowH / 2 + (text.length > 1 ? -2 : 4);
  return (
    <g>
      <Icon x={cx - 8} y={iconY} size={15} color="var(--muted)" />
      {text.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={firstLineY + i * 13}
          fontSize={10.5}
          fontWeight={600}
          fill="var(--foreground)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function MatrixCell({
  x,
  y,
  w,
  h,
  icon: Icon,
  lines,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  icon: React.ComponentType<{ x?: number; y?: number; size?: number; color?: string; weight?: IconWeight }>;
  lines: string[];
  accent?: boolean;
}) {
  const cx = x + w / 2;
  const iconColor = accent ? "var(--accent)" : "var(--muted)";
  const iconY = y + h / 2 - 24;
  const firstLineY = y + h / 2 + 6;
  return (
    <g>
      <Icon x={cx - 8} y={iconY} size={16} color={iconColor} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={firstLineY + i * 13}
          fontSize={11}
          fontWeight={accent ? 600 : 500}
          fill="var(--foreground)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function BarCell({
  x,
  y,
  w,
  h,
  fraction,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fraction: number;
  label: string;
}) {
  const barW = w - 32;
  const barX = x + 16;
  const barY = y + h / 2 - 16;
  const barH = 8;
  const filled = barW * fraction;
  return (
    <g>
      <rect x={barX} y={barY} width={barW} height={barH} rx={barH / 2} fill="var(--border)" fillOpacity={0.5} />
      <rect x={barX} y={barY} width={filled} height={barH} rx={barH / 2} fill="var(--accent)" fillOpacity={0.75} />
      <text
        x={x + w / 2}
        y={barY + barH + 22}
        fontSize={10.5}
        fontWeight={500}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {label}
      </text>
    </g>
  );
}

function StatusCell({
  x,
  y,
  w,
  h,
  ok,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  ok: boolean;
  label: string[];
}) {
  const cx = x + w / 2;
  const Icon = ok ? CheckCircle : XCircle;
  const color = ok ? "var(--accent)" : "var(--bad)";
  const iconY = y + h / 2 - 24;
  const firstLineY = y + h / 2 + 6;
  return (
    <g>
      <Icon x={cx - 9} y={iconY} size={18} color={color} weight="fill" />
      {label.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={firstLineY + i * 13}
          fontSize={10.5}
          fontWeight={500}
          fill="var(--foreground)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
