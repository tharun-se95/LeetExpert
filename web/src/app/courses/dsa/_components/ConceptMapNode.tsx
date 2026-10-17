import { Handle, Position, type NodeProps } from "@xyflow/react";
import Link from "next/link";
import { ArrowUpRight, CaretRight } from "@phosphor-icons/react/dist/ssr";

export interface ConceptMapNodeData extends Record<string, unknown> {
  label: string;
  href?: string;
  isRoot: boolean;
  isLeaf: boolean;
  isExpanded: boolean;
  childCount: number;
  /** Upper bound, not a fixed width — the card sizes to its label. */
  maxWidth: number;
  textSize: "text-xs" | "text-sm" | "text-base";
  circleSize: number;
  onToggle: () => void;
}

/**
 * React Flow custom node for the concept map — same visual language as
 * before (accent pill root / elevated card branch / muted card leaf, an
 * expand caret with a child-count badge when collapsed), now rendered as
 * a real DOM node on React Flow's pannable/zoomable canvas so it keeps
 * full keyboard and screen-reader access.
 */
export function ConceptMapNode({ data }: NodeProps & { data: ConceptMapNodeData }) {
  const { label, href, isRoot, isLeaf, isExpanded, childCount, maxWidth, textSize, circleSize, onToggle } =
    data;
  const hasChildren = !isLeaf;

  const cardClasses = isRoot
    ? `flex w-fit min-h-9 items-center gap-2 rounded-[length:var(--radius-md)] bg-accent px-3.5 py-2 font-semibold text-on-pop ${textSize}`
    : isLeaf
      ? `flex w-fit min-h-9 items-center gap-2 rounded-[length:var(--radius-md)] border border-border/70 bg-surface px-3.5 py-2 leading-snug text-foreground ${textSize}`
      : `flex w-fit min-h-9 items-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-elevated px-3.5 py-2 leading-snug font-medium text-foreground ${textSize}`;

  const content = (
    <>
      <span className="line-clamp-2 break-words">{label}</span>
      {href ? (
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover/node:opacity-100 transition-opacity" />
      ) : null}
      {hasChildren && !isExpanded ? (
        <span
          className={
            isRoot
              ? "shrink-0 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
              : "shrink-0 rounded-full bg-accent/12 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-mark"
          }
        >
          {childCount}
        </span>
      ) : null}
    </>
  );

  return (
    // w-max: the row is as wide as the card it holds, not a fixed column.
    <div className="flex w-max items-center gap-1.5">
      <Handle type="target" position={Position.Left} className="!pointer-events-none !opacity-0" />
      {href ? (
        <Link
          href={href}
          className={`nodrag nopan pointer-events-auto group/node cursor-pointer transition hover:border-accent hover:brightness-105 ${cardClasses}`}
          style={{ maxWidth }}
          title={`Open: ${label}`}
        >
          {content}
        </Link>
      ) : (
        <div className={cardClasses} style={{ maxWidth }}>
          {content}
        </div>
      )}
      {hasChildren ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${label}`}
          className="nodrag nopan pointer-events-auto flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-accent/40 bg-elevated text-mark transition hover:scale-110 hover:bg-accent/10 motion-reduce:transition-none"
          style={{ height: circleSize, width: circleSize }}
        >
          <CaretRight
            weight="bold"
            className={`h-3 w-3 transition-transform motion-reduce:transition-none ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </button>
      ) : null}
      <Handle id="right" type="source" position={Position.Right} className="!pointer-events-none !opacity-0" />
      {/* The outline layout's elbow leaves from under the card's left edge. */}
      <Handle
        id="down"
        type="source"
        position={Position.Bottom}
        className="!pointer-events-none !opacity-0"
        style={{ left: 16 }}
      />
    </div>
  );
}
