import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../lib/theme";
import { sansFont } from "../../lib/fonts";

function Box({
  size,
  delay,
  offset,
  color,
}: {
  size: number;
  delay: number;
  offset: number;
  color: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 170 },
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: offset,
        width: size,
        height: size,
        borderRadius: 10,
        background: `color-mix(in oklab, ${color} 22%, rgba(255,255,255,0.04))`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 20px -4px ${color}`,
        scale: String(interpolate(pop, [0, 1], [0.3, 1])),
        opacity: pop,
        transformOrigin: "bottom center",
      }}
    />
  );
}

export const SpaceCargo: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity: entrance }}>
      {/* O(1) — one small case */}
      <div style={{ position: "absolute", left: 480, top: 300, width: 320 }}>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.muted,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          O(1) extra
        </div>
        <div style={{ position: "relative", height: 220 }}>
          <Box size={90} delay={0} offset={115} color="#4ade80" />
        </div>
      </div>

      {/* O(n) — a growing stack, toppling */}
      <div style={{ position: "absolute", left: 1080, top: 300, width: 420 }}>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.muted,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          O(n) extra
        </div>
        <div style={{ position: "relative", height: 220 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              size={64}
              delay={i * 5}
              offset={20 + i * 62 - i * 4}
              color={i > 3 ? COLORS.danger : accent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
