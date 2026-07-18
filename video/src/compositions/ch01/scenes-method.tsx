import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { noise2D } from "@remotion/noise";
import { ACCENT_GRADIENT, COLORS } from "../../lib/theme";
import { monoFont, sansFont } from "../../lib/fonts";
import { DrawnPath, Tag, easeOutExpo } from "../../lib/cinematic";
import { CenterRow, Crosshair, SlamStamp, type SceneProps } from "./bits";

// ---------------------------------------------------------------------------
// S4 — Crush: a messy wall of skeleton text collapses into one clean,
// glowing line. "Understand it in one plain sentence."
// ---------------------------------------------------------------------------

const BAR_WIDTHS = [720, 540, 660, 460, 610, 380];

export const S04Crush: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });
  const pillW = interpolate(frame, [20, 38], [0, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {BAR_WIDTHS.map((w, i) => {
        const baseY = 320 + i * 46;
        const y = interpolate(t, [0, 1], [baseY, 452]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 - w / 2,
              top: y,
              width: w,
              height: 26,
              borderRadius: 13,
              background: "rgba(255,255,255,0.14)",
              scale: `1 ${1 - t * 0.96}`,
              opacity: 1 - t * 0.92,
            }}
          />
        );
      })}

      {pillW > 4 ? (
        <div
          style={{
            position: "absolute",
            left: 960 - pillW / 2,
            top: 446,
            width: pillW,
            height: 38,
            borderRadius: 999,
            background: ACCENT_GRADIENT,
            boxShadow: `0 0 44px -4px ${COLORS.accent}`,
          }}
        />
      ) : null}

      <CenterRow top={560}>
        <SlamStamp text="ONE PLAIN SENTENCE" fontSize={40} delay={34} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S5 — Sluggish loader: a spinner that crawls, a percent that barely moves.
// Comically slow on purpose — brute force proves the rules, nothing more.
// ---------------------------------------------------------------------------

