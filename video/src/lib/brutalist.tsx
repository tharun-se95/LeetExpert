import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRUTAL } from "./theme";
import { brutalBodyFont, brutalDisplayFont } from "./fonts";

// ---------------------------------------------------------------------------
// Torn-paper edge: a deterministic jagged polygon clip-path so every card
// reads as cut/ripped paper instead of a clean rectangle. Seeded so a given
// card's edge never changes shape frame to frame.
// ---------------------------------------------------------------------------

function tornClipPath(seed: string, jag = 1.4): string {
  const steps = 14;
  const pts: string[] = [];
  // top edge, left->right
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = (random(`${seed}-t${i}`) - 0.5) * jag;
    pts.push(`${x}% ${y}%`);
  }
  // right edge, top->bottom
  for (let i = 1; i <= steps; i++) {
    const y = (i / steps) * 100;
    const x = 100 + (random(`${seed}-r${i}`) - 0.5) * jag;
    pts.push(`${x}% ${y}%`);
  }
  // bottom edge, right->left
  for (let i = 1; i <= steps; i++) {
    const x = 100 - (i / steps) * 100;
    const y = 100 + (random(`${seed}-b${i}`) - 0.5) * jag;
    pts.push(`${x}% ${y}%`);
  }
  // left edge, bottom->top
  for (let i = 1; i < steps; i++) {
    const y = 100 - (i / steps) * 100;
    const x = (random(`${seed}-l${i}`) - 0.5) * jag;
    pts.push(`${x}% ${y}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

// ---------------------------------------------------------------------------
// Background: raw paper — flat cream, faint blueprint grid, halftone dot
// field, and a subtle photocopier grain. No gradients, no blur glow.
// ---------------------------------------------------------------------------

const DOT_COUNT = 60;
const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => ({
  x: random(`bd-x-${i}`) * 100,
  y: random(`bd-y-${i}`) * 100,
  r: 2 + random(`bd-r-${i}`) * 5,
}));

export const BrutalBackground: React.FC<{ accent?: string }> = ({
  accent = BRUTAL.accent,
}) => {
  const frame = useCurrentFrame();
  const grain = 0.05 + 0.02 * Math.sin(frame * 0.7);

  return (
    <AbsoluteFill style={{ backgroundColor: BRUTAL.paper, overflow: "hidden" }}>
      {/* blueprint grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${BRUTAL.ink}14 2px, transparent 2px), linear-gradient(90deg, ${BRUTAL.ink}14 2px, transparent 2px)`,
          backgroundSize: "80px 80px",
        }}
      />
      {/* halftone dot field, accent-tinted */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={`${d.x}%`}
            cy={`${d.y}%`}
            r={d.r}
            fill={accent}
            opacity={0.35}
          />
        ))}
      </svg>
      {/* flat ink border frame — brutalist "print bleed" mark */}
      <div
        style={{
          position: "absolute",
          inset: 28,
          border: `4px solid ${BRUTAL.ink}`,
        }}
      />
      {/* grain */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: grain,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PaperCard — a torn-edge cutout with a hard (unblurred) offset shadow. This
// is the one recurring "surface" for the whole system, replacing GlassPanel.
// Depth comes from literal stacking (see PaperStack) and shadow offset, never
// blur or gradient glow.
// ---------------------------------------------------------------------------

export const PaperCard: React.FC<{
  children?: React.ReactNode;
  seed: string;
  rotate?: number;
  fill?: string;
  border?: boolean;
  shadowOffset?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  seed,
  rotate = 0,
  fill = "#ffffff",
  border = true,
  shadowOffset = 14,
  style,
}) => {
  const clip = tornClipPath(seed);
  return (
    <div
      style={{
        position: "relative",
        rotate: `${rotate}deg`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shadowOffset}px, ${shadowOffset}px)`,
          background: BRUTAL.ink,
          clipPath: clip,
        }}
      />
      <div
        style={{
          position: "relative",
          background: fill,
          clipPath: clip,
          border: border ? `3px solid ${BRUTAL.ink}` : undefined,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * A pile of plain torn-paper offcuts behind the main card — pure depth
 * cue, no content. `count` sheets, each rotated/offset a bit more than the
 * last, back to front.
 */
export const PaperStack: React.FC<{
  seed: string;
  count?: number;
  colors?: string[];
  width: number;
  height: number;
}> = ({ seed, count = 3, colors = [BRUTAL.accent, BRUTAL.ink], width, height }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const n = count - i;
      const rotate = (random(`${seed}-stack-r${i}`) - 0.5) * 10 * n;
      const dx = (random(`${seed}-stack-x${i}`) - 0.5) * 26 * n;
      const dy = (random(`${seed}-stack-y${i}`) - 0.5) * 18 * n;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            width,
            height,
            translate: `${dx}px ${dy}px`,
            rotate: `${rotate}deg`,
            background: colors[i % colors.length],
            clipPath: tornClipPath(`${seed}-stack${i}`),
            border: `3px solid ${BRUTAL.ink}`,
          }}
        />
      );
    })}
  </>
);

// ---------------------------------------------------------------------------
// StampText — big poster-weight headline that SLAMS onto the paper: fast
// scale-overshoot + a paper-cut clip-path wipe reveal instead of a fade.
// ---------------------------------------------------------------------------

export const StampText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  bg?: string;
  rotate?: number;
}> = ({
  text,
  delay = 0,
  fontSize = 96,
  color = BRUTAL.ink,
  bg,
  rotate = -2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  if (local < 0) return null;

  const s = spring({
    frame: local,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 240 },
  });
  const scale = interpolate(s, [0, 1], [1.35, 1]);
  const wipe = interpolate(local, [0, 6], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "inline-block",
        rotate: `${rotate}deg`,
        scale: String(scale),
        opacity: s > 0 ? 1 : 0,
        clipPath: `inset(0 ${100 - wipe}% 0 0)`,
      }}
    >
      <div
        style={{
          fontFamily: brutalDisplayFont,
          fontSize,
          lineHeight: 1,
          textTransform: "uppercase",
          letterSpacing: -1,
          color,
          background: bg,
          padding: bg ? "10px 28px" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// BrutalTag — small bold label chip, hard-edged, for 1-4 word callouts.
// ---------------------------------------------------------------------------

export const BrutalTag: React.FC<{
  text: string;
  fill?: string;
  color?: string;
  fontSize?: number;
  rotate?: number;
}> = ({ text, fill = BRUTAL.accent, color = BRUTAL.ink, fontSize = 24, rotate = -1.5 }) => (
  <span
    style={{
      display: "inline-flex",
      fontFamily: brutalBodyFont,
      fontWeight: 700,
      fontSize,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color,
      background: fill,
      border: `3px solid ${BRUTAL.ink}`,
      padding: "6px 16px",
      rotate: `${rotate}deg`,
    }}
  >
    {text}
  </span>
);

// ---------------------------------------------------------------------------
// TapeStrip — a rotated washi-tape rectangle, the recurring "papercraft"
// accent used to pin cards down or mark a connector.
// ---------------------------------------------------------------------------

export const TapeStrip: React.FC<{
  x: number;
  y: number;
  w?: number;
  rotate?: number;
  color?: string;
}> = ({ x, y, w = 120, rotate = -8, color = BRUTAL.accent2 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 18,
      width: w,
      height: 36,
      background: `color-mix(in oklab, ${color} 55%, white)`,
      opacity: 0.85,
      border: `2px solid ${BRUTAL.ink}`,
      rotate: `${rotate}deg`,
      boxShadow: `4px 4px 0 ${BRUTAL.ink}`,
    }}
  />
);

// ---------------------------------------------------------------------------
// Chapter mark — bold black bar, top-left, matching the print-poster system.
// ---------------------------------------------------------------------------

export const BrutalChapterMark: React.FC<{
  part: string;
  chapter: string;
  accent?: string;
}> = ({ part, chapter, accent = BRUTAL.accent }) => {
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
        gap: 12,
      }}
    >
      <div style={{ width: 20, height: 20, background: accent, border: `3px solid ${BRUTAL.ink}` }} />
      <span
        style={{
          fontFamily: brutalBodyFont,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: BRUTAL.ink,
        }}
      >
        {part} <span style={{ opacity: 0.35 }}>/</span> {chapter}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PaperFlick — mount animation for anything entering as a "placed cutout":
// slides in from an offscreen direction with a slight overshoot rotation,
// then settles flat. Wrap any element with it.
// ---------------------------------------------------------------------------

export const PaperFlick: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
  distance?: number;
}> = ({ children, delay = 0, from = "bottom", distance = 220 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  if (local < 0) return null;

  const s = spring({
    frame: local,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 210 },
  });
  const p = interpolate(s, [0, 1], [0, 1]);
  const dx = from === "left" ? -distance * (1 - p) : from === "right" ? distance * (1 - p) : 0;
  const dy = from === "top" ? -distance * (1 - p) : from === "bottom" ? distance * (1 - p) : 0;
  const rotate = (1 - p) * (from === "left" || from === "top" ? -10 : 10);

  return (
    <div
      style={{
        translate: `${dx}px ${dy}px`,
        rotate: `${rotate}deg`,
        opacity: Math.min(1, s * 2),
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// SlamCut — hard cut-punctuation for the Brutalist system: a flat color
// field slams over the whole frame for 2-3 frames then vanishes. No fade,
// no gradient — a literal print-flash cut instead of a soft light wipe.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// BrutalOutroCard — closing card for the papercut system: flat paper,
// stamped wordmark, no glow.
// ---------------------------------------------------------------------------

export const BrutalOutroCard: React.FC<{ accent?: string; subtitle: string }> = ({
  accent = BRUTAL.accent,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRUTAL.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity }}>
        <div
          style={{
            width: 84,
            height: 84,
            background: BRUTAL.ink,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: brutalDisplayFont,
            fontSize: 24,
          }}
        >
          DSA
        </div>
        <div style={{ fontFamily: brutalDisplayFont, fontSize: 48, textTransform: "uppercase", color: BRUTAL.ink }}>
          DSA Pattern Handbook
        </div>
        <div style={{ fontFamily: brutalBodyFont, fontSize: 24, fontWeight: 700, color: accent, background: BRUTAL.ink, padding: "6px 18px" }}>
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SlamCut: React.FC<{ at: number; color?: string }> = ({
  at,
  color = BRUTAL.ink,
}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 3) return null;
  const opacity = local === 0 ? 1 : local === 1 ? 0.7 : 0.25;
  return (
    <AbsoluteFill
      style={{ background: color, opacity, pointerEvents: "none" }}
    />
  );
};
