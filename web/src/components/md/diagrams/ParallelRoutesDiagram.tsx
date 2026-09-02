"use client";

import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

const TEAM_COLOR = "var(--family-accent, var(--accent))";
const ANALYTICS_COLOR = "var(--insight)";

/**
 * Color-links a parallel-routes file tree to the page regions each slot
 * actually renders: `@team` and `@analytics` are tinted consistently
 * across the folder names and the matching browser-mockup regions, so the
 * file-to-UI mapping reads at a glance rather than needing to be inferred
 * from prose alone.
 */
export function ParallelRoutesDiagram() {
  const width = 460;
  const height = 170;
  const treeX = 16;
  const browserX = 220;
  const browserY = 16;
  const browserW = 220;
  const browserH = 138;

  const treeLine = (y: number, text: string, color?: string, indent = 0) => (
    <text
      x={treeX + indent}
      y={y}
      fontSize={11}
      fill={color ?? "var(--foreground)"}
      fontWeight={color ? 700 : 400}
      fontFamily="var(--font-mono), monospace"
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label="A parallel-routes file tree with @team and @analytics slot folders, color-linked to the two page regions they render into inside the shared dashboard layout — team in one color, analytics in another."
    >
      {treeLine(24, "app/dashboard/")}
      {treeLine(44, "layout.tsx", undefined, 12)}
      {treeLine(64, "@team/page.tsx", TEAM_COLOR, 12)}
      {treeLine(84, "@analytics/page.tsx", ANALYTICS_COLOR, 12)}
      {treeLine(104, "page.tsx", undefined, 12)}

      <path
        d={`M ${treeX + 100} 60 C ${treeX + 150} 60, ${browserX - 30} 44, ${browserX - 4} 50`}
        stroke={TEAM_COLOR}
        strokeWidth={1.25}
        strokeDasharray="3 3"
        fill="none"
      />
      <path
        d={`M ${treeX + 120} 80 C ${treeX + 160} 80, ${browserX - 30} 110, ${browserX - 4} 104`}
        stroke={ANALYTICS_COLOR}
        strokeWidth={1.25}
        strokeDasharray="3 3"
        fill="none"
      />

      <BrowserMockup x={browserX} y={browserY} width={browserW} height={browserH} url="acme.com/dashboard">
        <g transform="translate(10, 12)">
          <rect x={0} y={0} width={200} height={44} rx={5} fill={TEAM_COLOR} fillOpacity={0.18} stroke={TEAM_COLOR} strokeWidth={1.25} />
          <text x={100} y={26} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
            team
          </text>
          <rect x={0} y={54} width={200} height={44} rx={5} fill={ANALYTICS_COLOR} fillOpacity={0.18} stroke={ANALYTICS_COLOR} strokeWidth={1.25} />
          <text x={100} y={80} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
            analytics
          </text>
        </g>
      </BrowserMockup>
    </svg>
  );
}