export const S05Loader: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const rot = frame * 2.4;
  const pct = Math.min(
    3,
    Math.floor(
      interpolate(frame, [0, dur * 0.92], [0, 3.999], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const chipDelay = Math.round(dur * 0.55);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <circle
          cx={960}
          cy={460}
          r={96}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={13}
        />
        <circle
          cx={960}
          cy={460}
          r={96}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray="140 463"
          transform={`rotate(${rot} 960 460)`}
          style={{ filter: `drop-shadow(0 0 10px ${COLORS.accent})` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 860,
          top: 425,
          width: 200,
          textAlign: "center",
          fontFamily: monoFont,
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.fg,
        }}
      >
        {pct}%
      </div>
      <CenterRow top={640}>
        <Tag text="BRUTE FORCE" color={COLORS.muted} fontSize={22} />
      </CenterRow>
      <div style={{ position: "absolute", left: 1130, top: 360 }}>
        <SlamStamp text="RULES ✓" color="#4ade80" fontSize={40} delay={chipDelay} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S6 — Double work: the same task card duplicates itself. ×2 slams in red.
// "Where are you doing the same work twice?"
// ---------------------------------------------------------------------------

const TaskCard: React.FC<{ x: number; borderColor: string; opacity?: number }> = ({
  x,
  borderColor,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 130,
      top: 360,
      width: 260,
      height: 200,
      borderRadius: 18,
      background: "rgba(255,255,255,0.045)",
      border: `2px solid ${borderColor}`,
      opacity,
      padding: "30px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    }}
  >
    {[170, 120, 150].map((w, i) => (
      <div
        key={i}
        style={{
          width: w,
          height: 14,
          borderRadius: 8,
          background: "rgba(255,255,255,0.16)",
        }}
      />
    ))}
  </div>
);

export const S06DoubleWork: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({
    frame: frame - 6,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 150 },
  });
  const dx = interpolate(slide, [0, 1], [0, 310]);
  const pulse = frame > 24 ? 0.5 + 0.5 * Math.sin(frame * 0.35) : 0;
  const borderC = `color-mix(in oklab, ${COLORS.danger} ${Math.round(pulse * 60)}%, rgba(255,255,255,0.16))`;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TaskCard x={810} borderColor={borderC} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${dx}px 0px`,
          opacity: Math.min(0.85, slide * 1.4),
        }}
      >
        <TaskCard x={810} borderColor={borderC} />
      </div>
      <div style={{ position: "absolute", left: 1250, top: 280 }}>
        <SlamStamp text="×2" color={COLORS.danger} filled fontSize={56} delay={16} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S7 — The choke point: particles pile up at an hourglass neck, heat rises.
// This is what a bottleneck IS.
// ---------------------------------------------------------------------------

const FUNNEL_ROWS = [
  { y: 340, spread: 300, n: 4 },
  { y: 385, spread: 240, n: 4 },
  { y: 430, spread: 170, n: 3 },
  { y: 472, spread: 100, n: 3 },
];

export const S07Choke: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heat = interpolate(frame, [dur * 0.25, dur * 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let dotIndex = 0;
  const dots: { x: number; y: number; seed: number }[] = [];
  for (const row of FUNNEL_ROWS) {
    for (let k = 0; k < row.n; k++) {
      dots.push({
        x: 960 - row.spread / 2 + ((k + 0.5) / row.n) * row.spread,
        y: row.y,
        seed: dotIndex++,
      });
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <DrawnPath
          d="M 770 300 L 1150 300 L 974 510 L 946 510 Z"
          progress={draw}
          color="rgba(255,255,255,0.3)"
          strokeWidth={2.5}
          glow={false}
        />
        <DrawnPath
          d="M 946 540 L 974 540 L 1150 730 L 770 730 Z"
          progress={draw}
          color="rgba(255,255,255,0.3)"
          strokeWidth={2.5}
          glow={false}
        />
      </svg>

      {dots.map((d) => {
        const jx = noise2D(`cx-${d.seed}`, frame * 0.06, 0) * 7;
        const jy = noise2D(`cy-${d.seed}`, frame * 0.06, 5) * 5;
        return (
          <div
            key={d.seed}
            style={{
              position: "absolute",
              left: d.x + jx - 6,
              top: d.y + jy - 6,
              width: 12,
              height: 12,
              borderRadius: 999,
              background: `color-mix(in oklab, ${COLORS.danger} ${Math.round(heat * 80)}%, ${COLORS.muted})`,
              opacity: draw,
            }}
          />
        );
      })}

      {[0, 1, 2].map((i) => {
        const fy = 555 + ((frame * 4.5 + i * 70) % 175);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 948 + i * 8,
              top: fy,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: COLORS.muted,
              opacity: (1 - (fy - 555) / 175) * draw,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 900,
          top: 495,
          width: 120,
          height: 70,
          borderRadius: 999,
          background: COLORS.danger,
          filter: "blur(26px)",
          opacity: heat * 0.55,
        }}
      />

      <CenterRow top={790}>
        <SlamStamp
          text="WASTED WORK"
          color={COLORS.danger}
          fontSize={54}
          delay={Math.round(dur * 0.5)}
        />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S8 — Choose your weapon: three data-structure chips, crosshair hovers,
// then snaps to the hash map. Click.
// ---------------------------------------------------------------------------

const DS_CHIPS = [
  { glyph: "{ }", label: "HASH MAP" },
  { glyph: "[ ]", label: "WINDOW" },
  { glyph: "△", label: "TREE" },
];
const CHIP_XS = [560, 960, 1360];

export const S08Select: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 170 },
  });
  const cx = interpolate(snap, [0, 1], [960, 560]);
  const cw = interpolate(snap, [0, 1], [560, 290]);
  const selected = snap > 0.85;
  const ring = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {DS_CHIPS.map((chip, i) => {
        const pop = spring({
          frame: frame - 2 - i * 4,
          fps,
          config: { damping: 12, mass: 0.5, stiffness: 180 },
        });
        const isTarget = i === 0 && selected;
        return (
          <div
            key={chip.label}
            style={{
              position: "absolute",
              left: CHIP_XS[i] - 120,
              top: 375 + (isTarget ? -10 : 0),
              width: 240,
              height: 175,
              borderRadius: 20,
              background: "rgba(255,255,255,0.045)",
              border: `2px solid ${isTarget ? COLORS.accent : "rgba(255,255,255,0.12)"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              scale: String(interpolate(pop, [0, 1], [0.6, 1])),
              opacity: pop,
              boxShadow: isTarget
                ? `0 0 40px -6px ${COLORS.accent}`
                : undefined,
            }}
          >
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 52,
                fontWeight: 700,
                color: isTarget ? COLORS.accent : COLORS.fg,
              }}
            >
              {chip.glyph}
            </span>
            <span
              style={{
                fontFamily: sansFont,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1,
                color: isTarget ? COLORS.fg : COLORS.muted,
              }}
            >
              {chip.label}
            </span>
          </div>
        );
      })}

      <Crosshair x={cx} y={460} w={cw} h={240} delay={8} />

      {ring > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 560 - 40 - ring * 120,
            top: 460 - 40 - ring * 120,
            width: 80 + ring * 240,
            height: 80 + ring * 240,
            borderRadius: 999,
            border: `3px solid ${COLORS.accent}`,
            opacity: (1 - ring) * 0.7,
          }}
        />
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// S9 — Hash map flash: instant. Braces, a lightning bolt, one frame.
// The whole point of a hash map in a single image.
// ---------------------------------------------------------------------------

