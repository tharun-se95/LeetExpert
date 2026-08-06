"use client";

/**
 * A small trie: character-labeled edges, shared prefix spine, and
 * end-of-word markers. Replaces the ASCII tree in trie-structure.
 */

export interface TrieEdge {
  from: string;
  to: string;
  char: string;
}

export interface TrieNodeSpec {
  id: string;
  /** End-of-word flag. */
  end?: boolean;
  label?: string;
}

interface TrieBranchesDiagramProps {
  nodes?: TrieNodeSpec[];
  edges?: TrieEdge[];
  rootId?: string;
}

const DEFAULT_NODES: TrieNodeSpec[] = [
  { id: "root", label: "" },
  { id: "c", label: "c" },
  { id: "ca", label: "ca" },
  { id: "car", label: "car", end: true },
  { id: "card", label: "card", end: true },
  { id: "cat", label: "cat", end: true },
  { id: "cats", label: "cats", end: true },
];

const DEFAULT_EDGES: TrieEdge[] = [
  { from: "root", to: "c", char: "c" },
  { from: "c", to: "ca", char: "a" },
  { from: "ca", to: "car", char: "r" },
  { from: "car", to: "card", char: "d" },
  { from: "ca", to: "cat", char: "t" },
  { from: "cat", to: "cats", char: "s" },
];

const X_UNIT = 70;
const LEVEL_H = 58;
const NODE_R = 16;
const PAD = 28;

interface Placed {
  x: number;
  y: number;
}

export function TrieBranchesDiagram({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  rootId = "root",
}: TrieBranchesDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, TrieEdge[]>();
  for (const e of edges) {
    const list = children.get(e.from) ?? [];
    list.push(e);
    children.set(e.from, list);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.char.localeCompare(b.char));
  }

  const placed = new Map<string, Placed>();
  let cursor = 0;

  function place(id: string, depth: number) {
    const kids = children.get(id) ?? [];
    if (kids.length === 0) {
      placed.set(id, { x: cursor++ * X_UNIT, y: depth });
      return;
    }
    for (const kid of kids) place(kid.to, depth + 1);
    const xs = kids.map((k) => placed.get(k.to)!.x);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    placed.set(id, { x: mid, y: depth });
  }

  if (byId.has(rootId)) place(rootId, 0);

  const xs = [...placed.values()].map((p) => p.x);
  const ys = [...placed.values()].map((p) => p.y);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(0, ...xs);
  const maxY = Math.max(0, ...ys);
  const width = maxX - minX + PAD * 2 + NODE_R * 2;
  const height = (maxY + 1) * LEVEL_H + PAD + 8;

  const at = (id: string) => {
    const p = placed.get(id)!;
    return {
      cx: p.x - minX + PAD + NODE_R,
      cy: p.y * LEVEL_H + PAD,
    };
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`A trie with ${nodes.filter((n) => n.end).length} end-of-word markers and shared prefix branches`}
    >
      {edges.map((e) => {
        const a = at(e.from);
        const b = at(e.to);
        const mx = (a.cx + b.cx) / 2;
        const my = (a.cy + b.cy) / 2;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            <text
              x={mx + 8}
              y={my + 4}
              fontSize={11}
              fontWeight={700}
              fill="var(--family-accent, var(--accent))"
              fontFamily="var(--font-mono), monospace"
            >
              {e.char}
            </text>
          </g>
        );
      })}

      {[...placed.keys()].map((id) => {
        const node = byId.get(id);
        const { cx, cy } = at(id);
        const isRoot = id === rootId;
        const isEnd = Boolean(node?.end);
        return (
          <g key={id}>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              fill={
                isEnd
                  ? "var(--family-accent, var(--accent))"
                  : "var(--surface)"
              }
              fillOpacity={isEnd ? 0.2 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={isEnd ? 2 : 1.25}
            />
            <text
              x={cx}
              y={cy + 4}
              fontSize={isRoot ? 9 : 10}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {isRoot ? "∅" : (node?.label ?? id).slice(-1)}
            </text>
            {isEnd && (
              <text
                x={cx + NODE_R + 2}
                y={cy - NODE_R + 4}
                fontSize={12}
                fontWeight={700}
                fill="var(--family-accent, var(--accent))"
              >
                *
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
