"use client";

import { useCallback, useMemo, useState } from "react";
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
import { ConceptMapNode, type ConceptMapNodeData } from "@/components/course/ConceptMapNode";
import type { MindMapNode } from "@/lib/course/conceptMaps/types";

interface ConceptMindMapProps {
  root: MindMapNode;
  /** Announced to screen readers; the canvas itself is a visual/pointer surface. */
  label: string;
  /** "lg" for a dedicated, full-width home (module page); "md" elsewhere. */
  size?: "md" | "lg";
}

const SIZES = {
  md: { colWidth: 252, nodeWidth: 200, rowHeight: 54, circleR: 11, text: "text-xs" as const, viewport: 380 },
  lg: { colWidth: 300, nodeWidth: 240, rowHeight: 62, circleR: 13, text: "text-sm" as const, viewport: 540 },
} as const;

const nodeTypes = { concept: ConceptMapNode };

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
          style: { stroke: "var(--accent)", strokeOpacity: 0.4, strokeWidth: 1.5 },
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

function ConceptMindMapInner({ root, label, size = "md" }: ConceptMindMapProps) {
  const dims = SIZES[size];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([root.id]));
  const { fitView } = useReactFlow();

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      window.setTimeout(() => fitView({ duration: 300, padding: 0.2 }), 20);
    },
    [fitView],
  );

  const { nodes, edges } = useMemo(
    () => layoutTree(root, expanded, dims, toggle),
    [root, expanded, dims, toggle],
  );

  return (
    <div
      className="overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-background/40"
      style={{ height: dims.viewport }}
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
          className="!rounded-[length:var(--radius-md)] !border !border-border !bg-elevated !shadow-none"
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
