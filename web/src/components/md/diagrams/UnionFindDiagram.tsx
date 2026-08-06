"use client";

/**
 * Union-Find as a forest of parent pointers. Roots are self-loops /
 * thicker nodes; arrows point toward parents.
 */

export interface UfNode {
  id: number;
  parent: number;
}

interface UnionFindDiagramProps {
  nodes?: UfNode[];
  caption?: string;
}

const DEFAULT_NODES: UfNode[] = [
  { id: 0, parent: 0 },
  { id: 1, parent: 0 },
  { id: 2, parent: 0 },
  { id: 3, parent: 3 },
  { id: 4, parent: 3 },
  { id: 5, parent: 5 },
];

const NODE_R = 16;
const PAD = 24;
const LEVEL_H = 56;

export function UnionFindDiagram({
  nodes = DEFAULT_NODES,
  caption = "find walks to root · union links two roots",
}: UnionFindDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<number, number[]>();
  const roots: number[] = [];

  for (const n of nodes) {
    if (n.parent === n.id) {
      roots.push(n.id);
    } else {
      const list = children.get(n.parent) ?? [];
      list.push(n.id);
      children.set(n.parent, list);
    }
  }
  roots.sort((a, b) => a - b);

  const placed = new Map<number, { x: number; y: number; tree: number }>();

  roots.forEach((root, ti) => {
    // Place leaves left-to-right, parents centered.
    const leafX = new Map<number, number>();
    let cursor = 0;
    function placeLeaves(id: number) {
      const kids = (children.get(id) ?? []).slice().sort((a, b) => a - b);
      if (kids.length === 0) {
        leafX.set(id, cursor++);
        return;
      }
      for (const k of kids) placeLeaves(k);
    }
    placeLeaves(root);

    function depthOf(id: number): number {
      let d = 0;
      let cur = id;
      while (byId.get(cur) && byId.get(cur)!.parent !== cur) {
        cur = byId.get(cur)!.parent;
        d++;
        if (d > 20) break;
      }
      return d;
    }

    function place(id: number) {
      const kids = children.get(id) ?? [];
      for (const k of kids) place(k);
      const d = depthOf(id);
      let x: number;
      if (kids.length === 0) {
        x = leafX.get(id) ?? 0;
      } else {
        const xs = kids.map((k) => placed.get(k)!.x);
        x = (Math.min(...xs) + Math.max(...xs)) / 2;
      }
      placed.set(id, { x: ti * 4 + x, y: d, tree: ti });
    }
    place(root);
  });

  // Normalize x per tree and offset trees.
  const treeWidths: number[] = roots.map(() => 0);
  for (const [id, p] of placed) {
    treeWidths[p.tree] = Math.max(treeWidths[p.tree]!, p.x);
  }
  // Recompute with local x
  const finalPos = new Map<number, { cx: number; cy: number }>();
  let offset = 0;
  roots.forEach((root, ti) => {
    const members = [...placed.entries()].filter(([, p]) => p.tree === ti);
    const xs = members.map(([, p]) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const localW = (maxX - minX) * 48 + NODE_R * 2;
    for (const [id, p] of members) {
      finalPos.set(id, {
        cx: offset + PAD + (p.x - minX) * 48 + NODE_R,
        cy: PAD + p.y * LEVEL_H,
      });
    }
    offset += Math.max(localW, 80) + 28;
  });

  const width = Math.max(offset + PAD, 280);
  const maxY = Math.max(0, ...[...finalPos.values()].map((p) => p.cy));
  const height = maxY + NODE_R + PAD + 28;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`Union-Find forest with ${roots.length} components`}
    >
      {nodes.map((n) => {
        if (n.parent === n.id) return null;
        const a = finalPos.get(n.id);
        const b = finalPos.get(n.parent);
        if (!a || !b) return null;
        return (
          <line
            key={`e-${n.id}`}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.6}
            markerEnd="url(#uf-arrow)"
          />
        );
      })}
      {nodes.map((n) => {
        const p = finalPos.get(n.id);
        if (!p) return null;
        const isRoot = n.parent === n.id;
        return (
          <g key={n.id}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={NODE_R}
              fill={
                isRoot
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={isRoot ? 0.2 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={isRoot ? 2 : 1.4}
            />
            <text
              x={p.cx}
              y={p.cy + 4}
              fontSize={12}
              fontWeight={700}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {n.id}
            </text>
          </g>
        );
      })}
      <text
        x={width / 2}
        y={height - 8}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {caption}
      </text>
      <defs>
        <marker
          id="uf-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--family-accent, var(--accent))" />
        </marker>
      </defs>
    </svg>
  );
}
