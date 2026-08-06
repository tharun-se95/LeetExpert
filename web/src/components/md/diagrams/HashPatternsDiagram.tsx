"use client";

/**
 * Four hash-table verbs as mini map/set shapes: Seen / Count / Index / Group.
 */

interface HashPatternsDiagramProps {
  /** Which patterns to show (default all four). */
  patterns?: Array<"seen" | "count" | "index" | "group">;
}

const CARDS: Record<
  string,
  { title: string; subtitle: string; rows: string[] }
> = {
  seen: {
    title: "Seen",
    subtitle: "set membership",
    rows: ["3 ✓", "7 ✓", "1 ✓"],
  },
  count: {
    title: "Count",
    subtitle: "frequencies",
    rows: ["a → 2", "n → 1", "g → 1"],
  },
  index: {
    title: "Index",
    subtitle: "value → position",
    rows: ["2 → 0", "7 → 1", "11 → 2"],
  },
  group: {
    title: "Group",
    subtitle: "key → list",
    rows: ['3 → ["cat","dog"]', '4 → ["fish"]'],
  },
};

export function HashPatternsDiagram({
  patterns = ["seen", "count", "index", "group"],
}: HashPatternsDiagramProps) {
  const cards = patterns.map((p) => CARDS[p]!).filter(Boolean);
  const CARD_W = 150;
  const CARD_H = 118;
  const GAP = 14;
  const PAD = 12;
  const cols = Math.min(cards.length, 4);
  const width = PAD * 2 + cols * CARD_W + (cols - 1) * GAP;
  const height = PAD * 2 + CARD_H;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[640px]"
      role="img"
      aria-label={`Hash table patterns: ${cards.map((c) => c.title).join(", ")}`}
    >
      {cards.map((card, i) => {
        const x = PAD + i * (CARD_W + GAP);
        const y = PAD;
        return (
          <g key={card.title}>
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={CARD_H}
              rx={8}
              fill="var(--surface)"
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.25}
            />
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={28}
              rx={8}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.12}
            />
            {/* square off bottom of header fill */}
            <rect
              x={x}
              y={y + 14}
              width={CARD_W}
              height={14}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.12}
            />
            <text
              x={x + CARD_W / 2}
              y={y + 18}
              fontSize={12}
              fontWeight={700}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {card.title}
            </text>
            <text
              x={x + CARD_W / 2}
              y={y + 42}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {card.subtitle}
            </text>
            {card.rows.map((row, ri) => (
              <text
                key={ri}
                x={x + 12}
                y={y + 62 + ri * 16}
                fontSize={11}
                fill="var(--foreground)"
                fontFamily="var(--font-mono), monospace"
              >
                {row}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
