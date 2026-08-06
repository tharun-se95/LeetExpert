"use client";

/**
 * Balanced vs skewed binary trees side by side — why balance matters.
 */

export interface BalanceTreeNode {
  id: string;
  label?: string;
  left?: string;
  right?: string;
}

interface TreeBalanceDiagramProps {
  balanced?: BalanceTreeNode[];
  skewed?: BalanceTreeNode[];
}

const DEFAULT_BALANCED: BalanceTreeNode[] = [
  { id: "4", left: "2", right: "6" },
  { id: "2", left: "1", right: "3" },
  { id: "6", left: "5", right: "7" },
];

const DEFAULT_SKEWED: BalanceTreeNode[] = [
  { id: "1", right: "2" },
  { id: "2", right: "3" },
  { id: "3", right: "4" },
  { id: "4", right: "5" },
];

const X_UNIT = 36;
const LEVEL_H = 40;
const NODE_R = 12;
const PAD = 18;

function layout(nodes: BalanceTreeNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const placed = new Map<string, { x: number; y: number }>();
  const edges: { from: string; to: string }[] = [];
  let cursor = 0;

  function place(id: string, depth: number) {
    const node = byId.get(id) ?? { id };
    if (node.left) {
      place(node.left, depth + 1);
      edges.push({ from: id, to: node.left });
    }
    placed.set(id, { x: cursor++ * X_UNIT, y: depth });
    if (node.right) {
      place(node.right, depth + 1);
      edges.push({ from: id, to: node.right });
    }
  }

  const root = nodes[0]?.id;
  if (root) place(root, 0);
  return { byId, placed, edges, root };
}

function renderTree(
  nodes: BalanceTreeNode[],
  originX: number,
  title: string,
  heightLabel: string,
) {
  const { byId, placed, edges, root } = layout(nodes);
  const xs = [...placed.values()].map((p) => p.x);
  const ys = [...placed.values()].map((p) => p.y);
  const minX = Math.min(0, ...xs);
  const maxY = Math.max(0, ...ys);
  const at = (id: string) => {
    const p = placed.get(id)!;
    return {
      cx: originX + (p.x - minX) + PAD + NODE_R,
      cy: 28 + p.y * LEVEL_H + PAD,
    };
  };
  const treeW = Math.max(...xs) - minX + PAD * 2 + NODE_R * 2;

  return {
    treeW,
    maxY,
    el: (
      <g>
        <text
          x={originX + treeW / 2}
          y={16}
          fontSize={12}
          fontWeight={600}
          fill="var(--muted)"
          textAnchor="middle"
        >
          {title}
        </text>
        {edges.map((e) => {
          const a = at(e.from);
          const b = at(e.to);
          return (
            <line
              key={`${title}-${e.from}-${e.to}`}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.4}
              strokeOpacity={0.7}
            />
          );
        })}
        {[...placed.keys()].map((id) => {
          const { cx, cy } = at(id);
          return (
            <g key={`${title}-${id}`}>
              <circle
                cx={cx}
                cy={cy}
                r={NODE_R}
                fill="var(--surface)"
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy + 4}
                fontSize={10}
                fontWeight={600}
                fill="var(--foreground)"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
              >
                {byId.get(id)?.label ?? id}
              </text>
            </g>
          );
        })}
        <text
          x={originX + treeW / 2}
          y={28 + (maxY + 1) * LEVEL_H + PAD + 8}
          fontSize={11}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          {heightLabel}
        </text>
      </g>
    ),
  };
}

export function TreeBalanceDiagram({
  balanced = DEFAULT_BALANCED,
  skewed = DEFAULT_SKEWED,
}: TreeBalanceDiagramProps) {
  const left = renderTree(balanced, 0, "balanced", "height ≈ log n");
  const gap = 36;
  const right = renderTree(skewed, left.treeW + gap, "skewed", "height = n");
  const width = left.treeW + gap + right.treeW;
  const maxY = Math.max(left.maxY, right.maxY);
  const height = 28 + (maxY + 1) * LEVEL_H + PAD + 28;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label="Balanced binary tree of logarithmic height beside a skewed chain of linear height"
    >
      {left.el}
      {right.el}
    </svg>
  );
}
