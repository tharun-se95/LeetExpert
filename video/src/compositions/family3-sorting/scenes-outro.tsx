import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont } from "../../lib/fonts";
import { PaperCard, StampText } from "../../lib/brutalist";
import { CenterRow, EmojiSticker, type SceneProps } from "./bits";

// ---------------------------------------------------------------------------
// 28 — a memorized-algorithm icon gets crossed out: that's not the skill.
// ---------------------------------------------------------------------------

export const S28NotMemorizing: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const xIn = spring({ frame: frame - 10, fps: 30, config: { damping: 10, stiffness: 230 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={400}>
        <div style={{ position: "relative" }}>
          <EmojiSticker emoji="📜" seed="algo-scroll" size={170} fill="#ffffff" />
          <div
            style={{
              position: "absolute",
              inset: -20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: brutalBodyFont,
              fontWeight: 700,
              fontSize: 200,
              color: BRUTAL.accent2,
              opacity: Math.min(1, xIn),
              scale: String(interpolate(xIn, [0, 1], [1.5, 1])),
            }}
          >
            ❌
          </div>
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <div style={{ fontFamily: brutalBodyFont, fontWeight: 700, fontSize: 26, color: BRUTAL.ink, background: "#ffffff", border: `3px solid ${BRUTAL.ink}`, padding: "6px 16px" }}>
          NOT MEMORIZING ALGORITHMS
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 29 — final: the chaotic pairwise web collapses into one clean ordered
// walk.
// ---------------------------------------------------------------------------

const CHAOS_PTS = [
  { x: 700, y: 400 },
  { x: 1100, y: 340 },
  { x: 900, y: 560 },
  { x: 1300, y: 480 },
];

export const S29OrderWins: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const collapse = interpolate(frame, [0, Math.min(60, dur - 40)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = 500;
  const rowXs = [700, 900, 1100, 1300];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {CHAOS_PTS.map((p, i) =>
          CHAOS_PTS.slice(i + 1).map((q, j) => {
            const x1 = p.x + (rowXs[i] - p.x) * collapse;
            const y1 = p.y + (rowY - p.y) * collapse;
            const idx2 = i + 1 + j;
            const x2 = q.x + (rowXs[idx2] - q.x) * collapse;
            const y2 = q.y + (rowY - q.y) * collapse;
            return (
              <line
                key={`${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={BRUTAL.accent2}
                strokeWidth={3}
                opacity={interpolate(collapse, [0, 0.7, 1], [0.7, 0.3, 0])}
              />
            );
          }),
        )}
      </svg>
      {CHAOS_PTS.map((p, i) => {
        const x = p.x + (rowXs[i] - p.x) * collapse;
        const y = p.y + (rowY - p.y) * collapse;
        return (
          <div key={i} style={{ position: "absolute", left: x - 40, top: y - 40 }}>
            <PaperCard seed={`ow-${i}`} fill={collapse > 0.9 ? BRUTAL.accent : "#ffffff"} style={{ width: 80, height: 80 }} />
          </div>
        );
      })}
      <CenterRow top={720}>
        <StampText text="ORDER WINS." delay={65} fontSize={80} bg={BRUTAL.accent} rotate={-1.5} />
      </CenterRow>
    </div>
  );
};
