import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag, SlamCut, StampText } from "../../lib/brutalist";
import { CenterRow, IntervalBar, Timeline, valueToX, type SceneProps } from "./bits";
import { INTERVALS } from "./scenes-problem";

// ---------------------------------------------------------------------------
// 09 — quick tease: blocks start sliding toward one shared row.
// ---------------------------------------------------------------------------

export const S09Align: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      {INTERVALS.map((iv, i) => (
        <div key={i} style={{ translate: `0px ${interpolate(p, [0, 1], [0, iv.row * 100])}px` }}>
          <IntervalBar s={iv.s} e={iv.e} row={0} seed={`align-${i}`} />
        </div>
      ))}
      <CenterRow top={760}>
        <BrutalTag text="ORDER THEM" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// Blocks 0 and 1 ([1,3] and [2,6]) genuinely overlap in value-space, so a
// tiny row nudge on the first keeps both labels legible without hiding the
// real overlap that's the whole point of these three scenes.
const OVERLAP_ROW = [0.45, 0, 0];

// ---------------------------------------------------------------------------
// 10 — hard snap: all three blocks land on one sorted row.
// ---------------------------------------------------------------------------

export const S10SortSnap: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Timeline />
    {INTERVALS.map((iv, i) => (
      <IntervalBar key={i} s={iv.s} e={iv.e} row={OVERLAP_ROW[i]} fill={BRUTAL.accent} seed={`snap-${i}`} />
    ))}
    <SlamCut at={0} />
    <CenterRow top={760}>
      <StampText text="SORTED BY START" delay={4} fontSize={54} rotate={-1} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 11 — adjacent-only: a bracket connects each touching neighbor pair.
// ---------------------------------------------------------------------------

export const S11NeighborsOnly: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame % 30, [0, 15, 30], [0.4, 1, 0.4]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      {INTERVALS.map((iv, i) => (
        <IntervalBar key={i} s={iv.s} e={iv.e} row={OVERLAP_ROW[i]} seed={`neigh-${i}`} />
      ))}
      <div
        style={{
          position: "absolute",
          left: valueToX(1),
          top: 560 - 90 - 34,
          width: valueToX(6) - valueToX(1),
          height: 6,
          background: BRUTAL.accent,
          opacity: glow,
        }}
      />
      <CenterRow top={760}>
        <BrutalTag text="NEIGHBORS ONLY CAN OVERLAP" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 12 — a cursor walks the sorted row, left to right, once.
// ---------------------------------------------------------------------------

export const S12WalkCursor: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [valueToX(0), valueToX(11)], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      {INTERVALS.map((iv, i) => (
        <IntervalBar key={i} s={iv.s} e={iv.e} row={OVERLAP_ROW[i]} seed={`walk-${i}`} />
      ))}
      <div
        style={{
          position: "absolute",
          left: x - 3,
          top: 560 - 200,
          width: 6,
          height: 260,
          background: BRUTAL.accent2,
        }}
      />
      <CenterRow top={760}>
        <BrutalTag text="ONE PASS, LEFT TO RIGHT" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 13 — block 1 stretches to absorb block 0: the merge.
// ---------------------------------------------------------------------------

export const S13Merge: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = spring({ frame: frame - 10, fps, config: { damping: 13, mass: 0.7, stiffness: 130 } });
  const mergedEnd = interpolate(merge, [0, 1], [6, 6]); // stays 6, block absorbs block0 visually
  const startX = interpolate(merge, [0, 1], [2, 1]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Timeline />
      <div
        style={{
          position: "absolute",
          left: valueToX(startX),
          top: 560 - 90,
          width: (mergedEnd - startX) * 58,
          height: 64,
        }}
      >
        <div style={{ width: "100%", height: "100%", background: BRUTAL.accent, border: `3px solid ${BRUTAL.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>
          1–6
        </div>
      </div>
      <IntervalBar s={INTERVALS[2].s} e={INTERVALS[2].e} row={0} seed="merge-untouched" />
      <CenterRow top={760}>
        <BrutalTag text="STARTS BEFORE CURRENT ENDS → STRETCH" fill={BRUTAL.accent} fontSize={22} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 14 — a gap before block 2: not touching, so it starts fresh.
// ---------------------------------------------------------------------------

export const S14NewBlock: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Timeline />
    <IntervalBar s={1} e={6} row={0} fill={BRUTAL.accent} seed="gap-merged" label="1–6" />
    <IntervalBar s={8} e={10} row={0} seed="gap-new" />
    <CenterRow top={760}>
      <BrutalTag text="GAP → START A NEW ONE" fill="#ffffff" fontSize={26} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 15 — the final result: one pass, done, with the complexity payoff.
// ---------------------------------------------------------------------------

export const S15Done: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Timeline />
    <IntervalBar s={1} e={6} row={0} fill={BRUTAL.accent} seed="done-merged" label="1–6" />
    <IntervalBar s={8} e={10} row={0} fill={BRUTAL.accent} seed="done-second" />
    <CenterRow top={700}>
      <StampText text="ONE PASS. DONE. ✅" delay={10} fontSize={62} bg={BRUTAL.ink} color={BRUTAL.paper} rotate={-1} />
    </CenterRow>
    <CenterRow top={800}>
      <BrutalTag text="O(N LOG N) SORT + O(N) SCAN" fill="#ffffff" fontSize={24} />
    </CenterRow>
  </div>
);
