import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { PaperCard, PaperFlick, StampText } from "../../lib/brutalist";
import { CenterRow, EmojiSticker, type SceneProps } from "./bits";

export const FAMILY_EMOJI = ["🥞", "🎟️", "🏆", "📶", "🌳"];
export const FAMILY_LABELS = ["STACK", "QUEUE", "HEAP", "MONO STACK", "TRIE"];

// ---------------------------------------------------------------------------
// 01 — five emoji stickers fall into a row: the five shapes we're about to
// meet.
// ---------------------------------------------------------------------------

export const S01TitleStorm: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={380}>
      <div style={{ display: "flex", gap: 36 }}>
        {FAMILY_EMOJI.map((emoji, i) => (
          <PaperFlick key={i} delay={2 + i * 5} from={i % 2 === 0 ? "top" : "bottom"}>
            <EmojiSticker
              emoji={emoji}
              seed={`intro-icon-${i}`}
              rotate={(i - 2) * 3}
              fill={i === 2 ? BRUTAL.accent : "#ffffff"}
              size={130}
            />
          </PaperFlick>
        ))}
      </div>
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 02 — "WHAT RUNS NEXT?" slams under the row, sticking the hook.
// ---------------------------------------------------------------------------

export const S02RuleHook: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={380}>
      <div style={{ display: "flex", gap: 36 }}>
        {FAMILY_EMOJI.map((emoji, i) => (
          <EmojiSticker
            key={i}
            emoji={emoji}
            seed={`hook-icon-${i}`}
            rotate={(i - 2) * 3}
            fill={i === 2 ? BRUTAL.accent : "#ffffff"}
            size={130}
          />
        ))}
      </div>
    </CenterRow>
    <CenterRow top={620}>
      <StampText text="WHAT RUNS NEXT?" delay={4} fontSize={100} rotate={-1.5} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 03 — "HARD PROBLEM" card is torn clean in half to reveal a yellow "SOLVED"
// card underneath: the literal shape of "nail the rule ... falls apart."
// ---------------------------------------------------------------------------

export const S03RuleClick: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const tear = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={430}>
        <PaperCard seed="rule-solved" fill={BRUTAL.accent} rotate={-1} style={{ width: 620, height: 220 }}>
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StampText text="SOLVED ✅" delay={8} fontSize={72} rotate={0} />
          </div>
        </PaperCard>
      </CenterRow>
      <CenterRow top={430}>
        <div style={{ position: "relative", width: 620, height: 220 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 320,
              height: 220,
              translate: `${-tear * 420}px ${tear * 40}px`,
              rotate: `${-tear * 18}deg`,
              opacity: 1 - tear,
            }}
          >
            <PaperCard seed="hard-left" style={{ width: 320, height: 220 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30, color: BRUTAL.ink }}>
                HARD
              </div>
            </PaperCard>
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 320,
              height: 220,
              translate: `${tear * 420}px ${tear * 40}px`,
              rotate: `${tear * 18}deg`,
              opacity: 1 - tear,
            }}
          >
            <PaperCard seed="hard-right" style={{ width: 320, height: 220 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30, color: BRUTAL.ink }}>
                PROBLEM
              </div>
            </PaperCard>
          </div>
        </div>
      </CenterRow>
    </div>
  );
};
