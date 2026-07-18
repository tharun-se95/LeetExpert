import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { sansFont } from "../../lib/fonts";

const PAIRS = [
  { keyword: "CONTIGUOUS + RULE", pattern: "SLIDING WINDOW", accent: "#C45C26" },
  { keyword: "SORTED, ENDS IN", pattern: "TWO POINTERS", accent: "#C45C26" },
  { keyword: "NODES + EDGES", pattern: "GRAPH TRAVERSAL", accent: "#1F9D8A" },
  { keyword: "OVERLAPPING ANSWERS", pattern: "DYNAMIC PROGRAMMING", accent: "#C9A227" },
];

/** local: 0-1 progress through ONE pair's morph (keyword -> flip -> pattern). */
export const KeywordMorph: React.FC<{ pairIndex: number; local: number }> = ({
  pairIndex,
  local,
}) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pair = PAIRS[Math.min(pairIndex, PAIRS.length - 1)];

  // flip progress: 0 = keyword fully shown, 0.5 = edge-on (thin), 1 = pattern fully shown
  const flip = interpolate(local, [0.15, 0.5, 0.55, 0.85], [0, 1, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleY = Math.abs(Math.cos(flip * Math.PI));
  const showPattern = flip > 0.5;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 440,
        display: "flex",
        justifyContent: "center",
        opacity: entrance,
      }}
    >
      <div
        style={{
          scale: `1 ${scaleY}`,
          fontFamily: sansFont,
          fontWeight: 800,
          fontSize: showPattern ? 76 : 52,
          letterSpacing: -1,
          color: showPattern ? pair.accent : COLORS.muted,
          textAlign: "center",
        }}
      >
        {showPattern ? pair.pattern : pair.keyword}
      </div>
    </div>
  );
};

export const pairCount = PAIRS.length;
