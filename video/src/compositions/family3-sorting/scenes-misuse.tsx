import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont } from "../../lib/fonts";
import { BrutalTag, PaperCard, StampText } from "../../lib/brutalist";
import { CenterRow, EmojiSticker, type SceneProps } from "./bits";

// ---------------------------------------------------------------------------
// 21 — warning intro: two ways this trick gets misused.
// ---------------------------------------------------------------------------

export const S21Warning: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={440}>
      <StampText text="⚠️ 2 WAYS THIS GOES WRONG" delay={4} fontSize={64} bg={BRUTAL.accent} rotate={-1} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 22 — first misuse: a hash map already answers it in one linear walk.
// ---------------------------------------------------------------------------

export const S22HashMapSetup: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])) }}>
            <EmojiSticker emoji="🗝️" seed="hashmap" size={140} fill="#ffffff" />
          </div>
          <div style={{ fontFamily: brutalBodyFont, fontWeight: 700, fontSize: 40, color: BRUTAL.ink }}>=</div>
          <div style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])) }}>
            <EmojiSticker emoji="✅" seed="onepass" size={140} fill={BRUTAL.accent} />
          </div>
        </div>
      </CenterRow>
      <CenterRow top={640}>
        <BrutalTag text="ONE LINEAR WALK — NO SORT NEEDED" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 23 — sorting anyway just paid a tax for nothing.
// ---------------------------------------------------------------------------

export const S23WastedTax: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const xIn = spring({ frame: frame - 4, fps: 30, config: { damping: 10, stiffness: 240 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={440}>
        <div style={{ position: "relative" }}>
          <PaperCard seed="tax-card" style={{ width: 420, height: 150 }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 44 }}>O(N LOG N)</div>
          </PaperCard>
          <div
            style={{
              position: "absolute",
              inset: -14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: brutalBodyFont,
              fontWeight: 700,
              fontSize: 200,
              color: BRUTAL.accent2,
              opacity: Math.min(1, xIn),
              scale: String(interpolate(xIn, [0, 1], [1.5, 1])),
            }}
          >
            ❌
          </div>
        </div>
      </CenterRow>
      <CenterRow top={660}>
        <BrutalTag text="A TAX YOU DIDN'T NEED TO PAY" fill={BRUTAL.accent2} fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 24 — second misuse: confusing this with binary search.
// ---------------------------------------------------------------------------

export const S24BinaryIntro: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={460}>
      <StampText text="2. BINARY SEARCH ≠ THIS" delay={2} fontSize={60} rotate={1} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 25 — the koko-eating-bananas style example: smallest speed that works.
// ---------------------------------------------------------------------------

export const S25SpeedExample: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])) }}>
          <EmojiSticker emoji="🍌" seed="koko" size={150} fill={BRUTAL.accent} />
        </div>
      </CenterRow>
      <CenterRow top={630}>
        <BrutalTag text="SMALLEST SPEED THAT FINISHES ON TIME" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 26 — a quick X over the sort→scan pipeline: not this pattern.
// ---------------------------------------------------------------------------

export const S26NotSortScan: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const xIn = spring({ frame, fps: 30, config: { damping: 9, stiffness: 260 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30 }}>
          <PaperCard seed="ns-1" style={{ width: 200, height: 100 }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>SORT</div>
          </PaperCard>
          <div style={{ width: 40, height: 6, background: BRUTAL.ink }} />
          <PaperCard seed="ns-2" style={{ width: 200, height: 100 }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>SCAN</div>
          </PaperCard>
          <div
            style={{
              position: "absolute",
              inset: -10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: brutalBodyFont,
              fontWeight: 700,
              fontSize: 160,
              color: BRUTAL.accent2,
              opacity: Math.min(1, xIn),
            }}
          >
            ❌
          </div>
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 27 — a yes/no staircase forms, redirecting to a different chapter.
// ---------------------------------------------------------------------------

const STEPS = [0, 0, 0, 1, 1, 1];

export const S27Staircase: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(6, Math.floor(dur / (STEPS.length + 3)));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {STEPS.map((v, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 12, stiffness: 200 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])) }}>
                <PaperCard seed={`stair-${i}`} fill={v ? BRUTAL.accent : "#ffffff"} style={{ width: 70, height: v ? 130 : 70 }}>
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
                    {v ? "YES" : "NO"}
                  </div>
                </PaperCard>
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={640}>
        <BrutalTag text="→ A DIFFERENT CHAPTER ENTIRELY" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};
