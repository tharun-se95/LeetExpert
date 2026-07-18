import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont } from "../../lib/fonts";
import { Tag } from "../../lib/cinematic";

const ITEMS = ["a", "b", "c", "a", "b", "c", "b", "b"];
const CELL = 78;
const GAP = 14;
const START_X = 1920 / 2 - (ITEMS.length * (CELL + GAP) - GAP) / 2;

export const WindowSlide: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const left = Math.floor(frame / 18) % (ITEMS.length - 2);
  const right = left + 2;
  const windowX = START_X + left * (CELL + GAP) - 10;
  const windowW = (right - left + 1) * (CELL + GAP) - GAP + 20;

  return (
    <div style={{ opacity: entrance }}>
      {/* sliding window highlight */}
      <div
        style={{
          position: "absolute",
          left: windowX,
          top: 480 - 12,
          width: windowW,
          height: CELL + 24,
          borderRadius: 16,
          border: `2.5px solid ${accent}`,
          background: `color-mix(in oklab, ${accent} 12%, transparent)`,
          boxShadow: `0 0 30px -6px ${accent}`,
        }}
      />

      <div style={{ position: "absolute", left: START_X, top: 480, display: "flex", gap: GAP }}>
        {ITEMS.map((ch, i) => {
          const inWindow = i >= left && i <= right;
          return (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: monoFont,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.fg,
                background: inWindow
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: "1.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {ch}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 640,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tag text="ONE WINDOW, ONE SLIDE" color={accent} fontSize={22} />
      </div>
    </div>
  );
};
