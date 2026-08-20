import type { ReactNode } from "react";

/**
 * Vertical roadmap rail beside stage prose. Presentational — parent splits
 * the fence and nests Markdown so this file never imports Markdown (cycle).
 *
 * Nodes are unmarked discs — the stage number lives only in the heading,
 * so we don't show "0" next to "Stage 0".
 */
export function Roadmap({
  stages,
}: {
  stages: { number: string; content: ReactNode }[];
}) {
  // handbook-prose h3: 1.14em × inherited line-height 1.62 → first-line box.
  // Disc and rail endpoints share this center so the line runs node-to-node.
  const lineCenter = "calc(1.14em * 1.62 / 2)";

  return (
    <ol className="roadmap-rail relative my-8 list-none pl-0">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 flex w-[0.875rem] justify-center"
        style={{ top: lineCenter, bottom: lineCenter }}
      >
        <div className="w-px bg-border" />
      </div>
      {stages.map((stage) => (
        <li
          key={stage.number}
          className="relative grid grid-cols-[0.875rem_1fr] gap-x-3.5 pb-9 last:pb-0"
        >
          <div className="relative z-[1] flex justify-center" aria-hidden>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-pop ring-[3px] ring-background"
              style={{ marginTop: `calc(${lineCenter} - 0.25rem)` }}
            />
          </div>
          <div className="roadmap-stage-body min-w-0">{stage.content}</div>
        </li>
      ))}
    </ol>
  );
}

export function RoadmapError() {
  return (
    <div className="rounded-[length:var(--radius-md)] border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
      Invalid roadmap block — expected ### Stage N headings.
    </div>
  );
}
