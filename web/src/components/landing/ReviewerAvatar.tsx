import { useId } from "react";
import { FAMILY_THEMES } from "@/lib/visual/familyTheme";

/** A small, stable string hash (FNV-1a), so a name always draws the same avatar. */
export function nameHash(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The two family colours a reviewer's avatar and card band are drawn in, and
 * the ink the family table picks for text on the first.
 */
export function reviewerColours(name: string): { a: string; b: string; ink: string } {
  const h = nameHash(name);
  const n = FAMILY_THEMES.length;
  const first = FAMILY_THEMES[h % n]!;
  const second = FAMILY_THEMES[((h % n) + 1 + ((h >>> 8) % (n - 1))) % n]!;
  return { a: first.accentUi, b: second.accentUi, ink: first.onAccentUi };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .join("")
    .slice(0, 2);
}

/**
 * A generated avatar for a placeholder reviewer (owner, 2026-09-23): a
 * two-colour gradient from the course families' palette, a soft shape turned
 * by the name, and the initials — deterministic from the name, and never a
 * photo of anyone, so a placeholder can't pass for a real person. Decorative:
 * the name beside it is the accessible label.
 */
export function ReviewerAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const id = useId();
  const { a, b, ink } = reviewerColours(name);
  const turn = nameHash(name) % 360;
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="64" height="64" fill={`url(#${id}-g)`} />
        <rect x="22" y="-6" width="52" height="52" rx="16" fill={a} opacity="0.55" transform={`rotate(${turn} 32 32)`} />
        <circle cx={16 + (turn % 32)} cy="54" r="18" fill={b} opacity="0.5" />
      </g>
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), monospace"
        fontWeight="700"
        fontSize="22"
        fill={ink}
      >
        {initials(name)}
      </text>
    </svg>
  );
}
