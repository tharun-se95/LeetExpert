"use client";

/**
 * Backtracking choice tree: root → partial paths → leaves (solutions).
 * One branch shows choose → explore → unchoose as labels on the path.
 */

export interface BtNode {
  id: string;
  label: string;
  /** Mark as a complete solution leaf. */
  solution?: boolean;
  /** Mark as pruned. */
  pruned?: boolean;
  children?: string[];
}

interface BacktrackingTreeDiagramProps {
  nodes?: BtNode[];
  caption?: string;
}

const DEFAULT_NODES: BtNode[] = [
  { id: "r", label: "[]", children: ["a", "b", "c"] },
  { id: "a", label: "[1]", children: ["a2", "a3"] },
  { id: "b", label: "[2]", children: ["b3"] },
  { id: "c", label: "[3]", pruned: true },
  { id: "a2", label: "[1,2]", solution: true },
  { id: "a3", label: "[1,3]", solution: true },
  { id: "b3", label: "[2,3]", solution: true },
];

const X_UNIT = 64;
const LEVEL_H = 56;
const NODE_R = 20;
const PAD = 24;

export function BacktrackingTreeDiagram({
  nodes = DEFAULT_NODES,
  caption = "choose → explore → unchoose · dashed = pruned",
}: BacktrackingTreeDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const placed = new Map<string, { x: number; y: number }>();
  const edges: { from: string; to: string }[] = [];
  let cursor = 0;

  function place(id: string, depth: number) {
    const node = byId.get(id);
    if (!node) return;
    const kids = node.children ?? [];
    if (kids.length === 0) {
      placed.set(id, { x: cursor++ * X_UNIT, y: depth });
      return;
    }
    for (const k of kids) {
      place(k, depth + 1);
      edges.push({ from: id, to: k });
    }
    const xs = kids.map((k) => placed.get(k)!.x);
    placed.set(id, {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: depth,
    });
  }

  const root = nodes[0]?.id;
  if (root) place(root, 0);

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
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label="Backtracking state-space tree with solutions and a pruned branch"
    >
      {edges.map((e) => {
        const a = at(e.from);
        const b = at(e.to);
        const child = byId.get(e.to);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            strokeDasharray={child?.pruned ? "4 3" : undefined}
          />
        );
      })}
      {[...placed.keys()].map((id) => {
        const node = byId.get(id)!;
        const { cx, cy } = at(id);
        return (
          <g key={id}>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              fill={
                node.solution
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={node.solution ? 0.22 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={node.solution ? 2 : 1.3}
              strokeDasharray={node.pruned ? "3 2" : undefined}
              opacity={node.pruned ? 0.45 : 1}
            />
            <text
              x={cx}
              y={cy + 4}
              fontSize={10}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
              opacity={node.pruned ? 0.5 : 1}
            >
              {node.label}
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
