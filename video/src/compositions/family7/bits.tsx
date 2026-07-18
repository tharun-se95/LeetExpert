import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont, brutalDisplayFont } from "../../lib/fonts";
import { PaperCard } from "../../lib/brutalist";

/** Every scene gets its window length so staged internals can scale to it. */
export type SceneProps = { dur: number };

export const CenterCol: React.FC<{ top: number; children: React.ReactNode }> = ({
  top,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export const CenterRow: React.FC<{ top: number; children: React.ReactNode }> = ({
  top,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      display: "flex",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

/** One raw paper block used to represent an array/queue/stack element. */
export const Block: React.FC<{
  label: string;
  w?: number;
  h?: number;
  fill?: string;
  seed: string;
  rotate?: number;
  fontSize?: number;
}> = ({ label, w = 110, h = 110, fill = "#ffffff", seed, rotate = 0, fontSize = 34 }) => (
  <PaperCard seed={seed} rotate={rotate} fill={fill} style={{ width: w, height: h }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: brutalBodyFont,
        fontWeight: 700,
        fontSize,
        color: BRUTAL.ink,
      }}
    >
      {label}
    </div>
  </PaperCard>
);

/** Pop-in helper: scale/rotate spring, index-staggered. Returns 0-1 progress. */
export function usePop(frame: number, appearFrom: number, index = 0, stagger = 5) {
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - appearFrom - index * stagger,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 200 },
  });
}

/** A big emoji glyph inside a torn-paper sticker — the recurring "icon" unit. */
export const EmojiSticker: React.FC<{
  emoji: string;
  size?: number;
  fill?: string;
  seed: string;
  rotate?: number;
}> = ({ emoji, size = 140, fill = "#ffffff", seed, rotate = 0 }) => (
  <PaperCard seed={seed} rotate={rotate} fill={fill} style={{ width: size, height: size }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {emoji}
    </div>
  </PaperCard>
);

/**
 * A single plate: a flat pill/rim shape (not a torn-paper card) so a stack
 * of these reads as physical stacked plates instead of overlapping paper
 * scraps. Widths should taper clearly between plates in a stack — a small
 * width delta reads as noise once rims overlap.
 */
export const Plate: React.FC<{
  w: number;
  h?: number;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ w, h = 44, fill = "#ffffff", style }) => (
  <div style={{ position: "relative", width: w, height: h, ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        translate: "8px 8px",
        background: BRUTAL.ink,
        borderRadius: 999,
      }}
    />
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: fill,
        border: `3px solid ${BRUTAL.ink}`,
        borderRadius: 999,
      }}
    />
  </div>
);

/** Big bold uppercase caption line — used sparingly, one per scene at most. */
export const SceneLabel: React.FC<{
  text: string;
  top: number;
  fontSize?: number;
  delay?: number;
}> = ({ text, top, fontSize = 40, delay = 0 }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(local, [0, 10], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: brutalDisplayFont,
        textTransform: "uppercase",
        fontSize,
        color: BRUTAL.ink,
        opacity,
        translate: `0px ${ty}px`,
      }}
    >
      {text}
    </div>
  );
};
