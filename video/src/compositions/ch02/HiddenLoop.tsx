import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont } from "../../lib/fonts";
import { GlassPanel, Tag } from "../../lib/cinematic";

export const HiddenLoop: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepX = interpolate(frame, [10, 55], [40, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const revealed = frame > 45;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 300,
        translate: "-50% 0px",
        opacity: entrance,
      }}
    >
      <GlassPanel glowAccent={revealed ? COLORS.danger : accent} padding="40px 50px">
        <div style={{ position: "relative", width: 680 }}>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 26,
              lineHeight: 1.8,
              color: COLORS.muted,
            }}
          >
            <div>for x in arr:</div>
            <div
              style={{
                color: revealed ? COLORS.danger : COLORS.muted,
                background: revealed
                  ? "color-mix(in oklab, #ff5c5c 16%, transparent)"
                  : "transparent",
                borderRadius: 6,
                paddingLeft: 8,
              }}
            >
              &nbsp;&nbsp;if x in some_list:
            </div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;handle(x)</div>
          </div>

          {/* magnifying glass sweep */}
          {!revealed ? (
            <div
              style={{
                position: "absolute",
                left: sweepX - 45,
                top: 34,
                width: 90,
                height: 90,
                borderRadius: 999,
                border: `4px solid ${accent}`,
                boxShadow: `0 0 30px -4px ${accent}, inset 0 0 20px -6px ${accent}`,
                background: "rgba(255,255,255,0.03)",
              }}
            />
          ) : null}
        </div>

        {revealed ? (
          <div
            style={{
              marginTop: 26,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Tag text="LOOKS O(n)" color={COLORS.muted} fontSize={20} />
            <span style={{ color: COLORS.muted, fontSize: 20 }}>→</span>
            <Tag text="REALLY O(n²)" color={COLORS.danger} filled fontSize={20} />
          </div>
        ) : null}
      </GlassPanel>
    </div>
  );
};
