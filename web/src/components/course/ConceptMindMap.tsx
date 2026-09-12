"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ConceptMapNode, type ConceptMapNodeData } from "@/app/courses/dsa/_components/ConceptMapNode";
import type { MindMapNode } from "@/lib/course/conceptMaps/types";

interface ConceptMindMapProps {
  root: MindMapNode;
  /** Announced to screen readers; the canvas itself is a visual/pointer surface. */
  label: string;
  /** "xl" for the dedicated concept-map page, "lg" for a full-width home, "md" elsewhere. */
  size?: "md" | "lg" | "xl";
  /**
   * Take the parent's height instead of the size preset's fixed pixel height —
   * for the dedicated page, where the canvas should fill the viewport. The
   * parent must have a definite height (a flex child with min-h-0).
   */
  fill?: boolean;
}

const SIZES = {
  md: { colWidth: 340, nodeWidth: 260, rowHeight: 72, circleR: 11, text: "text-xs" as const, viewport: 380 },
  lg: { colWidth: 400, nodeWidth: 300, rowHeight: 82, circleR: 13, text: "text-sm" as const, viewport: 540 },
  // The concept map's own page has nothing else competing for height, so the
  // canvas gets the room the graph actually wants instead of a panel's share.
  xl: { colWidth: 460, nodeWidth: 400, rowHeight: 104, circleR: 16, text: "text-base" as const, viewport: 720 },
} as const;

/**
 * The presets are `as const`, so their widths are literal types — fine while
 * every layout came from a preset, wrong now that the dedicated page derives
 * widths from the measured canvas. This is the shape the layout actually
 * needs: the same fields, with the sizes as plain numbers.
 */
type Dims = {
  colWidth: number;
  nodeWidth: number;
  rowHeight: number;
  circleR: number;
  text: "text-xs" | "text-sm" | "text-base";
  viewport: number;
};

const nodeTypes = { concept: ConceptMapNode };

/** Fades the canvas's own edges to transparent so it blends into whatever it sits on, instead of stopping at a hard rectangle. */
const EDGE_FADE_MASK =
  "linear-gradient(to right, transparent, black 28px, black calc(100% - 28px), transparent), linear-gradient(to bottom, transparent, black 28px, black calc(100% - 28px), transparent)";

/** Repaint React Flow's built-in Controls to our paper/ink tokens instead of its hardcoded light/dark hexes. */
const CONTROLS_VARS = {
  "--xy-controls-button-background-color": "var(--elevated)",
  "--xy-controls-button-background-color-hover": "var(--surface)",
  "--xy-controls-button-border-color": "var(--border)",
  "--xy-controls-button-color": "var(--muted)",
  "--xy-controls-button-color-hover": "var(--accent)",
} as CSSProperties;

/**
 * Rough rendered width of a node, used only to place the NEXT column. Space
 * Grotesk's average advance is ~0.49em (measured in tests/diagramTextFit),
 * which at 14px ("text-sm") is ~6.9px per character; add the card's px-3
 * padding, the collapsed-child badge, and the toggle circle's lane.
 */
function estimateNodeWidth(label: string, dims: Dims, hasBadge: boolean): number {
  const perChar =
    dims.text === "text-base" ? 7.9 : dims.text === "text-sm" ? 6.9 : 6.2;
  const padding = 24;
  const badge = hasBadge ? 30 : 0;
  return Math.min(dims.nodeWidth, Math.ceil(label.length * perChar) + padding + badge);
}

/** Breathing room between a column's widest card and the next column. */
const COLUMN_GAP = 56;

function layoutTree(
  root: MindMapNode,
  expanded: Set<string>,
  dims: Dims,
  onToggle: (id: string) => void,
): { nodes: Node<ConceptMapNodeData>[]; edges: Edge[] } {
  const nodes: Node<ConceptMapNodeData>[] = [];
  const edges: Edge[] = [];
  let row = 0;

  // Columns are PACKED, not gridded. A constant colWidth was sized for
  // fixed-width cards; now that each card hugs its label, a short parent like
  // "Binary Trees" (106px) left a ~300px hole before its children. Each level
  // now starts one gap after the widest card in the level before it.
  const widestByDepth = new Map<number, number>();
  const measure = (node: MindMapNode, depth: number): void => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expanded.has(node.id);
    const lane = hasChildren ? dims.circleR * 2 + 6 : 0;
    const width =
      estimateNodeWidth(node.label, dims, hasChildren && !isExpanded) + lane;
    widestByDepth.set(depth, Math.max(widestByDepth.get(depth) ?? 0, width));
    if (isExpanded) {
      for (const child of node.children!) measure(child, depth + 1);
    }
  };
  measure(root, 0);

  const columnX: number[] = [0];
  for (let depth = 1; depth <= widestByDepth.size; depth += 1) {
    columnX[depth] =
      columnX[depth - 1]! +
      (widestByDepth.get(depth - 1) ?? dims.nodeWidth) +
      COLUMN_GAP;
  }

  function visit(node: MindMapNode, depth: number): number {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expanded.has(node.id);
    const x = columnX[depth] ?? depth * dims.colWidth;

    let y: number;
    if (!isExpanded) {
      y = row * dims.rowHeight;
      row += 1;
    } else {
      const childYs = node.children!.map((child) => visit(child, depth + 1));
      y = (childYs[0]! + childYs[childYs.length - 1]!) / 2;
      for (const child of node.children!) {
        edges.push({
          id: `${node.id}->${child.id}`,
          source: node.id,
          target: child.id,
          type: "default",
          animated: false,
          style: { stroke: "var(--accent)", strokeOpacity: 0.85, strokeWidth: 2 },
        });
      }
    }

    nodes.push({
      id: node.id,
      type: "concept",
      position: { x, y },
      draggable: false,
      connectable: false,
      selectable: false,
      style: { transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" },
      data: {
        label: node.label,
        isRoot: depth === 0,
        isLeaf: !hasChildren,
        isExpanded,
        childCount: node.children?.length ?? 0,
        maxWidth: dims.nodeWidth,
        textSize: dims.text,
        circleSize: dims.circleR * 2,
        onToggle: () => onToggle(node.id),
      },
    });

    return y;
  }

  visit(root, 0);
  return { nodes, edges };
}

