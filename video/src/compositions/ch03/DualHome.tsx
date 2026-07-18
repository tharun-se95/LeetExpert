import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { sansFont } from "../../lib/fonts";
import { GlassPanel, Tag } from "../../lib/cinematic";

export const DualHome: React.FC = () => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const merge = interpolate(frame, [16, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gap = interpolate(merge, [0, 1], [140, 40]);

  return (
    <div style={{ opacity: entrance }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 320,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tag text="TOP K FREQUENT" color={COLORS.accent} fontSize={24} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 460,
          display: "flex",
          justifyContent: "center",
          gap,
        }}
      >
        <GlassPanel glowAccent="#0A7A6A" padding="30px 40px">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: sansFont, fontSize: 26, fontWeight: 700, color: COLORS.fg }}>
              Hash Map
            </span>
            <span style={{ fontFamily: sansFont, fontSize: 18, color: COLORS.muted }}>
              counts
            </span>
          </div>
        </GlassPanel>
        <GlassPanel glowAccent="#E11D48" padding="30px 40px">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: sansFont, fontSize: 26, fontWeight: 700, color: COLORS.fg }}>
              Heap
            </span>
            <span style={{ fontFamily: sansFont, fontSize: 18, color: COLORS.muted }}>
              selects
            </span>
          </div>
        </GlassPanel>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 640,
          display: "flex",
          justifyContent: "center",
          opacity: merge,
        }}
      >
        <span style={{ fontFamily: sansFont, fontSize: 20, color: COLORS.muted }}>
          one home, one helper
        </span>
      </div>
    </div>
  );
};
