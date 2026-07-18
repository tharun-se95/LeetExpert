import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ACCENT_GRADIENT } from "./theme";

/** A quick diagonal light-sweep across the full frame — a scene-cut flash. */
export const WipeFlash: React.FC<{ at: number; width?: number }> = ({
  at,
  width = 420,
}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < -10 || local > 10) return null;

  const x = interpolate(local, [-10, 10], [-width, 1920 + width]);
  const opacity = interpolate(
    local,
    [-10, -2, 0, 2, 10],
    [0, 1, 1, 1, 0],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          bottom: -100,
          left: x - width / 2,
          width,
          background: ACCENT_GRADIENT,
          filter: "blur(60px)",
          transform: "skewX(-18deg)",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -100,
          bottom: -100,
          left: x - 4,
          width: 8,
          background: "#fff",
          filter: "blur(2px)",
          transform: "skewX(-18deg)",
          opacity: 0.8,
        }}
      />
    </div>
  );
};