export const S09MapFlash: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= 2;
  const pop = spring({
    frame: frame - 2,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 240 },
  });
  const boltDrop = spring({
    frame: frame - 3,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 200 },
  });
  const flash = interpolate(frame, [2, 3, 7], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const impact = interpolate(frame, [8, 10, 16], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 310,
          textAlign: "center",
          fontFamily: monoFont,
          fontSize: 220,
          fontWeight: 700,
          color: COLORS.accent,
          opacity: on ? 1 : 0,
          scale: String(interpolate(pop, [0, 1], [1.3, 1])),
          textShadow: `0 0 60px color-mix(in oklab, ${COLORS.accent} 80%, transparent)`,
        }}
      >
        {"{ }"}
      </div>

      <svg
        width={70}
        height={110}
        viewBox="0 0 60 100"
        style={{
          position: "absolute",
          left: 1000,
          top: 285,
          rotate: "-8deg",
          translate: `0px ${interpolate(boltDrop, [0, 1], [-170, 0])}px`,
          opacity: Math.min(1, boltDrop * 2),
          filter: "drop-shadow(0 0 14px #FFC24B)",
        }}
      >
        <polygon points="34,0 8,54 24,54 16,100 52,40 32,40 44,0" fill="#FFC24B" />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#fff",
          opacity: flash,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1005 - 30,
          top: 390 - 30,
          width: 60,
          height: 60,
          borderRadius: 999,
          background: "#FFC24B",
          filter: "blur(18px)",
          opacity: impact,
        }}
      />

      <CenterRow top={660}>
        <SlamStamp text="O(1) LOOKUP" color={COLORS.accent} fontSize={44} delay={12} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S10 — Window whip: a bracket pair whips across a row of cells in one
// motion and lands. The other tool, in one image.
// ---------------------------------------------------------------------------

const W_CELLS = 8;
const W_CW = 88;
const W_GAP = 14;
const W_START_X = (1920 - (W_CELLS * W_CW + (W_CELLS - 1) * W_GAP)) / 2;
const W_SPAN = 3 * W_CW + 2 * W_GAP + 20;
const W_TARGET_X = W_START_X + 3 * (W_CW + W_GAP) - 10;

const BracketPair: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => {
  const bar: React.CSSProperties = {
    position: "absolute",
    top: 445,
    width: 6,
    height: 140,
    borderRadius: 4,
    background: COLORS.accent,
    boxShadow: `0 0 14px ${COLORS.accent}`,
  };
  const arm: React.CSSProperties = {
    position: "absolute",
    width: 24,
    height: 6,
    borderRadius: 4,
    background: COLORS.accent,
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ ...bar, left: x }} />
      <div style={{ ...arm, left: x, top: 445 }} />
      <div style={{ ...arm, left: x, top: 579 }} />
      <div style={{ ...bar, left: x + W_SPAN }} />
      <div style={{ ...arm, left: x + W_SPAN - 18, top: 445 }} />
      <div style={{ ...arm, left: x + W_SPAN - 18, top: 579 }} />
    </div>
  );
};

export const S10WindowWhip: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const springAt = (off: number) =>
    spring({
      frame: frame - 2 - off,
      fps,
      config: { damping: 15, mass: 0.7, stiffness: 110 },
    });
  const main = springAt(0);
  const xFor = (s: number) => interpolate(s, [0, 1], [W_START_X - 340, W_TARGET_X]);
  const settled = main > 0.92;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: W_CELLS }).map((_, i) => {
        const inside = settled && i >= 3 && i <= 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W_START_X + i * (W_CW + W_GAP),
              top: 470,
              width: W_CW,
              height: W_CW,
              borderRadius: 12,
              background: inside
                ? `color-mix(in oklab, ${COLORS.accent} 16%, rgba(255,255,255,0.04))`
                : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${inside ? COLORS.accent : "rgba(255,255,255,0.1)"}`,
            }}
          />
        );
      })}

      <BracketPair x={xFor(springAt(4))} opacity={0.12} />
      <BracketPair x={xFor(springAt(2))} opacity={0.28} />
      <BracketPair x={xFor(main)} opacity={1} />
    </div>
  );
};