/** Approximate rendered node height — up to 2 lines of wrapped label, `min-h-9` floor. */
const NODE_HEIGHT = 56;

function ConceptMindMapInner({ root, label, size = "md", fill = false }: ConceptMindMapProps) {
  // nodeWidth is a CAP, not a width: each card hugs its own label (see
  // ConceptMapNode) and only wraps when the text would exceed this. Keeping the
  // cap at the preset stops a long label from running into the next column,
  // whose x is still depth * colWidth.
  const dims: Dims = SIZES[size];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([root.id]));
  const { fitBounds } = useReactFlow();

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);

        // Focus the toggled node and whatever is now visible beneath it —
        // not the whole tree — so expanding a deep branch doesn't zoom out
        // to fit unrelated siblings.
        const { nodes: nextNodes } = layoutTree(root, next, dims, () => {});
        const nodeBoxWidth = dims.nodeWidth + dims.circleR * 2;
        const targets = nextNodes.filter(
          (n) => n.id === id || n.id.startsWith(`${id}-`),
        );
        window.setTimeout(() => {
          const xs = targets.map((n) => n.position.x);
          const ys = targets.map((n) => n.position.y);
          let minX = Math.min(...xs);
          let minY = Math.min(...ys);
          let maxX = Math.max(...xs) + nodeBoxWidth;
          let maxY = Math.max(...ys) + NODE_HEIGHT;

          // `fitBounds` has no per-call max-zoom — a lone collapsed node is a
          // tiny box that would otherwise fill the viewport at 1:1 text
          // size. Pad the box to a floor size so the zoom level stays sane.
          const minWidth = dims.colWidth * 2.2;
          const minHeight = dims.rowHeight * 5;
          if (maxX - minX < minWidth) {
            const grow = (minWidth - (maxX - minX)) / 2;
            minX -= grow;
            maxX += grow;
          }
          if (maxY - minY < minHeight) {
            const grow = (minHeight - (maxY - minY)) / 2;
            minY -= grow;
            maxY += grow;
          }

          fitBounds(
            { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
            { duration: 700, padding: 0.3 },
          );
        }, 20);

        return next;
      });
    },
    [fitBounds, root, dims],
  );

  const { nodes, edges } = useMemo(
    () => layoutTree(root, expanded, dims, toggle),
    [root, expanded, dims, toggle],
  );

  return (
    <div
      // A flex child, NOT h-full: the parent's height comes from flex, so its
      // *specified* height is auto and a percentage child resolves to 0.
      className={fill ? "min-h-0 flex-1 overflow-hidden" : "overflow-hidden"}
      style={{
        // In fill mode height comes from the parent, so the preset's fixed
        // pixel height must not also be set — it would win over h-full.
        ...(fill ? null : { height: dims.viewport }),
        maskImage: EDGE_FADE_MASK,
        WebkitMaskImage: EDGE_FADE_MASK,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in, source-in",
      }}
      role="img"
      aria-label={`${label} concept map`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={2.2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
        <Controls
          showInteractive={false}
          className="!rounded-[length:var(--radius-md)] !border !border-border !bg-elevated !shadow-none overflow-hidden"
          style={CONTROLS_VARS}
        />
      </ReactFlow>
    </div>
  );
}

/**
 * A pannable, zoomable concept map on a React Flow canvas — the same
 * click-to-expand interaction shape as NotebookLM's Mind Map. Root's first
 * level starts open; everything deeper starts collapsed. Node position
 * changes (from expanding/collapsing a branch) and pan/zoom both animate
 * smoothly via React Flow's built-in transitions.
 */
export function ConceptMindMap(props: ConceptMindMapProps) {
  return (
    <ReactFlowProvider>
      <ConceptMindMapInner {...props} />
    </ReactFlowProvider>
  );
}
