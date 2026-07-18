import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont } from "../../lib/fonts";
import { BrutalTag, StampText } from "../../lib/brutalist";
import { Block, CenterCol, CenterRow, EmojiSticker, Plate, type SceneProps } from "./bits";

// Wide taper between plates so the stack reads clearly at a glance — a
// narrow width delta disappears once rims overlap.
const PLATE_COLORS = ["#ffffff", BRUTAL.accent, "#ffffff", BRUTAL.accent2];
const PLATE_W = [460, 350, 240, 150];
const PLATE_GAP = -8; // slight rim overlap, not a heavy stacked-card smash

// ---------------------------------------------------------------------------
// 04 — the base of the plate stack settles in.
// ---------------------------------------------------------------------------

export const S04PlatesForm: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterCol top={420}>
        {PLATE_W.slice(0, 2).map((w, i) => {
          const pop = spring({ frame: frame - i * 8, fps, config: { damping: 10, mass: 0.6, stiffness: 180 } });
          return (
            <div key={i} style={{ marginTop: i === 0 ? 0 : PLATE_GAP, translate: `0px ${interpolate(pop, [0, 1], [-200, 0])}px`, opacity: Math.min(1, pop * 1.6) }}>
              <Plate w={w} fill={PLATE_COLORS[i]} />
            </div>
          );
        })}
      </CenterCol>
      <CenterRow top={700}>
        <EmojiSticker emoji="🥞" seed="stack-tag" size={90} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 05 — the newest plate drops on top and settles: last down, first up.
// ---------------------------------------------------------------------------

export const S05PlateDrop: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 4, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterCol top={340}>
        {PLATE_W.slice(0, 2).map((w, i) => (
          <div key={i} style={{ marginTop: i === 0 ? 0 : PLATE_GAP }}>
            <Plate w={w} fill={PLATE_COLORS[i]} />
          </div>
        ))}
        <div style={{ marginTop: PLATE_GAP, translate: `0px ${interpolate(drop, [0, 1], [-260, 0])}px`, rotate: `${interpolate(drop, [0, 1], [-10, 0])}deg` }}>
          <Plate w={PLATE_W[2]} fill={PLATE_COLORS[2]} />
        </div>
      </CenterCol>
      <CenterRow top={780}>
        <BrutalTag text="LIFO — LAST DOWN, FIRST UP" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 06 — the four bracket tiles feed in one by one, spread across the scene.
// ---------------------------------------------------------------------------

const SYMS = ["(", "[", ")", "]"];

export const S06SymbolsFeed: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(14, Math.floor(dur / 5));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ display: "flex", gap: 24 }}>
          {SYMS.map((s, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 11, mass: 0.5, stiffness: 200 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.3, 1])), opacity: Math.min(1, pop * 1.6), translate: `0px ${interpolate(pop, [0, 1], [-40, 0])}px` }}>
                <Block label={s} seed={`feed-${i}`} w={110} h={110} fontSize={44} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <BrutalTag text="( [ ) ] — FEED THEM IN, IN ORDER" fill="#ffffff" fontSize={22} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 07 — count badge: 2 openers, 2 closers, a clean match.
// ---------------------------------------------------------------------------

export const S07CountCheck: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 220 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ display: "flex", gap: 24 }}>
          {SYMS.map((s, i) => (
            <Block key={i} label={s} seed={`count-${i}`} w={110} h={110} fontSize={44} />
          ))}
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <div style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])), opacity: Math.min(1, pop * 1.6) }}>
          <BrutalTag text="COUNT 2/2 ✓" fill="#ffffff" fontSize={30} rotate={-1} />
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 08 — a hard red X slams over the whole sequence: order is broken.
// ---------------------------------------------------------------------------

export const S08OrderBroken: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const xScale = spring({ frame: frame - 4, fps: 30, config: { damping: 10, mass: 0.5, stiffness: 260 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ display: "flex", gap: 24, position: "relative" }}>
          {SYMS.map((s, i) => (
            <Block key={i} label={s} seed={`broken-${i}`} w={110} h={110} fontSize={44} />
          ))}
          <div
            style={{
              position: "absolute",
              inset: -20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: brutalBodyFont,
              fontWeight: 700,
              fontSize: 220,
              color: BRUTAL.accent2,
              opacity: Math.min(1, xScale),
              scale: String(interpolate(xScale, [0, 1], [1.6, 1])),
            }}
          >
            ❌
          </div>
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <BrutalTag text="ORDER ✕ — COUNTING CAN'T SEE THIS" fill={BRUTAL.accent2} fontSize={22} rotate={1.5} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 09 — the plate stack resolves: top plate pops on each matching closer
// until nothing's left. Empty stack, green stamp: valid.
// ---------------------------------------------------------------------------

export const S09StackResolves: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pop1 = spring({ frame: frame - 6, fps: 30, config: { damping: 12, stiffness: 220 } });
  const pop2 = spring({ frame: frame - 26, fps: 30, config: { damping: 12, stiffness: 220 } });
  const pop3 = spring({ frame: frame - 46, fps: 30, config: { damping: 12, stiffness: 220 } });
  const pops = [pop1, pop2, pop3];
  const plates = [PLATE_W[0], PLATE_W[1], PLATE_W[2]];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterCol top={440}>
        {plates.map((w, i) => {
          const p = pops[2 - i];
          return (
            <div
              key={i}
              style={{
                marginTop: i === 0 ? 0 : PLATE_GAP,
                translate: `0px ${interpolate(p, [0, 1], [0, -260])}px`,
                opacity: interpolate(p, [0, 0.6, 1], [1, 1, 0]),
                rotate: `${interpolate(p, [0, 1], [0, i % 2 ? 20 : -20])}deg`,
              }}
            >
              <Plate w={w} fill={PLATE_COLORS[i]} />
            </div>
          );
        })}
      </CenterCol>
      <CenterRow top={640}>
        <StampText text="EMPTY = VALID ✅" delay={62} fontSize={60} bg={BRUTAL.accent} rotate={-1} />
      </CenterRow>
    </div>
  );
};
