import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag, StampText } from "../../lib/brutalist";
import { Block, CenterRow, EmojiSticker, type SceneProps } from "./bits";

const N = 5;

// ---------------------------------------------------------------------------
// 10 — a raw ticket line forms, front to back.
// ---------------------------------------------------------------------------

export const S10LineForms: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(3, Math.floor(dur / (N + 2)));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={470}>
        <div style={{ display: "flex", gap: 18 }}>
          {Array.from({ length: N }, (_, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 12, stiffness: 200 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])), opacity: Math.min(1, pop * 1.6) }}>
                <Block label={`#${i + 1}`} seed={`q-${i}`} w={100} h={100} fontSize={26} fill={i === 0 ? BRUTAL.accent : "#ffffff"} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={640}>
        <EmojiSticker emoji="🎟️" seed="queue-tag" size={90} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 11 — front ticket highlighted: first kid in, first kid served.
// ---------------------------------------------------------------------------

export const S11FrontServed: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: 30, config: { damping: 11, stiffness: 220 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={470}>
        <div style={{ display: "flex", gap: 18 }}>
          {Array.from({ length: N }, (_, i) => (
            <Block key={i} label={`#${i + 1}`} seed={`q2-${i}`} w={100} h={100} fontSize={26} fill={i === 0 ? BRUTAL.accent : "#ffffff"} />
          ))}
        </div>
      </CenterRow>
      <CenterRow top={640}>
        <div style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])) }}>
          <BrutalTag text="FIRST IN = FIRST SERVED ✓" rotate={-2} />
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 12 — quick, snappy: someone tries to cut, gets slammed right back.
// ---------------------------------------------------------------------------

export const S12NoCutting: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 2.2) * (frame < 20 ? 6 : 0);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={470}>
        <div style={{ translate: `${shake}px 0px` }}>
          <StampText text="🚫 NO CUTTING" delay={0} fontSize={84} bg={BRUTAL.ink} color={BRUTAL.paper} rotate={2} />
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 13 — two real-world use cases: a moving average, a rate limiter.
// ---------------------------------------------------------------------------

export const S13UseCases: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop1 = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 200 } });
  const pop2 = spring({ frame: frame - 16, fps, config: { damping: 12, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ scale: String(interpolate(pop1, [0, 1], [0.5, 1])), opacity: Math.min(1, pop1 * 1.6) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <EmojiSticker emoji="📊" seed="use-avg" size={150} />
              <BrutalTag text="MOVING AVERAGE" fill="#ffffff" fontSize={20} />
            </div>
          </div>
          <div style={{ scale: String(interpolate(pop2, [0, 1], [0.5, 1])), opacity: Math.min(1, pop2 * 1.6) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <EmojiSticker emoji="⏱️" seed="use-rate" size={150} />
              <BrutalTag text="RATE LIMITER" fill="#ffffff" fontSize={20} />
            </div>
          </div>
        </div>
      </CenterRow>
      <CenterRow top={760}>
        <BrutalTag text="STAY FAIR. NO CUTTING." rotate={-1} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 14 — front ticket exits stage-left while a new one joins the back.
// ---------------------------------------------------------------------------

export const S14FifoExit: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const exit = spring({ frame, fps: 30, config: { damping: 13, stiffness: 160 } });
  const join = spring({ frame: frame - 6, fps: 30, config: { damping: 12, stiffness: 190 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={470}>
        <div style={{ display: "flex", gap: 18, position: "relative" }}>
          <div style={{ position: "absolute", left: -140, translate: `${interpolate(exit, [0, 1], [0, -260])}px 0px`, opacity: interpolate(exit, [0, 1], [1, 0]) }}>
            <Block label="#1" seed="q3-out" w={100} h={100} fontSize={26} fill={BRUTAL.accent} />
          </div>
          {Array.from({ length: N - 1 }, (_, i) => (
            <Block key={i} label={`#${i + 2}`} seed={`q3-${i}`} w={100} h={100} fontSize={26} fill={i === 0 ? BRUTAL.accent : "#ffffff"} />
          ))}
          <div style={{ scale: String(interpolate(join, [0, 1], [0.3, 1])), opacity: Math.min(1, join * 1.6) }}>
            <Block label="#6" seed="q3-new" w={100} h={100} fontSize={26} />
          </div>
        </div>
      </CenterRow>
      <CenterRow top={640}>
        <BrutalTag text="FRONT OUT → BACK IN" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};
