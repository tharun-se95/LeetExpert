import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../lib/theme";
import { sansFont } from "../../lib/fonts";
import {
  Crosshair,
  Pipeline,
  TITLES_A,
  TITLES_B,
  type SceneProps,
} from "./bits";

const ITEM_H = 100;

// ---------------------------------------------------------------------------
// S1 — Title storm: two blurred columns of problem names whipping past.
// The feeling: an endless, overwhelming stream.
// ---------------------------------------------------------------------------

const StormColumn: React.FC<{
  titles: string[];
  left: number;
  offsetY: number;
  blur: number;
}> = ({ titles, left, offsetY, blur }) => {
  const repeated = [...titles, ...titles, ...titles];
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 0,
        bottom: 0,
        width: 520,
        filter: `blur(${blur}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{ translate: `0px ${offsetY}px` }}>
        {repeated.map((t, i) => (
          <div
            key={i}
            style={{
              height: ITEM_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sansFont,
              fontSize: 44,
              fontWeight: 700,
              color: "rgba(245,239,230,0.82)",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

export const S01TitleStorm: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wrapA = TITLES_A.length * ITEM_H;
  const wrapB = TITLES_B.length * ITEM_H;
  const yA = -((frame * 38) % wrapA);
  const yB = ((frame * 31) % wrapB) - wrapB;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: fade,
        maskImage:
          "linear-gradient(180deg, transparent 3%, black 20%, black 80%, transparent 97%)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent 3%, black 20%, black 80%, transparent 97%)",
      }}
    >
      <StormColumn titles={TITLES_A} left={360} offsetY={yA} blur={6} />
      <StormColumn titles={TITLES_B} left={1040} offsetY={yB} blur={7} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// S2 — Hard freeze: the storm stops dead, everything dims, a crosshair
// snaps onto one problem. The feeling: "wait — look closer."
// ---------------------------------------------------------------------------

const FROZEN_A = [
  "Course Schedule",
  "LRU Cache",
  "Coin Change",
  "Two Sum",
  "Merge Intervals",
  "Top K Frequent",
  "Valid Parentheses",
  "Word Ladder",
];
const TARGET_INDEX = 3;
const FREEZE_TOP = 120;
const FREEZE_ROW_H = 104;

export const S02FreezeLock: React.FC<SceneProps> = () => {
  const targetY = FREEZE_TOP + TARGET_INDEX * FREEZE_ROW_H + FREEZE_ROW_H / 2;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {FROZEN_A.map((t, i) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: 360,
            top: FREEZE_TOP + i * FREEZE_ROW_H,
            width: 500,
            height: FREEZE_ROW_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sansFont,
            fontSize: 44,
            fontWeight: 700,
            whiteSpace: "nowrap",
            color: i === TARGET_INDEX ? COLORS.fg : COLORS.muted,
            opacity: i === TARGET_INDEX ? 1 : 0.28,
            textShadow:
              i === TARGET_INDEX
                ? `0 0 30px color-mix(in oklab, ${COLORS.accent} 80%, transparent)`
                : undefined,
          }}
        >
          {t}
        </div>
      ))}
      {TITLES_B.map((t, i) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: 1040,
            top: FREEZE_TOP + i * FREEZE_ROW_H,
            width: 520,
            height: FREEZE_ROW_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sansFont,
            fontSize: 44,
            fontWeight: 700,
            whiteSpace: "nowrap",
            color: COLORS.muted,
            opacity: 0.22,
          }}
        >
          {t}
        </div>
      ))}
      <Crosshair x={610} y={targetY} w={380} h={90} delay={3} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// S3 — Pipeline whip: the six-step plan lights up left to right in one
// fast energy sweep. The feeling: there IS a system.
// ---------------------------------------------------------------------------

export const S03PipelineWhip: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [3, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return <Pipeline progress={progress} />;
};
