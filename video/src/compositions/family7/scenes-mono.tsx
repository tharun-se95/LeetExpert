import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag, StampText } from "../../lib/brutalist";
import { Block, CenterRow, EmojiSticker, type SceneProps } from "./bits";

const TEMPS = [73, 74, 75, 71, 69, 72, 76, 73];
const WAITS = [1, 1, 4, 2, 1, 1, 0, 0];

// ---------------------------------------------------------------------------
// 20 — a row of paper bars (temps), all facing forward, waiting.
// ---------------------------------------------------------------------------

export const S20RowForms: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(4, Math.floor(dur / (TEMPS.length + 2)));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={520}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          {TEMPS.map((t, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 12, stiffness: 210 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])), opacity: Math.min(1, pop * 1.6) }}>
                <Block label={String(t)} seed={`mono-${i}`} w={90} h={90} fontSize={24} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={700}>
        <EmojiSticker emoji="📶" seed="mono-tag" size={90} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 21 — quick beat: a taller bar steps in.
// ---------------------------------------------------------------------------

export const S21TallerStepsIn: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tallIn = spring({ frame, fps, config: { damping: 9, stiffness: 240 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={520}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          {[73, 74, 75, 71, 69, 72].map((t, i) => (
            <Block key={i} label={String(t)} seed={`mono-hold-${i}`} w={90} h={90} fontSize={24} />
          ))}
          <div
            style={{
              scale: String(interpolate(tallIn, [0, 1], [0.4, 1])),
              translate: `0px ${interpolate(tallIn, [0, 1], [-160, 0])}px`,
            }}
          >
            <Block label="76" seed="mono-tall" w={100} h={150} fontSize={26} fill={BRUTAL.accent2} />
          </div>
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 22 — every shorter bar who's been waiting pulses: they've been noticed.
// ---------------------------------------------------------------------------

export const S22ShortersWaiting: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.35) * 0.06;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={520}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          {[73, 74, 75].map((t, i) => (
            <div key={i} style={{ scale: String(pulse - i * 0.01) }}>
              <Block label={String(t)} seed={`mono-wait-${i}`} w={90} h={90} fontSize={24} fill={BRUTAL.accent} />
            </div>
          ))}
          <Block label="76" seed="mono-tall2" w={100} h={150} fontSize={26} fill={BRUTAL.accent2} />
        </div>
      </CenterRow>
      <CenterRow top={700}>
        <BrutalTag text="THEY'VE BEEN NOTICED" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 23 — the shorter bars pop away one by one, each stamped with the wait
// count it just learned.
// ---------------------------------------------------------------------------

export const S23PopResolve: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={520}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          {[73, 74, 75].map((t, i) => {
            const pop = spring({ frame: frame - i * 8, fps, config: { damping: 10, stiffness: 200 } });
            return (
              <div key={i} style={{ translate: `0px ${interpolate(pop, [0, 1], [0, -160])}px`, opacity: interpolate(pop, [0, 0.5, 1], [1, 1, 0]) }}>
                <Block label={`${t}→${WAITS[i]}`} seed={`mono-pop-${i}`} w={110} h={90} fontSize={20} fill={BRUTAL.accent} />
              </div>
            );
          })}
          <Block label="76" seed="mono-tall3" w={100} h={150} fontSize={26} fill={BRUTAL.accent2} />
        </div>
      </CenterRow>
      <CenterRow top={700}>
        <BrutalTag text="TALLER ARRIVES → WAITERS RESOLVE" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 24 — the full row, done: every bar now shows its wait count.
// ---------------------------------------------------------------------------

export const S24SweepDone: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = 6;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={520}>
        <div style={{ display: "flex", gap: 14 }}>
          {WAITS.map((w, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 12, stiffness: 210 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])) }}>
                <Block label={String(w)} seed={`mono-done-${i}`} w={90} h={90} fontSize={26} fill={i >= WAITS.length - 2 ? "#ffffff" : BRUTAL.accent} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={700}>
        <StampText text="ONE PASS. DONE. ✅" delay={54} fontSize={64} bg={BRUTAL.ink} color={BRUTAL.paper} rotate={-1} />
      </CenterRow>
    </div>
  );
};
