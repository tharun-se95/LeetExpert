"use client";

/**
 * One question branching into 2-3 outcomes — for lessons whose real
 * content is a decision rule: which Server/Client Component to use,
 * which dynamic-segment convention fits, when Next.js isn't the right
 * tool at all. The question sits at the top; each branch is a labeled
 * outcome box below it.
 */
export interface DecisionBranch {
  condition: string;
  outcome: string;
  highlight?: boolean;
}

interface DecisionFrameworkDiagramProps {
  question?: string;
  branches?: DecisionBranch[];
}

const BRANCH_W = 150;
const BRANCH_H = 58;
const GAP = 20;
const PAD = 12;

export function DecisionFrameworkDiagram({
  question = "What does this need?",
  branches = [
    { condition: "Condition A", outcome: "Outcome A" },
    { condition: "Condition B", outcome: "Outcome B" },
  ],
}: DecisionFrameworkDiagramProps) {
  const width = PAD * 2 + branches.length * BRANCH_W + (branches.length - 1) * GAP;
  const qY = 16;
  const branchY = 66;
  const height = branchY + BRANCH_H + 12;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`${question} ${branches.map((b) => `If ${b.condition}: ${b.outcome}.`).join(" ")}`}
    >
      <rect
        x={width / 2 - 110}
        y={0}
        width={220}
        height={32}
        rx={16}
        fill="var(--elevated)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={width / 2}
        y={16}
        fontSize={11}
        fontWeight={700}
        fill="var(--foreground)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans), system-ui"
      >
        {question}
      </text>
      {branches.map((b, i) => {
        const x = PAD + i * (BRANCH_W + GAP);
        const centerX = x + BRANCH_W / 2;
        return (
          <g key={i}>
            <path
              d={`M ${width / 2} 32 L ${centerX} ${branchY - 6}`}
              stroke="var(--muted)"
              strokeWidth={1}
              markerEnd="url(#decisionArrow)"
              fill="none"
            />
            <rect
              x={x}
              y={branchY}
              width={BRANCH_W}
              height={BRANCH_H}
              rx={6}
              fill={b.highlight ? "var(--family-accent, var(--accent))" : "var(--surface)"}
              fillOpacity={b.highlight ? 0.16 : 1}
              stroke={b.highlight ? "var(--family-accent, var(--accent))" : "var(--border)"}
              strokeWidth={b.highlight ? 1.5 : 1}
            />
            <text
              x={centerX}
              y={branchY + 18}
              fontSize={9.5}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {b.condition}
            </text>
            <text
              x={centerX}
              y={branchY + 38}
              fontSize={11}
              fontWeight={700}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {b.outcome}
            </text>
          </g>
        );
      })}
      <defs>
        <marker id="decisionArrow" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
          <path d="M0,0 L6,0 L3,6 Z" fill="var(--muted)" />
        </marker>
      </defs>
    </svg>
  );
}
