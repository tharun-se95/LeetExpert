import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { noise2D } from "@remotion/noise";
import { COLORS, ACCENT_GRADIENT } from "./theme";
import { sansFont } from "./fonts";

// ---------------------------------------------------------------------------
// Background: subtle grid + drifting glow + ambient noise-driven particles.
// Particle base positions are fixed (index-seeded) so they never jitter frame
// to frame — only their drift offset and twinkle are frame-driven, via
// deterministic simplex noise rather than time-based randomness.
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 34;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: random(`px-${i}`) * 100,
  y: random(`py-${i}`) * 100,
  size: 1.4 + random(`ps-${i}`) * 2.2,
  seed: i,
}));

export const CinematicBackground: React.FC<{ accent?: string }> = ({
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const glowX = 50 + noise2D("glow-x", frame * 0.0025, 0) * 22;
  const glowY = 20 + noise2D("glow-y", frame * 0.0025, 10) * 14;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {/* drifting accent glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1100px 720px at ${glowX}% ${glowY}%, color-mix(in oklab, ${accent} 20%, transparent), transparent 70%)`,
        }}
      />
      {/* subtle grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(color-mix(in oklab, ${COLORS.fg} 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, ${COLORS.fg} 5%, transparent) 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 90%)",
        }}
      />
      {/* particles */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {PARTICLES.map((p, i) => {
          const dx = noise2D(`pdx-${p.seed}`, frame * 0.006, 0) * 18;
          const dy = noise2D(`pdy-${p.seed}`, frame * 0.006, 5) * 18;
          const twinkle =
            0.15 + 0.35 * (0.5 + 0.5 * noise2D(`pt-${p.seed}`, frame * 0.02, 0));
          return (
            <circle
              key={i}
              cx={(p.x / 100) * width + dx}
              cy={(p.y / 100) * height + dy}
              r={p.size}
              fill={COLORS.fg}
              opacity={twinkle}
            />
          );
        })}
      </svg>
      {/* vignette */}
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 260px 60px ${COLORS.bg}`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 140% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Glass panel — the one recurring UI surface for the whole video system.
// ---------------------------------------------------------------------------

export const GlassPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glowAccent?: string;
  padding?: number | string;
}> = ({ children, style, glowAccent, padding = "28px 36px" }) => {
  return (
    <div
      style={{
        position: "relative",
        padding,
        borderRadius: 20,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(18px)",
        boxShadow: glowAccent
          ? `0 20px 60px rgba(0,0,0,0.45), 0 0 60px -10px color-mix(in oklab, ${glowAccent} 55%, transparent)`
          : "0 20px 60px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Kinetic word stamp — the ONLY text component most scenes should need.
// Confident spring entrance (scale + blur), short hold, soft exit. Meant for
// 1-4 word labels, never sentences.
// ---------------------------------------------------------------------------

export const WordStamp: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  gradient?: boolean;
  center?: boolean;
}> = ({
  text,
  from,
  durationInFrames,
  fontSize = 88,
  color = COLORS.fg,
  weight = 800,
  gradient = false,
  center = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < -6 || local > durationInFrames + 20) return null;

  const enter = spring({
    frame: local,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 140 },
  });
  const scale = interpolate(enter, [0, 1], [0.82, 1]);
  const blur = interpolate(enter, [0, 1], [10, 0], {
    extrapolateRight: "clamp",
  });
  const exitStart = durationInFrames - 12;
  const exitOpacity = interpolate(local, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: sansFont,
        fontSize,
        fontWeight: weight,
        letterSpacing: -1,
        textAlign: center ? "center" : "left",
        color: gradient ? "transparent" : color,
        backgroundImage: gradient ? ACCENT_GRADIENT : undefined,
        backgroundClip: gradient ? "text" : undefined,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        opacity: Math.min(enter, exitOpacity),
        scale: String(scale),
        filter: `blur(${blur}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// A small UI-style tag, e.g. "O(n²)" or "TOO SLOW" — for terse callouts
// that need a frame around them rather than a headline treatment.
// ---------------------------------------------------------------------------

export const Tag: React.FC<{
  text: string;
  color?: string;
  filled?: boolean;
  fontSize?: number;
}> = ({ text, color = COLORS.accent, filled = false, fontSize = 22 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      fontFamily: sansFont,
      fontSize,
      fontWeight: 700,
      letterSpacing: 1,
      color: filled ? COLORS.bg : color,
      background: filled ? color : `color-mix(in oklab, ${color} 14%, transparent)`,
      border: `1.5px solid ${color}`,
      borderRadius: 999,
      padding: "6px 18px",
    }}
  >
    {text}
  </span>
);

// ---------------------------------------------------------------------------
// Animated SVG connector — draws a path over `progress` (0-1) using evolvePath.
// ---------------------------------------------------------------------------

export const DrawnPath: React.FC<{
  d: string;
  progress: number;
  color?: string;
  strokeWidth?: number;
  glow?: boolean;
}> = ({ d, progress, color = COLORS.accent, strokeWidth = 3, glow = true }) => {
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
    />
  );
};

// ---------------------------------------------------------------------------
// Chapter mark — small persistent top-left identity, minimal by design so it
// never competes with the scene.
// ---------------------------------------------------------------------------

export const ChapterMark: React.FC<{
  part: string;
  chapter: string;
  accent?: string;
}> = ({ part, chapter, accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 72,
        opacity,
        fontFamily: sansFont,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 12px 2px ${accent}`,
        }}
      />
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        {part} <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>{" "}
        {chapter}
      </span>
    </div>
  );
};

export const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
