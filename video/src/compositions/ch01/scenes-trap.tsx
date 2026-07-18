import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FAMILY_ACCENTS } from "../../lib/theme";
import { monoFont, sansFont } from "../../lib/fonts";
import {
  CenterRow,
  Pipeline,
  Shake,
  SlamStamp,
  TILE_W,
  TILE_Y,
  TilesRow,
  tileCenterX,
  type SceneProps,
} from "./bits";

// ---------------------------------------------------------------------------
// S17 — Alarm: red vignette flash, screen shake, warning triangle.
// "Here's the trap, though."
// ---------------------------------------------------------------------------

export const S17Alarm: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vign = interpolate(frame, [0, 3, 9, dur], [0, 0.55, 0.28, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pop = spring({
    frame: frame - 2,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 240 },
  });

  return (
    <Shake amp={9}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 45%, color-mix(in oklab, ${COLORS.danger} 55%, transparent) 100%)`,
          opacity: vign,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 90,
          top: 460 - 90,
          width: 180,
          height: 180,
          scale: String(interpolate(pop, [0, 1], [1.7, 1])),
          opacity: Math.min(1, pop * 2),
        }}
      >
        <svg width={180} height={180} viewBox="0 0 100 100">
          <polygon
            points="50,6 96,88 4,88"
            fill={`color-mix(in oklab, ${COLORS.danger} 14%, transparent)`}
            stroke={COLORS.danger}
            strokeWidth={6}
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 16px ${COLORS.danger})` }}
          />
          <text
            x={50}
            y={72}
            textAnchor="middle"
            fontFamily={sansFont}
            fontSize={44}
            fontWeight={900}
            fill={COLORS.danger}
          >
            !
          </text>
        </svg>
      </div>
    </Shake>
  );
};

// ---------------------------------------------------------------------------
// S18 — The glitching window: a bracket tries to hold, flickers, heats
// red, and breaks apart. "Sounds like a sliding window — and isn't."
// ---------------------------------------------------------------------------

const GLITCH_PATTERN = [1, 1, 0, 1, 0, 1, 1, 0];

const GlitchBracket: React.FC<{
  x: number;
  flip: boolean;
  color: string;
  dx: number;
  rot: number;
  opacity: number;
}> = ({ x, flip, color, dx, rot, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 440,
      width: 30,
      height: 190,
      translate: `${flip ? dx : -dx}px 0px`,
      rotate: `${flip ? rot : -rot}deg`,
      opacity,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: flip ? undefined : 0,
        right: flip ? 0 : undefined,
        top: 0,
        width: 6,
        height: 190,
        borderRadius: 4,
        background: color,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: flip ? 6 : 0,
        top: 0,
        width: 24,
        height: 6,
        borderRadius: 4,
        background: color,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: flip ? 6 : 0,
        bottom: 0,
        width: 24,
        height: 6,
        borderRadius: 4,
        background: color,
      }}
    />
  </div>
);

