"use client";

/**
 * A singly linked list — value|next boxes chained to a trailing null.
 * `head` is drawn as a pointer arrow above the first node, not as its own
 * box: the lesson's whole point is that head is a reference, not a node,
 * and the old mermaid version (head as a same-shaped boxed node) blurred
 * exactly that distinction.
 */

interface LinkedListDiagramProps {
  values?: (string | number)[];
}

const NODE_W = 92;
const NODE_H = 44;
const GAP = 40;
const PAD_X = 16;
const HEAD_BAND = 32;

export function LinkedListDiagram({
  values = [7, 3, 12],
}: LinkedListDiagramProps) {
  const vals = values.slice(0, 6);
  const n = vals.length;
  const width = PAD_X * 2 + n * NODE_W + n * GAP + NODE_W * 0.6;
  const height = HEAD_BAND + NODE_H + 16;

  const nodeX = (i: number) => PAD_X + i * (NODE_W + GAP);
  const nullX = nodeX(n);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[560px]"
      role="img"
      aria-label={`A singly linked list holding ${vals.join(", ")}, with head pointing at the first node and the last node's next pointing at null`}
    >
      <text
        x={nodeX(0) + NODE_W / 2}
        y={14}
        fontSize={11}
        fontWeight={700}
        fill="var(--family-accent, var(--accent))"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        head
      </text>
      <line
        x1={nodeX(0) + NODE_W / 2}
        y1={19}
        x2={nodeX(0) + NODE_W / 2}
        y2={HEAD_BAND}
        stroke="var(--family-accent, var(--accent))"
        strokeWidth={1.5}
        markerEnd="url(#ll-arrow-accent)"
      />

      {vals.map((v, i) => {
        const x = nodeX(i);
        const y = HEAD_BAND;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={4}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.25}
            />
            <text
              x={x + NODE_W / 2}
              y={y + NODE_H / 2 + 4}
              fontSize={12}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v} | next
            </text>
            <line
              x1={x + NODE_W}
              y1={y + NODE_H / 2}
              x2={x + NODE_W + GAP}
              y2={y + NODE_H / 2}
              stroke="var(--border)"
              strokeWidth={1.5}
              markerEnd="url(#ll-arrow)"
            />
          </g>
        );
      })}

      <rect
        x={nullX}
        y={HEAD_BAND}
        width={NODE_W * 0.6}
        height={NODE_H}
        rx={4}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.25}
        strokeDasharray="3 2"
      />
      <text
        x={nullX + (NODE_W * 0.6) / 2}
        y={HEAD_BAND + NODE_H / 2 + 4}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        null
      </text>

      <defs>
        <marker
          id="ll-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--border)" />
        </marker>
        <marker
          id="ll-arrow-accent"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M0,0 L8,4 L0,8 Z"
            fill="var(--family-accent, var(--accent))"
          />
        </marker>
      </defs>
    </svg>
  );
}
