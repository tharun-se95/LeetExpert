import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont } from "../../lib/fonts";
import { PaperCard } from "../../lib/brutalist";

export {
  type SceneProps,
  CenterCol,
  CenterRow,
  Block,
  Plate,
  EmojiSticker,
  usePop,
  SceneLabel,
} from "../family7/bits";

// ---------------------------------------------------------------------------
// A literal number-line timeline: baseline + tick marks. Every interval in
// this topic is drawn as a bar positioned along it, not a generic tile —
// "time blocks on a line" is the whole visual idea.
// ---------------------------------------------------------------------------

export const TIMELINE_X0 = 420;
export const UNIT = 58; // px per value-unit
export const TIMELINE_Y = 560;
export const TIMELINE_MAX = 12;

export const valueToX = (v: number) => TIMELINE_X0 + v * UNIT;

export const Timeline: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    <div
      style={{
        position: "absolute",
        left: TIMELINE_X0,
        top: TIMELINE_Y,
        width: TIMELINE_MAX * UNIT,
        height: 4,
        background: BRUTAL.ink,
      }}
    />
    {Array.from({ length: TIMELINE_MAX + 1 }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: valueToX(i) - 1,
          top: TIMELINE_Y - 10,
          width: 3,
          height: i % 2 === 0 ? 24 : 14,
          background: BRUTAL.ink,
        }}
      />
    ))}
  </div>
);

/** One interval bar, positioned by its [s, e] value range on the Timeline. */
export const IntervalBar: React.FC<{
  s: number;
  e: number;
  row?: number;
  fill?: string;
  seed: string;
  label?: string;
}> = ({ s, e, row = 0, fill = "#ffffff", seed, label }) => (
  <div
    style={{
      position: "absolute",
      left: valueToX(s),
      top: TIMELINE_Y - 90 - row * 100,
      width: (e - s) * UNIT,
      height: 64,
    }}
  >
    <PaperCard seed={seed} fill={fill} style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: brutalBodyFont,
          fontWeight: 700,
          fontSize: 24,
          color: BRUTAL.ink,
        }}
      >
        {label ?? `${s}–${e}`}
      </div>
    </PaperCard>
  </div>
);

/** A big rolling digit counter — used for the 45 / 50,000,000 pair-count beats. */
export const RollingNumber: React.FC<{ to: number; delay?: number; fontSize?: number }> = ({
  to,
  delay = 0,
  fontSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.8, stiffness: 90 } });
  const shown = Math.round(interpolate(p, [0, 1], [0, to]));
  return (
    <div
      style={{
        fontFamily: brutalBodyFont,
        fontWeight: 700,
        fontSize,
        color: BRUTAL.ink,
      }}
    >
      {shown.toLocaleString()}
    </div>
  );
};