export const S18Glitch: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftX = tileCenterX(1) - TILE_W / 2 - 34;
  const rightX = tileCenterX(2) + TILE_W / 2 + 4;
  const heat = Math.round(
    interpolate(frame, [4, 26], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const color = `color-mix(in oklab, ${COLORS.danger} ${heat}%, ${COLORS.accent})`;
  const broken = frame >= 28;
  const b = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 160 },
  });
  const dx = interpolate(b, [0, 1], [0, 95]);
  const rot = interpolate(b, [0, 1], [0, 12]);
  const flickerOn = frame < 4 ? 0 : GLITCH_PATTERN[frame % 8];
  const opacity = broken ? 0.45 : flickerOn;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TilesRow />
      <GlitchBracket x={leftX} flip={false} color={color} dx={broken ? dx : 0} rot={broken ? rot : 0} opacity={opacity} />
      <GlitchBracket x={rightX} flip color={color} dx={broken ? dx : 0} rot={broken ? rot : 0} opacity={opacity} />
      {broken ? (
        <CenterRow top={400}>
          <SlamStamp text="×" color={COLORS.danger} fontSize={96} delay={30} />
        </CenterRow>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// S19 — The real shape: indexes 0 and 3 link over the top; the middle is
// junk. A window can't do this. Long beat — the arc marches the whole time.
// ---------------------------------------------------------------------------

export const S19Broken: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const arcOpacity = interpolate(frame, [4, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const linkPulse =
    frame > dur * 0.55 ? 0.5 + 0.5 * Math.sin(frame * 0.18) : 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {[0, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: tileCenterX(i) - 90,
            top: TILE_Y - 25,
            width: 180,
            height: 180,
            borderRadius: 999,
            background: "#4ade80",
            filter: "blur(46px)",
            opacity: linkPulse * 0.35,
          }}
        />
      ))}

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M ${tileCenterX(0)} 440 Q 960 250 ${tileCenterX(3)} 440`}
          fill="none"
          stroke="#4ade80"
          strokeWidth={3.5}
          strokeDasharray="14 12"
          strokeDashoffset={-frame * 1.8}
          opacity={arcOpacity}
          style={{ filter: "drop-shadow(0 0 8px #4ade80)" }}
        />
      </svg>

      <TilesRow states={["green", "dim", "dim", "green"]} />

      {[0, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: tileCenterX(i) - 40,
            top: 640,
            width: 80,
            textAlign: "center",
            fontFamily: monoFont,
            fontSize: 24,
            fontWeight: 700,
            color: "#4ade80",
            opacity: arcOpacity,
          }}
        >
          i = {i}
        </div>
      ))}

      <div style={{ position: "absolute", left: tileCenterX(1) - 24, top: TILE_Y + 22 }}>
        <SlamStamp text="×" color={COLORS.danger} fontSize={76} delay={16} />
      </div>
      <div style={{ position: "absolute", left: tileCenterX(2) - 24, top: TILE_Y + 22 }}>
        <SlamStamp text="×" color={COLORS.danger} fontSize={76} delay={22} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S20 — Distill: the keyword noise blurs away; only BOTTLENECK stays.
// "Match the bottleneck, not a lucky keyword."
// ---------------------------------------------------------------------------

const KEYWORDS: { t: string; x: number; y: number; size: number }[] = [
  { t: "substring", x: 320, y: 260, size: 40 },
  { t: "window", x: 1520, y: 240, size: 34 },
  { t: "longest", x: 560, y: 720, size: 44 },
  { t: "contiguous", x: 1380, y: 700, size: 38 },
  { t: "sorted", x: 300, y: 520, size: 30 },
  { t: "K largest", x: 1620, y: 470, size: 36 },
  { t: "in-place", x: 760, y: 220, size: 32 },
  { t: "array", x: 1150, y: 760, size: 34 },
];

export const S20Distill: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [22, 34], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {KEYWORDS.map((k, i) => {
        const die = 8 + i * 3;
        const t = interpolate(frame, [die, die + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={k.t}
            style={{
              position: "absolute",
              left: k.x,
              top: k.y,
              fontFamily: sansFont,
              fontSize: k.size,
              fontWeight: 600,
              color: COLORS.muted,
              opacity: 0.55 * (1 - t),
              filter: `blur(${t * 9}px)`,
              translate: `${(k.x - 960) * 0.18 * t}px ${(k.y - 480) * 0.18 * t}px`,
            }}
          >
            {k.t}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 430 - 60,
          width: 660,
          height: 200,
          borderRadius: 999,
          background: COLORS.accent,
          filter: "blur(80px)",
          opacity: glow * 0.5,
        }}
      />
      <CenterRow top={420}>
        <SlamStamp text="BOTTLENECK" color={COLORS.accent} fontSize={120} delay={20} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// S21 — Zoom out: the plan holds the center, then pulls back to reveal the
// seven pattern families it unlocks. One plan → every pattern.
// ---------------------------------------------------------------------------

export const S21ZoomOut: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = interpolate(frame, [16, 54], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const ty = interpolate(frame, [16, 54], [0, -130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: String(sc),
          translate: `0px ${ty}px`,
        }}
      >
        <Pipeline progress={1} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 640,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {FAMILY_ACCENTS.map((f, i) => {
          const pop = spring({
            frame: frame - 44 - i * 5,
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 170 },
          });
          return (
            <div
              key={f.id}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                border: `2px solid ${f.accent}`,
                background: `color-mix(in oklab, ${f.accent} 16%, transparent)`,
                fontFamily: sansFont,
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.fg,
                whiteSpace: "nowrap",
                scale: String(interpolate(pop, [0, 1], [0.4, 1])),
                opacity: pop,
                boxShadow: `0 0 18px -4px ${f.accent}`,
              }}
            >
              {f.label}
            </div>
          );
        })}
      </div>

      <CenterRow top={840}>
        <SlamStamp
          text="ONE PLAN · EVERY PATTERN"
          fontSize={46}
          delay={Math.min(dur - 25, 100)}
        />
      </CenterRow>
    </div>
  );
};
