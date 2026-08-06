"use client";

/**
 * BFS layers (or DFS path highlight) on a small undirected graph.
 */

export interface GraphNodePos {
  id: number;
  x: number;
  y: number;
}

interface GraphLayersDiagramProps {
  nodes?: GraphNodePos[];
  edges?: { from: number; to: number }[];
  /** Layer membership: layer index → node ids */
  layers?: number[][];
  /** Optional path highlight (DFS). */
  path?: number[];
  caption?: string;
}

const DEFAULT_NODES: GraphNodePos[] = [
  { id: 0, x: 160, y: 28 },
  { id: 1, x: 80, y: 88 },
  { id: 2, x: 240, y: 88 },
  { id: 3, x: 40, y: 148 },
  { id: 4, x: 120, y: 148 },
  { id: 5, x: 200, y: 148 },
  { id: 6, x: 280, y: 148 },
];

const DEFAULT_EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 2, to: 5 },
  { from: 2, to: 6 },
];

const DEFAULT_LAYERS = [[0], [1, 2], [3, 4, 5, 6]];

const LAYER_COLORS = [0.28, 0.18, 0.1];

export function GraphLayersDiagram({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  layers = DEFAULT_LAYERS,
  path,
  caption = "BFS layers: distance from source",
}: GraphLayersDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const layerOf = new Map<number, number>();
  layers.forEach((layer, i) => layer.forEach((id) => layerOf.set(id, i)));
  const pathSet = new Set(path ?? []);

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const width = Math.max(...xs) + 40;
  const height = Math.max(...ys) + 48;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[400px]"
      role="img"
      aria-label={caption}
    >
      {edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const onPath =
          pathSet.has(e.from) && pathSet.has(e.to);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={onPath ? 2.5 : 1.5}
            strokeOpacity={onPath ? 1 : 0.55}
          />
        );
      })}
      {nodes.map((n) => {
        const layer = layerOf.get(n.id) ?? 0;
        const onPath = pathSet.has(n.id);
        return (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={LAYER_COLORS[Math.min(layer, 2)] ?? 0.1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={onPath ? 2.25 : 1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
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
        y={height - 10}
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
