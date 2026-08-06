"use client";

/**
 * Same small graph shown three ways: node-link picture, adjacency list,
 * adjacency matrix. Makes the sparse-vs-dense cost story concrete.
 */

export interface GraphEdge {
  from: number;
  to: number;
}

interface GraphRepresentationDiagramProps {
  vertexCount?: number;
  edges?: GraphEdge[];
  directed?: boolean;
}

const DEFAULT_EDGES: GraphEdge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
];

export function GraphRepresentationDiagram({
  vertexCount = 4,
  edges = DEFAULT_EDGES,
  directed = false,
}: GraphRepresentationDiagramProps) {
  const V = Math.max(2, Math.min(vertexCount, 8));
  const adj: number[][] = Array.from({ length: V }, () => []);
  const matrix: number[][] = Array.from({ length: V }, () =>
    Array.from({ length: V }, () => 0),
  );
  for (const e of edges) {
    if (e.from < 0 || e.to < 0 || e.from >= V || e.to >= V) continue;
    adj[e.from].push(e.to);
    matrix[e.from][e.to] = 1;
    if (!directed) {
      adj[e.to].push(e.from);
      matrix[e.to][e.from] = 1;
    }
  }
  for (const row of adj) row.sort((a, b) => a - b);

  // Layout: left graph, middle list, right matrix.
  const graphX = 70;
  const graphY = 78;
  const R = 54;
  const positions = Array.from({ length: V }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / V;
    return {
      x: graphX + R * Math.cos(angle),
      y: graphY + R * Math.sin(angle),
    };
  });

  const listX = 160;
  const listRowH = 22;
  const matrixX = 310;
  const cell = 22;
  const width = matrixX + (V + 1) * cell + 24;
  const height = Math.max(170, 36 + V * listRowH + 24, 36 + (V + 1) * cell);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[560px]"
      role="img"
      aria-label={`Undirected graph with ${V} vertices and ${edges.length} edges, shown as picture, adjacency list, and adjacency matrix`}
    >
      <text
        x={graphX}
        y={16}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        graph
      </text>
      <text
        x={listX + 40}
        y={16}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans), system-ui"
      >
        adj list
      </text>
      <text
        x={matrixX + ((V + 1) * cell) / 2}
        y={16}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        adj matrix
      </text>

      {/* Edges */}
      {edges.map((e, i) => {
        const a = positions[e.from];
        const b = positions[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.75}
            strokeOpacity={0.75}
          />
        );
      })}
      {positions.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={14}
            fill="var(--surface)"
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.75}
          />
          <text
            x={p.x}
            y={p.y + 4}
            fontSize={12}
            fontWeight={700}
            fill="var(--foreground)"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {i}
          </text>
        </g>
      ))}

      {/* Adjacency list */}
      {adj.map((neighbors, i) => {
        const y = 36 + i * listRowH;
        return (
          <text
            key={`list-${i}`}
            x={listX}
            y={y}
            fontSize={12}
            fill="var(--foreground)"
            fontFamily="var(--font-mono), monospace"
          >
            {i}: [{neighbors.join(", ")}]
          </text>
        );
      })}

      {/* Matrix */}
      {Array.from({ length: V }, (_, j) => (
        <text
          key={`mh-${j}`}
          x={matrixX + (j + 1) * cell + cell / 2}
          y={34}
          fontSize={10}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
        >
          {j}
        </text>
      ))}
      {matrix.map((row, i) => (
        <g key={`mr-${i}`}>
          <text
            x={matrixX + cell / 2}
            y={36 + (i + 1) * cell - 6}
            fontSize={10}
            fill="var(--muted)"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {i}
          </text>
          {row.map((val, j) => {
            const x = matrixX + (j + 1) * cell;
            const y = 36 + i * cell;
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={x}
                  y={y}
                  width={cell - 2}
                  height={cell - 2}
                  rx={3}
                  fill={
                    val
                      ? "var(--family-accent, var(--accent))"
                      : "var(--surface)"
                  }
                  fillOpacity={val ? 0.2 : 1}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={x + (cell - 2) / 2}
                  y={y + (cell - 2) / 2 + 4}
                  fontSize={11}
                  fill="var(--foreground)"
                  textAnchor="middle"
                  fontFamily="var(--font-mono), monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
