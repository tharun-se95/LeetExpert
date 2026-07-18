import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { PaperCard, StampText } from "../../lib/brutalist";
import { CenterRow, EmojiSticker, type SceneProps } from "./bits";
import { FAMILY_EMOJI, FAMILY_LABELS } from "./scenes-intro";

// ---------------------------------------------------------------------------
// 30 — the five icons recap in a row, each with its full name.
// ---------------------------------------------------------------------------

export const S30RecapRow: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={440}>
        <div style={{ display: "flex", gap: 28 }}>
          {FAMILY_EMOJI.map((emoji, i) => {
            const pop = spring({ frame: frame - i * 4, fps, config: { damping: 12, stiffness: 210 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])), opacity: Math.min(1, pop * 1.6) }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <EmojiSticker emoji={emoji} seed={`recap-${i}`} fill={i === 2 ? BRUTAL.accent : "#ffffff"} size={130} />
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>{FAMILY_LABELS[i]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={720}>
        <StampText text="FIVE RULES. FIVE SHAPES." delay={20} fontSize={56} rotate={-1} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 31 — a puzzle piece clicks into place: match the shape of the problem to
// the shape of the structure.
// ---------------------------------------------------------------------------

export const S31MatchShape: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const click = spring({ frame: frame - 10, fps, config: { damping: 9, stiffness: 220 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ translate: `${interpolate(click, [0, 1], [-60, 0])}px 0px` }}>
            <PaperCard seed="puzzle-l" style={{ width: 150, height: 150 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>🧩</div>
            </PaperCard>
          </div>
          <div style={{ translate: `${interpolate(click, [0, 1], [60, 0])}px 0px` }}>
            <PaperCard seed="puzzle-r" fill={BRUTAL.accent} style={{ width: 150, height: 150 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>🧩</div>
            </PaperCard>
          </div>
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <StampText text="MATCH THE SHAPE" delay={10} fontSize={60} rotate={1} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 32 — quick final punch: the answer's already there.
// ---------------------------------------------------------------------------

export const S32FinalStamp: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={480}>
      <StampText text="THE ANSWER'S ALREADY THERE. ✨" delay={0} fontSize={64} bg={BRUTAL.accent} rotate={-1} />
    </CenterRow>
  </div>
);
