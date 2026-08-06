"use client";

/**
 * Overlapping recursion tree (naive fib) — duplicate subproblems marked.
 * Static sibling to the eventual dp-table-fill viz.
 */

export interface CallTreeNode {
  id: string;
  label: string;
  /** True when this node recomputes a subproblem already seen. */
  duplicate?: boolean;
  left?: string;
  right?: string;
}

interface OverlapTreeDiagramProps {
  nodes?: CallTreeNode[];
  caption?: string;
}

const DEFAULT_NODES: CallTreeNode[] = [
  { id: "f5", label: "fib(5)", left: "f4", right: "f3a" },
  { id: "f4", label: "fib(4)", left: "f3b", right: "f2a" },
  { id: "f3a", label: "fib(3)", left: "f2b", right: "f1a", duplicate: true },
  { id: "f3b", label: "fib(3)", left: "f2c", right: "f1b" },
  { id: "f2a", label: "fib(2)", left: "f1c", right: "f0a" },
  { id: "f2b", label: "fib(2)", duplicate: true },
  { id: "f2c", label: "fib(2)" },
  { id: "f1a", label: "fib(1)", duplicate: true },
  { id: "f1b", label: "fib(1)" },
  { id: "f1c", label: "fib(1)" },
  { id: "f0a", label: "fib(0)" },
];

const X_UNIT = 52;
const LEVEL_H = 52;
const NODE_R = 18;
const PAD = 22;

interface Placed {
  x: number;
  y: number;
}

export function OverlapTreeDiagram({
  nodes = DEFAULT_NODES,
  caption = "shaded nodes recompute a subproblem already solved",
}: OverlapTreeDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const placed = new Map<string, Placed>();
  const edges: { from: string; to: string }[] = [];
  let cursor = 0;

  function place(id: string, depth: number) {
    const node = byId.get(id);
    if (!node) return;
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

  const rootId = nodes[0]?.id;
  if (rootId) place(rootId, 0);

  // Re-center parents over children for a tidier look.
  function recenter(id: string) {
    const node = byId.get(id);
    if (!node) return;
    if (node.left) recenter(node.left);
    if (node.right) recenter(node.right);
    if (node.left && node.right) {
      const a = placed.get(node.left)!;
      const b = placed.get(node.right)!;
      const p = placed.get(id)!;
      p.x = (a.x + b.x) / 2;
    } else if (node.left) {
      placed.get(id)!.x = placed.get(node.left)!.x;
    } else if (node.right) {
      placed.get(id)!.x = placed.get(node.right)!.x;
    }
  }
  if (rootId) recenter(rootId);

  const xs = [...placed.values()].map((p) => p.x);
  const ys = [...placed.values()].map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const width = maxX - minX + PAD * 2 + NODE_R * 2;
  const height = (maxY + 1) * LEVEL_H + PAD + 24;

  const at = (id: string) => {
    const p = placed.get(id)!;
    return { cx: p.x - minX + PAD + NODE_R, cy: p.y * LEVEL_H + PAD };
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label="Naive Fibonacci call tree with overlapping subproblems highlighted"
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
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.4}
            strokeOpacity={0.65}
          />
        );
      })}
      {[...placed.keys()].map((id) => {
        const node = byId.get(id)!;
        const { cx, cy } = at(id);
        const dup = Boolean(node.duplicate);
        return (
          <g key={id}>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              fill={
                dup
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={dup ? 0.22 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={dup ? 2 : 1.25}
              strokeDasharray={dup ? "3 2" : undefined}
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
              {node.label.replace("fib", "f")}
            </text>
          </g>
        );
      })}
      <text
        x={width / 2}
        y={height - 6}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {caption}
      </text>
    </svg>
  );
}
