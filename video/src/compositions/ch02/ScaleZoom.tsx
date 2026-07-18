import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont } from "../../lib/fonts";
import { Tag } from "../../lib/cinematic";

const GRID = 22; // 22x22 dot grid
const CELL = 30;
const GRID_W = GRID * CELL;

/** n: 0-1 progress across the interview scale ladder (100 .. 10,000,000). */
export const ScaleZoom: React.FC<{ n: number; accent: string }> = ({
  n,
  accent,
}) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nValue = Math.round(Math.pow(10, 2 + n * 5));
  const fillFraction = n;
  const filledCells = Math.round(GRID * GRID * fillFraction);
  const danger = n > 0.8;

  return (
    <div style={{ opacity: entrance }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 300,
          translate: "-50% 0px",
          width: GRID_W,
          height: GRID_W,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gap: 4,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const filled = i < filledCells;
          const col = danger ? COLORS.danger : accent;
          return (
            <div
              key={i}
              style={{
                borderRadius: 3,
                background: filled
                  ? col
                  : "rgba(255,255,255,0.05)",
                boxShadow: filled ? `0 0 6px -1px ${col}` : undefined,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 300 + GRID_W + 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.fg,
          }}
        >
          n = {nValue.toLocaleString()}
        </div>
        <Tag
          text={danger ? "STRICT LINEAR ONLY" : "FINE"}
          color={danger ? COLORS.danger : "#4ade80"}
          filled
          fontSize={22}
        />
      </div>
    </div>
  );
};
