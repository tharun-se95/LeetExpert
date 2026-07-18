import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../../lib/theme";
import { monoFont } from "../../lib/fonts";
import { GlassPanel, Tag } from "../../lib/cinematic";
import {
  CenterRow,
  NUMS,
  Shake,
  SlamStamp,
  TILE_GAP,
  TILE_W,
  TILE_Y,
  TILES_START_X,
  TilesRow,
  tileCenterX,
  type SceneProps,
  type TileState,
} from "./bits";

// ---------------------------------------------------------------------------
// S11 — TWO SUM slams in, the array deals itself out, the target drops.
// ---------------------------------------------------------------------------

export const S11TwoSumIntro: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({
    frame: frame - 46,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 160 },
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={240}>
        <SlamStamp text="TWO SUM" color={COLORS.accent} filled fontSize={100} delay={2} />
      </CenterRow>
      <TilesRow appearFrom={18} />
      {frame >= 46 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 668,
            display: "flex",
            justifyContent: "center",
            translate: `0px ${interpolate(drop, [0, 1], [-340, 0])}px`,
            opacity: Math.min(1, drop * 2),
          }}
        >
          <Tag text="TARGET = 9" color={COLORS.accent} filled fontSize={24} />
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// S12 — Pair storm: red connections strobing between every pair of tiles.
// The visual shape of O(n²): frantic, everywhere, no plan.
// ---------------------------------------------------------------------------

const PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

export const S12PairStorm: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const active = Math.floor(frame / 5) % PAIRS.length;
  const prev = frame >= 5 ? (Math.floor(frame / 5) - 1) % PAIRS.length : -1;
  const [a, b] = PAIRS[active];
  const lineY = TILE_Y + TILE_W / 2;
  const states = NUMS.map<TileState>((_, i) =>
    i === a || i === b ? "red" : "idle",
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {prev >= 0 ? (
          <line
            x1={tileCenterX(PAIRS[prev][0])}
            y1={lineY}
            x2={tileCenterX(PAIRS[prev][1])}
            y2={lineY}
            stroke={COLORS.danger}
            strokeWidth={2.5}
            opacity={0.3}
          />
        ) : null}
        <line
          x1={tileCenterX(a)}
          y1={lineY}
          x2={tileCenterX(b)}
          y2={lineY}
          stroke={COLORS.danger}
          strokeWidth={3.5}
          style={{ filter: `drop-shadow(0 0 8px ${COLORS.danger})` }}
        />
        <circle
          cx={(tileCenterX(a) + tileCenterX(b)) / 2}
          cy={lineY}
          r={7}
          fill="#fff"
          opacity={0.5 + 0.5 * Math.sin(frame * 1.3)}
        />
      </svg>
      <TilesRow states={states} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// S13 — The bill: a counter rips up to five billion checks, turns red,
// TOO SLOW slams with a screen shake.
// ---------------------------------------------------------------------------

const TOTAL_PAIRS_100K = 4_999_950_000;

export const S13Counter: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const rampEnd = Math.min(44, dur * 0.4);
  const p = interpolate(frame, [0, rampEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const value = Math.floor(p * TOTAL_PAIRS_100K);
  const heatPct = Math.round(
    interpolate(frame, [10, rampEnd], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const stampDelay = Math.min(48, Math.round(dur * 0.45));

  return (
    <Shake amp={7} from={stampDelay}>
      <CenterRow top={380}>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 96,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            color: `color-mix(in oklab, ${COLORS.danger} ${heatPct}%, ${COLORS.fg})`,
          }}
        >
          {value.toLocaleString("en-US")}
        </div>
      </CenterRow>
      <CenterRow top={560}>
        <SlamStamp
          text="TOO SLOW"
          color={COLORS.danger}
          filled
          fontSize={72}
          delay={stampDelay}
        />
      </CenterRow>
    </Shake>
  );
};

// ---------------------------------------------------------------------------
// S14 — The nagging question: "?" bubbles keep popping over every tile.
// The same question, asked again and again — that's the bottleneck.
// ---------------------------------------------------------------------------

const BUBBLE_CYCLE = 46;

export const S14Questions: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const states = NUMS.map<TileState>((_, i) => {
    const local = frame - i * 7;
    if (local < 0) return "idle";
    return local % BUBBLE_CYCLE < 14 ? "accent" : "idle";
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TilesRow states={states} />
      {NUMS.map((_, i) => {
        const local = frame - i * 7;
        if (local < 0) return null;
        const phase = local % BUBBLE_CYCLE;
        const pop = spring({
          frame: phase,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 210 },
        });
        const floatY = -phase * 0.9;
        const fade = phase > 28 ? Math.max(0, 1 - (phase - 28) / 10) : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: tileCenterX(i) - 27,
              top: TILE_Y - 96 + floatY,
              width: 54,
              height: 54,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: monoFont,
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.accent,
              scale: String(interpolate(pop, [0, 1], [0.3, 1])),
              opacity: fade * Math.min(1, pop * 2),
            }}
          >
            ?
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// S15 — Map snap: the answer appears in ONE frame. No tween. Instant.
// The contrast with everything before it IS the message.
// ---------------------------------------------------------------------------

export const S15MapSnap: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const on = frame >= 3;
  const ring = interpolate(frame, [3, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TilesRow states={on ? undefined : ["dim", "dim", "dim", "dim"]} />
      {on ? (
        <>
          <CenterRow top={655}>
            <GlassPanel glowAccent={COLORS.accent} padding="20px 36px">
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.fg,
                }}
              >
                {"{ 2:0 · 7:1 · 11:2 }"}
              </div>
            </GlassPanel>
          </CenterRow>
          <div
            style={{
              position: "absolute",
              left: 960 - 40 - ring * 260,
              top: 700 - 30 - ring * 200,
              width: 80 + ring * 520,
              height: 60 + ring * 400,
              borderRadius: 999,
              border: `2.5px solid ${COLORS.accent}`,
              opacity: (1 - ring) * 0.6,
            }}
          />
          <CenterRow top={290}>
            <SlamStamp text="INSTANT" color={COLORS.accent} filled fontSize={54} delay={7} />
          </CenterRow>
        </>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// S16 — One pass: a light bar sweeps the row once; everything it touches
// turns green. Done.
// ---------------------------------------------------------------------------

const TILES_SPAN = TILE_W * 4 + TILE_GAP * 3;

export const S16OnePass: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const barX = interpolate(
    frame,
    [2, 18],
    [TILES_START_X - 70, TILES_START_X + TILES_SPAN + 70],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const states = NUMS.map<TileState>((_, i) =>
    barX > tileCenterX(i) ? "green" : "idle",
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TilesRow states={states} />
      <div
        style={{
          position: "absolute",
          left: barX - 26,
          top: 440,
          width: 10,
          height: 190,
          borderRadius: 6,
          background: COLORS.accent,
          opacity: 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: barX - 5,
          top: 435,
          width: 10,
          height: 200,
          borderRadius: 6,
          background: "#fff",
          boxShadow: `0 0 30px 6px ${COLORS.accent}`,
        }}
      />
      <div style={{ position: "absolute", left: 1470, top: 400 }}>
        <SlamStamp text="✓" color="#4ade80" fontSize={110} delay={20} />
      </div>
      <CenterRow top={690}>
        <SlamStamp text="ONE PASS" color="#4ade80" fontSize={40} delay={24} />
      </CenterRow>
    </div>
  );
};
