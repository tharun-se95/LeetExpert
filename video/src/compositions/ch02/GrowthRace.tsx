import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont, sansFont } from "../../lib/fonts";
import { Tag } from "../../lib/cinematic";

const TRACK_X = 420;
const TRACK_W = 1280;
const LANE_H = 96;
const LANE_GAP = 30;
const START_Y = 300;

const LANES = [
  { key: "const", label: "O(1)", color: "#4ade80", f: () => 0.05 },
  {
    key: "log",
    label: "O(log n)",
    color: "#38bdf8",
    f: (n: number) => Math.log2(1 + n * 24) / Math.log2(25),
  },
  { key: "linear", label: "O(n)", color: COLORS.accent, f: (n: number) => n },
  {
    key: "quad",
    label: "O(n²)",
    color: COLORS.danger,
    f: (n: number) => n * n * 1.7,
  },
];

/**
 * n: shared "input size" progress, 0-1, driving every lane's bar length.
 * highlightKey: dim every lane except this one (null = show all evenly).
 */
export const GrowthRace: React.FC<{
  n: number;
  highlightKey?: string | null;
}> = ({ n, highlightKey = null }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity: entrance }}>
      {/* track baseline */}
      <div
        style={{
          position: "absolute",
          left: TRACK_X,
          top: START_Y - 20,
          width: TRACK_W,
          height: LANES.length * (LANE_H + LANE_GAP) - LANE_GAP + 40,
          borderRadius: 24,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      />

      {LANES.map((lane, i) => {
        const y = START_Y + i * (LANE_H + LANE_GAP);
        const raw = lane.f(n);
        const overflow = raw > 1;
        const barW = Math.min(TRACK_W - 40, Math.max(4, raw * (TRACK_W - 40)));
        const dimmed = highlightKey ? highlightKey !== lane.key : false;
        const burst = overflow && lane.key === "quad";
        const shake = burst ? Math.sin(frame * 3.4) * 5 : 0;

        return (
          <div
            key={lane.key}
            style={{
              position: "absolute",
              left: TRACK_X + 20,
              top: y,
              width: TRACK_W - 40,
              opacity: dimmed ? 0.22 : 1,
            }}
          >
            <div
              style={{
                fontFamily: sansFont,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 10,
              }}
            >
              {lane.label}
            </div>
            <div
              style={{
                position: "relative",
                height: LANE_H - 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: barW + shake,
                  borderRadius: 12,
                  background: burst
                    ? `linear-gradient(90deg, ${lane.color}, #fff)`
                    : lane.color,
                  boxShadow: `0 0 24px -2px ${lane.color}`,
                }}
              />
              {burst ? (
                <div
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    translate: "0px -50%",
                    fontFamily: monoFont,
                    fontWeight: 800,
                    color: COLORS.bg,
                    fontSize: 22,
                  }}
                >
                  ⚠
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const RaceCaption: React.FC<{ text: string; color?: string }> = ({
  text,
  color = COLORS.danger,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: START_Y + LANES.length * (LANE_H + LANE_GAP) + 30,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Tag text={text} color={color} fontSize={26} />
  </div>
);
