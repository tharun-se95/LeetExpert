import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag } from "../../lib/brutalist";
import { CenterRow, IntervalBar, Timeline, valueToX, type SceneProps } from "./bits";

// The worked example throughout this video: three messy, unsorted blocks.
export const INTERVALS = [
  { s: 1, e: 3, row: 1 },
  { s: 2, e: 6, row: 0 },
  { s: 8, e: 10, row: 2 },
];

// ---------------------------------------------------------------------------
// 03 — the three blocks pop onto the timeline at scattered heights: messy.
// ---------------------------------------------------------------------------

export const S03BlocksAppear: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(10, Math.floor(dur / 5));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      {INTERVALS.map((iv, i) => {
        const pop = spring({ frame: frame - i * gap, fps, config: { damping: 11, stiffness: 190 } });
        return (
          <div
            key={i}
            style={{
              opacity: Math.min(1, pop * 1.6),
              translate: `0px ${interpolate(pop, [0, 1], [-60, 0])}px`,
            }}
          >
            <IntervalBar s={iv.s} e={iv.e} row={iv.row} seed={`iv-${i}`} />
          </div>
        );
      })}
      <CenterRow top={760}>
        <BrutalTag text="MESSY. UNSORTED." fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 04 — the overlap between block 1 and block 2 glows: glue this.
// ---------------------------------------------------------------------------

export const S04OverlapGlow: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame % 30, [0, 15, 30], [0.35, 0.85, 0.35]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      {INTERVALS.map((iv, i) => (
        <IntervalBar key={i} s={iv.s} e={iv.e} row={iv.row} seed={`iv2-${i}`} />
      ))}
      <div
        style={{
          position: "absolute",
          left: valueToX(2),
          top: 300,
          width: valueToX(3) - valueToX(2),
          height: 340,
          background: BRUTAL.accent2,
          opacity: glow,
        }}
      />
      <CenterRow top={760}>
        <BrutalTag text="OVERLAP — GLUE THIS" fill={BRUTAL.accent2} fontSize={26} />
      </CenterRow>
    </div>
  );
};
