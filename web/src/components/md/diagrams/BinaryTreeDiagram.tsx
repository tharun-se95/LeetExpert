"use client";

/**
 * A small static binary tree — parent/child edges laid out by an in-order
 * walk (each visited slot, real or a null-leaf marker, gets the next x
 * unit; y is just depth). Good for trees this shallow; not a general
 * tidy-tree layout. Replaces the binary-trees module's mermaid flowcharts.
 */

export interface BinaryTreeNode {
  id: string;
  label?: string;
  left?: string;
  right?: string;
  /** Draw an explicit "null" leaf marker under this node on that side. */
  nullLeft?: boolean;
  nullRight?: boolean;
}

interface BinaryTreeDiagramProps {
  nodes?: BinaryTreeNode[];
}

const DEFAULT_NODES: BinaryTreeNode[] = [
  { id: "1", left: "2", right: "3" },
  { id: "2", left: "4", right: "5" },
];

const X_UNIT = 56;
const LEVEL_H = 56;
const NODE_R = 18;
const PAD = 24;

interface Placed {
  x: number;
  y: number;
  label: string;
  phantom?: boolean;
}

export function BinaryTreeDiagram({
  nodes = DEFAULT_NODES,
}: BinaryTreeDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const placed = new Map<string, Placed>();
  const edges: { from: string; to: string; phantomKey?: string }[] = [];
  let cursor = 0;

  function place(id: string, depth: number) {
    // Leaves with no children of their own don't need an explicit entry —
    // treat any id referenced as a child but absent from `nodes` as a
    // plain leaf, rather than silently dropping it (which would leave a
    // dangling edge pointing at nothing).
    const node = byId.get(id) ?? { id };

    if (node.left) {
      place(node.left, depth + 1);
      edges.push({ from: id, to: node.left });
    } else if (node.nullLeft) {
      const key = `${id}-null-l`;
      placed.set(key, {
        x: cursor++ * X_UNIT,
        y: depth + 1,
        label: "null",
        phantom: true,
      });
      edges.push({ from: id, to: key });
    }

    placed.set(id, {
      x: cursor++ * X_UNIT,
      y: depth,
      label: node.label ?? node.id,
    });

    if (node.right) {
      place(node.right, depth + 1);
      edges.push({ from: id, to: node.right });
    } else if (node.nullRight) {
      const key = `${id}-null-r`;
      placed.set(key, {
        x: cursor++ * X_UNIT,
        y: depth + 1,
        label: "null",
        phantom: true,
      });
      edges.push({ from: id, to: key });
    }
  }

  const rootId = nodes[0]?.id;
  if (rootId) place(rootId, 0);

  const xs = [...placed.values()].map((p) => p.x);
  const ys = [...placed.values()].map((p) => p.y);
  const maxX = Math.max(0, ...xs);
  const maxY = Math.max(0, ...ys);
  const width = maxX + PAD * 2 + NODE_R;
  const height = (maxY + 1) * LEVEL_H + PAD;

  const at = (id: string) => {
    const p = placed.get(id)!;
    return { cx: p.x + PAD, cy: p.y * LEVEL_H + PAD };
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label={`A binary tree with ${nodes.length} nodes, root ${byId.get(rootId ?? "")?.label ?? rootId}`}
    >
      {edges.map((e) => {
        const a = at(e.from);
        const b = at(e.to);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke="var(--border)"
            strokeWidth={1.5}
          />
        );
      })}

      {[...placed.entries()].map(([id, p]) => {
        const cx = p.x + PAD;
        const cy = p.y * LEVEL_H + PAD;
        if (p.phantom) {
          return (
            <g key={id}>
              <rect
                x={cx - 16}
                y={cy - 10}
                width={32}
                height={20}
                rx={4}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1.25}
                strokeDasharray="3 2"
              />
              <text
                x={cx}
                y={cy + 3}
                fontSize={8.5}
                fill="var(--muted)"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
              >
                null
              </text>
            </g>
          );
        }
        return (
          <g key={id}>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.12}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 4}
              fontSize={12}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
