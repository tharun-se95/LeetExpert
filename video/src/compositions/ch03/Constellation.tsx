import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FAMILY_ACCENTS } from "../../lib/theme";
import { sansFont } from "../../lib/fonts";
import { DrawnPath } from "../../lib/cinematic";

const POS = FAMILY_ACCENTS.map((_, i) => ({
  x: 300 + i * 220,
  y: 480 + Math.sin(i * 0.9) * 90,
}));

const PATH = `M ${POS.map((p) => `${p.x} ${p.y}`).join(" L ")}`;

/** activeIndex: -1 = none lit, 0-6 = reveal up to this index, 7 = all lit + ambient pulse. */
export const Constellation: React.FC<{ activeIndex: number }> = ({
  activeIndex,
}) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pathProgress = Math.max(
    0,
    Math.min(1, activeIndex >= 7 ? 1 : (activeIndex + 0.5) / FAMILY_ACCENTS.length),
  );

  return (
    <div style={{ opacity: entrance }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {activeIndex >= 0 ? (
          <DrawnPath
            d={PATH}
            progress={pathProgress}
            color="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            glow={false}
          />
        ) : null}
      </svg>

      {FAMILY_ACCENTS.map((family, i) => {
        const lit = activeIndex >= 7 || i <= activeIndex;
        const p = POS[i];
        const ambientPulse =
          activeIndex >= 7
            ? 1 + 0.05 * Math.sin(frame * 0.05 + i)
            : 1;

        return (
          <div
            key={family.id}
            style={{
              position: "absolute",
              left: p.x - 70,
              top: p.y - 70,
              width: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 999,
                scale: String(ambientPulse * (lit ? 1 : 0.82)),
                background: lit
                  ? `color-mix(in oklab, ${family.accent} 32%, transparent)`
                  : "transparent",
                border: `2.5px solid ${lit ? family.accent : "rgba(255,255,255,0.14)"}`,
                boxShadow: lit
                  ? `0 0 26px -2px color-mix(in oklab, ${family.accent} 70%, transparent)`
                  : undefined,
              }}
            />
            <span
              style={{
                fontFamily: sansFont,
                fontSize: 17,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.25,
                color: lit ? COLORS.fg : COLORS.muted,
              }}
            >
              {family.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
