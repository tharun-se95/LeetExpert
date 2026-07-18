import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { StampText } from "../../lib/brutalist";
import { Block, CenterRow, Timeline, type SceneProps } from "./bits";

const CHAOS = [
  { v: "7", x: 480, y: 260, r: -14 },
  { v: "?", x: 900, y: 200, r: 10 },
  { v: "2", x: 1300, y: 300, r: 18 },
  { v: "9", x: 1550, y: 220, r: -8 },
  { v: "5", x: 680, y: 420, r: 6 },
  { v: "1", x: 1150, y: 460, r: -20 },
];

// ---------------------------------------------------------------------------
// 01 — a scatter of unordered tiles slams into "THEY JUST NEED ORDER."
// ---------------------------------------------------------------------------

export const S01Hook: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {CHAOS.map((c, i) => {
        const pop = spring({ frame: frame - i * 3, fps, config: { damping: 11, stiffness: 200 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              rotate: `${c.r}deg`,
              scale: String(interpolate(pop, [0, 1], [0.3, 1])),
              opacity: Math.min(1, pop * 1.6),
            }}
          >
            <Block label={c.v} seed={`chaos-${i}`} w={90} h={90} fontSize={30} />
          </div>
        );
      })}
      <CenterRow top={640}>
        <StampText text="THEY JUST NEED ORDER." delay={16} fontSize={72} rotate={-1} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 02 — title card, empty timeline fades in beneath it.
// ---------------------------------------------------------------------------

export const S02Title: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const lineIn = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={280}>
        <StampText text="MERGE INTERVALS" delay={0} fontSize={92} bg={BRUTAL.accent} rotate={-1.5} />
      </CenterRow>
      <Timeline opacity={lineIn} />
    </div>
  );
};
