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
  /** "lg" for a dedicated, full-width home (module page); "md" elsewhere. */
  size?: "md" | "lg";
}

const SIZES = {
  md: { colWidth: 340, nodeWidth: 260, rowHeight: 72, circleR: 11, text: "text-xs" as const, viewport: 380 },
  lg: { colWidth: 400, nodeWidth: 300, rowHeight: 82, circleR: 13, text: "text-sm" as const, viewport: 540 },
} as const;

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

function layoutTree(
  root: MindMapNode,
  expanded: Set<string>,
  dims: (typeof SIZES)[keyof typeof SIZES],
  onToggle: (id: string) => void,
): { nodes: Node<ConceptMapNodeData>[]; edges: Edge[] } {
  const nodes: Node<ConceptMapNodeData>[] = [];
  const edges: Edge[] = [];
  let row = 0;

  function visit(node: MindMapNode, depth: number): number {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expanded.has(node.id);
    const x = depth * dims.colWidth;

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
        width: dims.nodeWidth,
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

function ConceptMindMapInner({ root, label, size = "md" }: ConceptMindMapProps) {
  const dims = SIZES[size];
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
      className="overflow-hidden"
      style={{
        height: dims.viewport,
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
