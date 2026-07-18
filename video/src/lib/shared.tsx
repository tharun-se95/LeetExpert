import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";
import { sansFont } from "./fonts";
import { activeBeatIndex, type TimedBeat } from "./beats";

/** Full-bleed dark background with a soft accent glow, matching the web app's dark theme. */
export const Scene: React.FC<{
  accent?: string;
  children: React.ReactNode;
}> = ({ accent = COLORS.accent, children }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: sansFont,
        color: COLORS.fg,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 600px at 50% 15%, color-mix(in oklab, ${accent} 16%, transparent), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          padding: "100px 160px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Top-left eyebrow, matching the app's "FAMILY N — TITLE" pattern pages. */
export const ChapterBadge: React.FC<{
  part: string;
  chapter: string;
  accent?: string;
}> = ({ part, chapter, accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {part}
      </span>
      <span
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: 1,
          color: COLORS.muted,
        }}
      >
        {chapter}
      </span>
    </div>
  );
};

/** Big animated caption text, synced to the active narration beat. */
export const BeatCaption: React.FC<{
  beats: TimedBeat[];
  fontSize?: number;
}> = ({ beats, fontSize = 46 }) => {
  const frame = useCurrentFrame();
  const active = beats[activeBeatIndex(beats, frame)];
  const localFrame = frame - active.from;

  const opacityIn = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    localFrame,
    [active.durationInFrames - 12, active.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(localFrame, [0, 14], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontSize,
        fontWeight: 600,
        lineHeight: 1.3,
        color: COLORS.fg,
        opacity: Math.min(opacityIn, opacityOut),
        translate: `0px ${translateY}px`,
      }}
    >
      {active.text}
    </div>
  );
};

/**
 * Fixed two-zone body layout: a centered visual zone with a bounded height,
 * and a caption zone anchored to a fixed distance from the bottom of the
 * frame (grows upward), so it can never overflow the safe area regardless
 * of how many lines the active caption wraps to.
 */
export const SceneBody: React.FC<{
  part: string;
  chapter: string;
  accent: string;
  visual: React.ReactNode;
  beats: TimedBeat[];
}> = ({ part, chapter, accent, visual, beats }) => {
  return (
    <Scene accent={accent}>
      <ChapterBadge part={part} chapter={chapter} accent={accent} />
      <AbsoluteFill
        style={{
          top: 250,
          left: 0,
          right: 0,
          height: 420,
          bottom: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {visual}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          bottom: 110,
        }}
      >
        <BeatCaption beats={beats} />
      </div>
    </Scene>
  );
};

/** Closing brand card. */
export const OutroCard: React.FC<{ accent?: string }> = ({
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: sansFont,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          opacity,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: COLORS.fg,
            color: COLORS.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          DSA
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.fg }}>
          DSA Pattern Handbook
        </div>
        <div style={{ fontSize: 24, color: accent, fontWeight: 500 }}>
          Think in patterns, not problems.
        </div>
      </div>
    </AbsoluteFill>
  );
};
