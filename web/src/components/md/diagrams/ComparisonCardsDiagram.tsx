"use client";

/**
 * N side-by-side cards, each with a title and a short bullet list — the
 * "X vs Y (vs Z)" shape that recurs constantly in this course: RSC vs SSR
 * vs CSR, sessions vs JWTs, layout vs template, Node vs Edge. One card can
 * be tinted with the theme accent to mark it as the recommended/default
 * option. Points wrap onto a second line rather than truncating — losing
 * the second half of a point ("Freshness: always curre…") defeats the
 * purpose of a comparison diagram.
 */
export interface ComparisonCard {
  title: string;
  points: string[];
  highlight?: boolean;
}

interface ComparisonCardsDiagramProps {
  cards?: ComparisonCard[];
}

const CARD_W = 190;
const GAP = 14;
const PAD = 12;
const LINE_H = 13;
const POINT_GAP = 5;
const TITLE_H = 28;
const CHARS_PER_LINE = 30;

/** Greedy word-wrap into at most 2 lines; a rare 3rd-line overflow is
 *  accepted rather than silently dropped. */
function wrap(text: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function ComparisonCardsDiagram({
  cards = [
    { title: "Option A", points: ["Point one", "Point two"] },
    { title: "Option B", points: ["Point one", "Point two"] },
  ],
}: ComparisonCardsDiagramProps) {
  const wrappedCards = cards.map((c) => ({
    ...c,
    wrappedPoints: c.points.map(wrap),
  }));
  const totalLines = (points: string[][]) =>
    points.reduce((sum, lines) => sum + lines.length, 0) + (points.length - 1) * 0.4;
  const maxLines = Math.max(...wrappedCards.map((c) => totalLines(c.wrappedPoints)), 1);
  const cardH = TITLE_H + maxLines * LINE_H + PAD * 1.5;
  const width = PAD * 2 + cards.length * CARD_W + (cards.length - 1) * GAP;
  const height = PAD * 2 + cardH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[600px]"
      role="img"
      aria-label={cards
        .map((c) => `${c.title}: ${c.points.join("; ")}`)
        .join(" — vs — ")}
    >
      {wrappedCards.map((card, i) => {
        const x = PAD + i * (CARD_W + GAP);
        const y = PAD;
        let lineCursor = 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={cardH}
              rx={7}
              fill={card.highlight ? "var(--family-accent, var(--accent))" : "var(--surface)"}
              fillOpacity={card.highlight ? 0.14 : 1}
              stroke={card.highlight ? "var(--family-accent, var(--accent))" : "var(--border)"}
              strokeWidth={card.highlight ? 1.5 : 1}
            />
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={TITLE_H}
              rx={7}
              fill={card.highlight ? "var(--family-accent, var(--accent))" : "var(--elevated)"}
              fillOpacity={card.highlight ? 0.85 : 1}
            />
            <rect
              x={x}
              y={y + TITLE_H - 7}
              width={CARD_W}
              height={7}
              fill={card.highlight ? "var(--family-accent, var(--accent))" : "var(--elevated)"}
              fillOpacity={card.highlight ? 0.85 : 1}
            />
            <text
              x={x + CARD_W / 2}
              y={y + TITLE_H / 2}
              fontSize={11.5}
              fontWeight={700}
              fill={card.highlight ? "var(--on-pop)" : "var(--foreground)"}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-sans), system-ui"
            >
              {card.title}
            </text>
            {card.wrappedPoints.map((lines, j) => {
              const nodes = lines.map((line, k) => {
                const node = (
                  <text
                    key={`${j}-${k}`}
                    x={x + 10}
                    y={y + TITLE_H + PAD / 2 + (lineCursor + k) * LINE_H + 10}
                    fontSize={9.5}
                    fill="var(--muted)"
                    fontFamily="var(--font-sans), system-ui"
                  >
                    {line}
                  </text>
                );
                return node;
              });
              lineCursor += lines.length + 0.4;
              return nodes;
            })}
          </g>
        );
      })}
    </svg>
  );
}
