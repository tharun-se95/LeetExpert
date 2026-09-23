/** Which landing section a decoration belongs to. */
export type DecoId = "understand" | "build" | "keep" | "inside";

const STROKE = "var(--rule-strong)";
const PAPER = "var(--elevated)";
const HEAT = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)"];

/**
 * A line drawing floating beside a landing section's heading (owner,
 * 2026-09-23), moving at its own speed as the page scrolls
 * (globals.css, .landing-deco): a search tree for Understand, braces and a
 * complexity for Build, a streak of squares for Keep, a rising line for What's
 * inside. Inks are tokens — the rule, the paper, the heat ramp and the
 * section's --accent — so both themes hold. Decorative, hidden from assistive
 * tech, and hidden below xl, where the heading spans the column.
 */
export function SectionDeco({ id }: { id: DecoId }) {
  const common = "landing-deco right-0 top-24 hidden xl:block";
  switch (id) {
    case "understand":
      return (
        <svg aria-hidden className={common} width="360" height="280" viewBox="0 0 360 280">
          <g fill="none" stroke={STROKE} strokeWidth="1.5">
            <line x1="180" y1="44" x2="94" y2="130" />
            <line x1="180" y1="44" x2="266" y2="130" />
            <line x1="94" y1="130" x2="46" y2="216" />
            <line x1="94" y1="130" x2="142" y2="216" />
            <line x1="266" y1="130" x2="314" y2="216" />
          </g>
          <circle cx="180" cy="44" r="22" fill={PAPER} stroke="var(--accent)" strokeWidth="2" />
          {[
            [94, 130, 18],
            [266, 130, 18],
            [142, 216, 15],
            [314, 216, 15],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={PAPER} stroke={STROKE} strokeWidth="1.5" />
          ))}
          <circle cx="46" cy="216" r="15" fill="color-mix(in oklab, var(--accent) 16%, transparent)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="173" y="50" fontFamily="var(--font-mono), monospace" fontSize="15" fill="var(--foreground)">8</text>
          <text x="89" y="135" fontFamily="var(--font-mono), monospace" fontSize="13" fill="var(--muted)">3</text>
          <text x="258" y="135" fontFamily="var(--font-mono), monospace" fontSize="13" fill="var(--muted)">12</text>
        </svg>
      );
    case "build":
      return (
        <svg aria-hidden className={common} width="400" height="260" viewBox="0 0 400 260">
          <path d="M100 26 C 60 26, 70 106, 30 126 C 70 146, 60 226, 100 226" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          <path d="M300 26 C 340 26, 330 106, 370 126 C 330 146, 340 226, 300 226" fill="none" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
          <text x="138" y="116" fontFamily="var(--font-display), monospace" fontWeight="700" fontSize="44" fill="none" stroke={STROKE} strokeWidth="1.2">
            O(n)
          </text>
          <text x="124" y="170" fontFamily="var(--font-mono), monospace" fontSize="16" fill="var(--accent)">
            seen = set()
          </text>
        </svg>
      );
    case "keep":
      return (
        <svg aria-hidden className={common} width="340" height="220" viewBox="0 0 340 220">
          {Array.from({ length: 7 * 4 }, (_, i) => {
            const c = Math.floor(i / 4);
            const r = i % 4;
            return (
              <rect key={i} x={20 + c * 40} y={30 + r * 40} width="30" height="30" rx="6" fill={HEAT[(c * 3 + r * 5 + c * r) % 5]} />
            );
          })}
          <path
            d="M312 22c4 14 20 22 20 40a20 20 0 0 1-40 0c0-10 6-16 10-20 1 8 6 12 10 12 0-12-6-22 0-32z"
            fill="color-mix(in oklab, var(--accent) 14%, transparent)"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "inside":
      return (
        <svg aria-hidden className={common} data-fast="" width="240" height="190" viewBox="0 0 240 190">
          <path d="M20 160 L 70 110 L 120 130 L 170 60 L 220 30" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          {[
            [70, 110],
            [120, 130],
            [170, 60],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="6" fill={PAPER} stroke={STROKE} strokeWidth="1.8" />
          ))}
          <circle cx="220" cy="30" r="8" fill="color-mix(in oklab, var(--accent) 16%, transparent)" stroke="var(--accent)" strokeWidth="1.8" />
        </svg>
      );
  }
}
