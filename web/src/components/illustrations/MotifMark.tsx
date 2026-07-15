"use client";

import type { FamilyMotif } from "@/lib/visual/familyTheme";

/** Shared museum stroke language — viewBox 0 0 160 160 */
export function MotifMark({
  motif,
  accent,
  className,
}: {
  motif: FamilyMotif;
  accent: string;
  className?: string;
}) {
  const stroke = accent;
  const fill = accent;
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const soft = { fill, fillOpacity: 0.12 };

  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden>
      {motif === "tiles" && (
        <>
          <rect
            x="28"
            y="40"
            width="32"
            height="32"
            rx="4"
            {...common}
            {...soft}
          />
          <rect x="64" y="40" width="32" height="32" rx="4" {...common} />
          <rect
            x="100"
            y="40"
            width="32"
            height="32"
            rx="4"
            {...common}
            {...soft}
          />
          <rect x="28" y="76" width="32" height="32" rx="4" {...common} />
          <rect
            x="64"
            y="76"
            width="32"
            height="32"
            rx="4"
            {...common}
            {...soft}
          />
          <rect x="100" y="76" width="32" height="32" rx="4" {...common} />
        </>
      )}
      {motif === "cursors" && (
        <>
          <path d="M40 36 L40 124" {...common} />
          <path d="M120 36 L120 124" {...common} />
          <path d="M34 50 L46 50 L40 38 Z" fill={stroke} />
          <path d="M114 110 L126 110 L120 122 Z" fill={stroke} />
          <rect
            x="52"
            y="70"
            width="56"
            height="20"
            rx="4"
            {...common}
            {...soft}
          />
        </>
      )}
      {motif === "ruler" && (
        <>
          <path d="M28 80 L132 80" {...common} />
          {[40, 56, 72, 88, 104, 120].map((x) => (
            <path key={x} d={`M${x} 72 L${x} 88`} {...common} />
          ))}
          <path d="M72 48 L88 80 L72 80 Z" fill={stroke} fillOpacity={0.85} />
          <path
            d="M28 80 L72 80"
            stroke={stroke}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.35}
          />
        </>
      )}
      {motif === "tree" && (
        <>
          <circle cx="80" cy="36" r="12" {...common} {...soft} />
          <circle cx="48" cy="80" r="12" {...common} />
          <circle cx="112" cy="80" r="12" {...common} />
          <circle cx="32" cy="124" r="10" {...common} {...soft} />
          <circle cx="64" cy="124" r="10" {...common} />
          <path
            d="M80 48 L48 68 M80 48 L112 68 M48 92 L32 114 M48 92 L64 114"
            {...common}
          />
        </>
      )}
      {motif === "switchboard" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={28 + i * 22}
              y="56"
              width="18"
              height="48"
              rx="4"
              {...common}
              {...(i % 2 === 0 ? soft : {})}
            />
          ))}
          <path d="M36 48 L36 56 M58 48 L58 56 M80 40 L80 56" {...common} />
        </>
      )}
      {motif === "constellation" && (
        <>
          <circle cx="40" cy="50" r="8" {...common} {...soft} />
          <circle cx="100" cy="40" r="8" {...common} />
          <circle cx="120" cy="90" r="8" {...common} {...soft} />
          <circle cx="60" cy="110" r="8" {...common} />
          <circle cx="80" cy="70" r="10" {...common} {...soft} />
          <path
            d="M40 50 L80 70 L100 40 M80 70 L120 90 M80 70 L60 110"
            {...common}
          />
        </>
      )}
      {motif === "podium" && (
        <>
          <rect
            x="64"
            y="40"
            width="32"
            height="28"
            rx="3"
            {...common}
            {...soft}
          />
          <rect x="36" y="68" width="32" height="40" rx="3" {...common} />
          <rect x="92" y="78" width="32" height="30" rx="3" {...common} />
          <path d="M28 120 L132 120" {...common} />
        </>
      )}
    </svg>
  );
}
