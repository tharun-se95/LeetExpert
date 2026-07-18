import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag } from "../../lib/brutalist";
import { CenterRow, RollingNumber, Timeline, valueToX, type SceneProps } from "./bits";
import { INTERVALS } from "./scenes-problem";

const centerOf = (iv: (typeof INTERVALS)[number]) => ({
  x: (valueToX(iv.s) + valueToX(iv.e)) / 2,
  y: 560 - 90 - iv.row * 100 + 32,
});

const PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
];

// ---------------------------------------------------------------------------
// 05 — a crisscross web connects every pair: the naive O(n²) move.
// ---------------------------------------------------------------------------

export const S05NaiveWeb: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const centers = INTERVALS.map(centerOf);
  const gap = Math.max(10, Math.floor(dur / 5));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {PAIRS.map(([a, b], i) => {
          const local = frame - i * gap;
          const draw = interpolate(local, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pulse = local > 14 ? 0.5 + Math.sin((local - 14) * 0.15) * 0.2 : 0;
          const ca = centers[a];
          const cb = centers[b];
          const mx = ca.x + (cb.x - ca.x) * draw;
          const my = ca.y + (cb.y - ca.y) * draw;
          return (
            <line
              key={i}
              x1={ca.x}
              y1={ca.y}
              x2={mx}
              y2={my}
              stroke={BRUTAL.accent2}
              strokeWidth={4}
              opacity={draw >= 1 ? 0.4 + pulse : 1}
            />
          );
        })}
      </svg>
      {INTERVALS.map((iv, i) => {
        const c = centerOf(iv);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x - 10,
              top: c.y - 10,
              width: 20,
              height: 20,
              borderRadius: 999,
              background: BRUTAL.ink,
            }}
          />
        );
      })}
      <CenterRow top={760}>
        <BrutalTag text="COMPARE EVERY BLOCK TO EVERY OTHER" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 06 — 10 intervals, 45 pairs.
// ---------------------------------------------------------------------------

export const S06FortyFive: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={400}>
      <RollingNumber to={45} fontSize={200} />
    </CenterRow>
    <CenterRow top={640}>
      <BrutalTag text="10 INTERVALS = 45 PAIRS" fill="#ffffff" fontSize={28} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 07 — 10,000 intervals, 50,000,000 pairs — and most never touch.
// ---------------------------------------------------------------------------

export const S07FiftyMillion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tagPop = spring({ frame: frame - 90, fps, config: { damping: 12, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={380}>
        <RollingNumber to={50000000} fontSize={140} delay={0} />
      </CenterRow>
      <CenterRow top={640}>
        <div style={{ scale: String(interpolate(tagPop, [0, 1], [0.5, 1])), opacity: Math.min(1, tagPop * 1.6) }}>
          <BrutalTag text="MOST NEVER TOUCH" fill={BRUTAL.accent2} fontSize={30} rotate={-1.5} />
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 08 — the blocks blur under a question mark: you can't see who's next to
// whom.
// ---------------------------------------------------------------------------

export const S08CantSee: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [0, 20], [0, 6], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ filter: `blur(${blur}px)`, opacity: 0.5 }}>
        <Timeline />
        {INTERVALS.map((iv, i) => (
          <div key={i} style={{ position: "absolute", left: valueToX(iv.s), top: 560 - 90 - iv.row * 100, width: (iv.e - iv.s) * 58, height: 64, background: "#fff", border: `3px solid ${BRUTAL.ink}` }} />
        ))}
      </div>
      <CenterRow top={340}>
        <div style={{ fontSize: 140, fontWeight: 700, color: BRUTAL.ink }}>?</div>
      </CenterRow>
      <CenterRow top={640}>
        <BrutalTag text="CAN'T SEE WHO'S NEXT TO WHOM" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};
