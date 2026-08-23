"use client";

import { useId, useMemo, useState } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import type { MindMapNode } from "@/lib/course/conceptMaps/types";

interface ConceptMindMapProps {
  root: MindMapNode;
  /** Announced by the SVG connector layer's title. */
  label: string;
  /** "lg" for a dedicated, full-width home (module page); "md" elsewhere. */
  size?: "md" | "lg";
}

const SIZES = {
  md: { colWidth: 248, nodeWidth: 210, rowHeight: 52, circleR: 11, text: "text-xs" },
  lg: { colWidth: 300, nodeWidth: 250, rowHeight: 60, circleR: 13, text: "text-sm" },
} as const;

interface PlacedNode {
  node: MindMapNode;
  x: number;
  y: number;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

interface Edge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

function layoutTree(
  root: MindMapNode,
  expanded: Set<string>,
  dims: (typeof SIZES)[keyof typeof SIZES],
) {
  const placed: PlacedNode[] = [];
  const edges: Edge[] = [];
  let row = 0;

  function visit(node: MindMapNode, depth: number): number {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expanded.has(node.id);
    const x = depth * dims.colWidth;

    if (!isExpanded) {
      const y = row * dims.rowHeight + dims.rowHeight / 2;
      row += 1;
      placed.push({ node, x, y, depth, hasChildren, isExpanded });
      return y;
    }

    const childYs = node.children!.map((child) => visit(child, depth + 1));
    const y = (childYs[0]! + childYs[childYs.length - 1]!) / 2;
    placed.push({ node, x, y, depth, hasChildren, isExpanded });
    const fromX = x + dims.nodeWidth + dims.circleR * 2;
    for (const toY of childYs) {
      edges.push({
        fromX,
        fromY: y,
        toX: depth * dims.colWidth + dims.colWidth,
        toY,
      });
    }
    return y;
  }

  visit(root, 0);
  const maxDepth = Math.max(...placed.map((p) => p.depth));
  const width = maxDepth * dims.colWidth + dims.nodeWidth + dims.circleR * 2 + 8;
  const height = Math.max(row * dims.rowHeight, dims.rowHeight);
  return { placed, edges, width, height };
}

/**
 * A horizontal, click-to-expand concept map — the same interaction shape
 * as NotebookLM's Mind Map, rebuilt as a real (theme-aware, keyboard-
 * accessible) component instead of a raster export. Root's first level
 * starts open; everything deeper starts collapsed.
 */
export function ConceptMindMap({ root, label, size = "md" }: ConceptMindMapProps) {
  const dims = SIZES[size];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([root.id]));
  const titleId = useId();

  const { placed, edges, width, height } = useMemo(
    () => layoutTree(root, expanded, dims),
    [root, expanded, dims],
  );

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div
        role="img"
        aria-labelledby={titleId}
        className="relative motion-reduce:[&_*]:transition-none"
        style={{ width, height, minWidth: "100%" }}
      >
        <span id={titleId} className="sr-only">
          {label} concept map
        </span>
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={height}
          aria-hidden
        >
          {edges.map((e, i) => {
            const midX = (e.fromX + e.toX) / 2;
            return (
              <path
                key={i}
                d={`M ${e.fromX} ${e.fromY} C ${midX} ${e.fromY}, ${midX} ${e.toY}, ${e.toX} ${e.toY}`}
                fill="none"
                stroke="var(--accent)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
        {placed.map(({ node, x, y, depth, hasChildren, isExpanded }) => {
          const isRoot = depth === 0;
          return (
            <div
              key={node.id}
              className="absolute flex -translate-y-1/2 items-center gap-1.5"
              style={{ left: x, top: y, width: dims.nodeWidth + dims.circleR * 2 }}
            >
              <div
                className={
                  isRoot
                    ? `flex min-h-9 w-full items-center rounded-[length:var(--radius-md)] bg-accent px-3 py-1.5 font-semibold text-on-pop ${dims.text}`
                    : `flex min-h-9 w-full items-center rounded-[length:var(--radius-md)] border border-border bg-elevated px-3 py-1.5 leading-snug text-foreground ${dims.text}`
                }
                style={{ width: dims.nodeWidth }}
              >
                {node.label}
              </div>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(node.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                  className="flex shrink-0 items-center justify-center rounded-full border border-accent/40 bg-elevated text-accent transition hover:bg-accent/10 motion-reduce:transition-none"
                  style={{ height: dims.circleR * 2, width: dims.circleR * 2 }}
                >
                  <CaretRight
                    weight="bold"
                    className={`h-3 w-3 transition-transform motion-reduce:transition-none ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
