import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { NEON } from "./theme";
import { neonCodeFont, neonSansFont } from "./fonts";

/**
 * 2D overlay primitives for the Neon Depth palette — text, chips, code
 * panels, chapter marks. The system's 3D layer (@remotion/three) was
 * explored and then dropped in favor of staying 2D-only; see
 * docs/superpowers/specs/2026-07-19-neon-depth-visual-system-design.md
 * for what was tried and why. These components are plain 2D and don't
 * depend on anything WebGL-related.
 */

// ---------------------------------------------------------------------------
// Background — dark navy with a faint grid, no gradients competing with
// the 3D layer's own lighting.
// ---------------------------------------------------------------------------

export const NeonBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NEON.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)`,
        backgroundSize: "34px 34px",
      }}
    />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Label — a positioned overlay for a 3D node/cube's value. Position must be
// hand-calibrated against the actual camera projection for a static camera
// (see design spec) — pass top/left as percentages.
// ---------------------------------------------------------------------------

export const NeonLabel: React.FC<{
  text: string;
  top: string;
  left: string;
  active?: boolean;
  accentColor?: string;
  fontSize?: number;
  delay?: number;
}> = ({ text, top, left, active, accentColor = NEON.cyan, fontSize = 28, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        translate: "-50% -50%",
        opacity,
        fontFamily: neonSansFont,
        fontWeight: 700,
        fontSize,
        color: active ? NEON.textBright : NEON.textMuted,
        textShadow: active ? `0 0 16px ${accentColor}cc` : "0 2px 6px #000a",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tag — small chip for callouts, matches the reference's tag styling.
// ---------------------------------------------------------------------------

export const NeonTag: React.FC<{
  text: string;
  color?: string;
  fontSize?: number;
  filled?: boolean;
}> = ({ text, color = NEON.cyan, fontSize = 13, filled = false }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: neonCodeFont,
      fontWeight: 600,
      fontSize,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: filled ? "#04121a" : color,
      background: filled ? color : `${color}1a`,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "4px 10px",
    }}
  >
    {text}
  </span>
);

// ---------------------------------------------------------------------------
// CodePanel — monospace code snippet, for code-synced beats.
// ---------------------------------------------------------------------------

export const NeonCodePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: neonCodeFont,
      fontSize: 15,
      color: "#9fb3cc",
      background: "#0d1420",
      border: `1px solid #1c2836`,
      borderRadius: 8,
      padding: "10px 16px",
      lineHeight: 1.6,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// ComplexityBar — one row of the O(1)..O(n²) strip.
// ---------------------------------------------------------------------------

export const NeonComplexityBar: React.FC<{
  label: string;
  color: string;
  fillPct: number;
}> = ({ label, color, fillPct }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 130 }}>
    <NeonTag text={label} color={color} fontSize={12} />
    <div style={{ height: 3, borderRadius: 2, background: "#182130", overflow: "hidden" }}>
      <div style={{ width: `${fillPct}%`, height: "100%", background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// ChapterMark — top-left part/chapter indicator.
// ---------------------------------------------------------------------------

export const NeonChapterMark: React.FC<{
  part: string;
  chapter: string;
  accentColor?: string;
}> = ({ part, chapter, accentColor = NEON.cyan }) => {
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
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />
      <span
        style={{
          fontFamily: neonCodeFont,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: NEON.textMuted,
        }}
      >
        {part} <span style={{ opacity: 0.4 }}>/</span> {chapter}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// OutroCard
// ---------------------------------------------------------------------------

export const NeonOutroCard: React.FC<{ subtitle: string; accentColor?: string }> = ({
  subtitle,
  accentColor = NEON.cyan,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: NEON.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity }}>
        <div
          style={{
            fontFamily: neonSansFont,
            fontWeight: 800,
            fontSize: 44,
            color: "#fff",
            letterSpacing: -0.5,
          }}
        >
          DSA <span style={{ color: accentColor }}>· MOTION</span>
        </div>
        <NeonTag text={subtitle} color={accentColor} fontSize={14} />
      </div>
    </AbsoluteFill>
  );
};
