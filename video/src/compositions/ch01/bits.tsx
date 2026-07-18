import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont, sansFont } from "../../lib/fonts";
import { easeOutBack } from "../../lib/cinematic";

/** Every scene gets its window length so staged internals can scale to it. */
export type SceneProps = { dur: number };

// ---------------------------------------------------------------------------
// Two Sum tile geometry, shared by every scene that shows the array.
// ---------------------------------------------------------------------------

export const NUMS = [2, 7, 11, 15];
export const TILE_W = 130;
export const TILE_GAP = 40;
export const TILES_START_X = (1920 - (TILE_W * 4 + TILE_GAP * 3)) / 2;
export const TILE_Y = 470;
export const tileCenterX = (i: number) =>
  TILES_START_X + i * (TILE_W + TILE_GAP) + TILE_W / 2;

export type TileState = "idle" | "dim" | "green" | "red" | "accent";

const TILE_COLORS: Record<TileState, string> = {
  idle: "rgba(255,255,255,0.16)",
  dim: "rgba(255,255,255,0.16)",
  green: "#4ade80",
  red: COLORS.danger,
  accent: COLORS.accent,
};

export const TilesRow: React.FC<{
  states?: TileState[];
  appearFrom?: number;
}> = ({ states, appearFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {NUMS.map((v, i) => {
        const state: TileState = states?.[i] ?? "idle";
        const color = TILE_COLORS[state];
        const glow = state === "green" || state === "red" || state === "accent";
        const pop =
          appearFrom === undefined
            ? 1
            : spring({
                frame: frame - appearFrom - i * 4,
                fps,
                config: { damping: 11, mass: 0.5, stiffness: 190 },
              });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: TILES_START_X + i * (TILE_W + TILE_GAP),
              top: TILE_Y,
              width: TILE_W,
              height: TILE_W,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: monoFont,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.fg,
              background: glow
                ? `color-mix(in oklab, ${color} 16%, rgba(255,255,255,0.04))`
                : "rgba(255,255,255,0.045)",
              border: `2.5px solid ${color}`,
              opacity: (state === "dim" ? 0.3 : 1) * Math.min(1, pop * 1.5),
              scale: String(interpolate(pop, [0, 1], [0.4, 1])),
              boxShadow: glow
                ? `0 0 26px -4px color-mix(in oklab, ${color} 70%, transparent)`
                : undefined,
            }}
          >
            {v}
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// SlamStamp — text that SLAMS in: overshoot scale, instant opacity, glow flash.
// ---------------------------------------------------------------------------

export const SlamStamp: React.FC<{
  text: string;
  color?: string;
  fontSize?: number;
  delay?: number;
  filled?: boolean;
}> = ({ text, color = COLORS.fg, fontSize = 84, delay = 0, filled = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  if (local < 0) return null;

  const s = spring({
    frame: local,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 260 },
  });
  const flash = interpolate(local, [0, 2, 8], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          fontFamily: sansFont,
          fontWeight: 900,
          fontSize,
          letterSpacing: -1,
          whiteSpace: "nowrap",
          color: filled ? COLORS.bg : color,
          background: filled ? color : "transparent",
          padding: filled ? "8px 30px" : undefined,
          borderRadius: filled ? 16 : undefined,
          scale: String(interpolate(s, [0, 1], [1.6, 1])),
          opacity: Math.min(1, s * 2.5),
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          inset: -24,
          borderRadius: 24,
          background: color,
          opacity: flash,
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/** Horizontally centers children at a given top. */
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

// ---------------------------------------------------------------------------
// Shake — decaying screen shake starting at `from`.
// ---------------------------------------------------------------------------

export const Shake: React.FC<{
  amp: number;
  from?: number;
  children: React.ReactNode;
}> = ({ amp, from = 0, children }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - from);
  const active = frame >= from ? 1 : 0;
  const decay = Math.exp(-local * 0.09) * active;
  const dx = Math.sin(local * 2.9) * amp * decay;
  const dy = Math.cos(local * 2.3) * amp * 0.6 * decay;
  return (
    <div style={{ position: "absolute", inset: 0, translate: `${dx}px ${dy}px` }}>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Crosshair — four corner brackets snapping onto a rect.
// ---------------------------------------------------------------------------

export const Crosshair: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number;
  color?: string;
}> = ({ x, y, w, h, delay = 0, color = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  if (local < 0) return null;
  const s = spring({
    frame: local,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 220 },
  });
  const scale = interpolate(s, [0, 1], [1.7, 1]);
  const arm = 26;
  const bw = `4px solid ${color}`;
  const base: React.CSSProperties = {
    position: "absolute",
    width: arm,
    height: arm,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        scale: String(scale),
        opacity: Math.min(1, s * 2),
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      <div style={{ ...base, left: 0, top: 0, borderLeft: bw, borderTop: bw }} />
      <div style={{ ...base, right: 0, top: 0, borderRight: bw, borderTop: bw }} />
      <div style={{ ...base, left: 0, bottom: 0, borderLeft: bw, borderBottom: bw }} />
      <div style={{ ...base, right: 0, bottom: 0, borderRight: bw, borderBottom: bw }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Pipeline — the six-step plan as a single progress-driven whip.
// ---------------------------------------------------------------------------

export const STEP_LABELS = [
  "UNDERSTAND",
  "BRUTE FORCE",
  "OBSERVE",
  "CHOOSE DS",
  "OPTIMIZE",
  "COMPLEXITY",
];
const PIPE_SPACING = 230;
const PIPE_START_X = (1920 - PIPE_SPACING * 5) / 2;

export const Pipeline: React.FC<{ progress: number; y?: number }> = ({
  progress,
  y = 470,
}) => {
  const lineW = progress * PIPE_SPACING * 5;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: PIPE_START_X,
          top: y - 2,
          width: PIPE_SPACING * 5,
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PIPE_START_X,
          top: y - 2,
          width: lineW,
          height: 4,
          background: COLORS.accent,
          borderRadius: 4,
          boxShadow: `0 0 16px ${COLORS.accent}`,
        }}
      />
      {progress > 0.01 && progress < 0.99 ? (
        <div
          style={{
            position: "absolute",
            left: PIPE_START_X + lineW - 10,
            top: y - 10,
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#fff",
            filter: "blur(3px)",
            boxShadow: `0 0 30px 8px ${COLORS.accent}`,
          }}
        />
      ) : null}

      {STEP_LABELS.map((label, i) => {
        const p = Math.min(1, Math.max(0, progress * 6 - i));
        const lit = p > 0.15;
        const scale = 0.72 + 0.28 * easeOutBack(p);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: PIPE_START_X + i * PIPE_SPACING - 70,
              top: y - 44,
              width: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: monoFont,
                fontSize: 30,
                fontWeight: 700,
                color: lit ? COLORS.fg : COLORS.muted,
                background: lit
                  ? `color-mix(in oklab, ${COLORS.accent} 24%, ${COLORS.surface})`
                  : COLORS.surface,
                border: `3px solid ${lit ? COLORS.accent : "rgba(255,255,255,0.12)"}`,
                scale: String(scale),
                boxShadow: lit
                  ? `0 0 24px -2px color-mix(in oklab, ${COLORS.accent} 75%, transparent)`
                  : undefined,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                fontFamily: sansFont,
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: lit ? COLORS.fg : COLORS.muted,
                opacity: 0.4 + 0.6 * p,
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Problem-title pools for the opening storm.
// ---------------------------------------------------------------------------

export const TITLES_A = [
  "Two Sum",
  "Course Schedule",
  "LRU Cache",
  "Word Ladder",
  "Coin Change",
  "Merge Intervals",
  "Top K Frequent",
  "Valid Parentheses",
];

export const TITLES_B = [
  "Number of Islands",
  "Trapping Rain Water",
  "Sliding Window Maximum",
  "Median of Two Arrays",
  "Rotting Oranges",
  "Jump Game",
  "Edit Distance",
  "Daily Temperatures",
];
