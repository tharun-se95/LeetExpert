import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { brutalBodyFont } from "../../lib/fonts";
import { BrutalTag, PaperCard, PaperFlick } from "../../lib/brutalist";
import { Block, CenterRow, EmojiSticker, type SceneProps } from "./bits";

const SHELF = [7, 9, 12, 15, 21];

// ---------------------------------------------------------------------------
// 15 — the trophy shelf forms, left to right.
// ---------------------------------------------------------------------------

export const S15ShelfForms: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.max(4, Math.floor(dur / (SHELF.length + 2)));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {SHELF.map((v, i) => {
            const pop = spring({ frame: frame - i * gap, fps, config: { damping: 12, stiffness: 200 } });
            const h = 90 + i * 16;
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.4, 1])), opacity: Math.min(1, pop * 1.6) }}>
                <Block label={String(v)} seed={`h-${i}`} w={100} h={h} fontSize={28} fill={i === SHELF.length - 1 ? BRUTAL.accent : "#ffffff"} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={720}>
        <EmojiSticker emoji="🏆" seed="heap-tag" size={90} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 16 — a crown lands on the top trophy: it only ever shows the current best.
// ---------------------------------------------------------------------------

export const S16TopBest: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const crown = spring({ frame: frame - 4, fps, config: { damping: 10, stiffness: 220 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", position: "relative" }}>
          {SHELF.map((v, i) => (
            <Block key={i} label={String(v)} seed={`h-top-${i}`} w={100} h={90 + i * 16} fontSize={28} fill={i === SHELF.length - 1 ? BRUTAL.accent : "#ffffff"} />
          ))}
          <div
            style={{
              position: "absolute",
              right: 20,
              top: -60,
              fontSize: 60,
              translate: `0px ${interpolate(crown, [0, 1], [-40, 0])}px`,
              opacity: Math.min(1, crown * 1.6),
            }}
          >
            👑
          </div>
        </div>
      </CenterRow>
      <CenterRow top={720}>
        <BrutalTag text="TOP = CURRENT BEST" rotate={-1.5} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 17 — a challenger flies in toward the weakest trophy on the shelf.
// ---------------------------------------------------------------------------

export const S17ChallengerEnters: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 170 } });
  const landed = enter > 0.97;
  const pulse = landed ? 1 + Math.sin((frame - 30) * 0.25) * 0.05 : 1;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {/* the target sits directly above the "7" tile it's confronting */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "100%",
                translate: "-50% 0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: Math.min(1, enter * 1.6),
              }}
            >
              <div
                style={{
                  scale: String(interpolate(enter, [0, 1], [0.4, 1]) * pulse),
                  translate: `0px ${interpolate(enter, [0, 1], [-140, -18])}px`,
                }}
              >
                <EmojiSticker emoji="🎯" seed="challenger" size={100} fill={BRUTAL.accent2} />
              </div>
              <div
                style={{
                  width: 3,
                  height: 20,
                  background: BRUTAL.ink,
                  opacity: interpolate(enter, [0.6, 1], [0, 1], { extrapolateLeft: "clamp" }),
                }}
              />
            </div>
            <Block label="7" seed="h-weakest2" w={100} h={90} fontSize={28} />
          </div>
          {SHELF.slice(1).map((v, i) => (
            <Block key={i} label={String(v)} seed={`h-mid-${i}`} w={100} h={90 + (i + 1) * 16} fontSize={28} fill="#ffffff" />
          ))}
        </div>
      </CenterRow>
      <CenterRow top={720}>
        <BrutalTag text="BEAT THE WEAKEST, NOT THE CROWD" fill="#ffffff" fontSize={22} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 18 — quick beat: the weakest trophy gets knocked off the shelf.
// ---------------------------------------------------------------------------

export const S18WeakestOut: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const knock = spring({ frame, fps, config: { damping: 8, stiffness: 210 } });
  const settle = spring({ frame: frame - 10, fps, config: { damping: 11, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {/* "7" flies out while "10" — the challenger — drops into its spot */}
          <div style={{ position: "relative", width: 100, height: 90 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(knock, [0, 1], [1, 0]),
                translate: `${interpolate(knock, [0, 1], [0, -80])}px ${interpolate(knock, [0, 1], [0, 220])}px`,
                rotate: `${interpolate(knock, [0, 1], [0, -50])}deg`,
              }}
            >
              <Block label="7" seed="h-out" w={100} h={90} fontSize={28} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: Math.min(1, settle * 1.6),
                translate: `0px ${interpolate(settle, [0, 1], [-180, 0])}px`,
                scale: String(interpolate(settle, [0, 1], [0.5, 1])),
              }}
            >
              <Block label="10" seed="h-new" w={100} h={90} fontSize={28} fill={BRUTAL.accent2} />
            </div>
          </div>
          {SHELF.slice(1).map((v, i) => (
            <Block key={i} label={String(v)} seed={`h-after-${i}`} w={100} h={90 + (i + 1) * 16} fontSize={28} fill="#ffffff" />
          ))}
        </div>
      </CenterRow>
      <CenterRow top={720}>
        <BrutalTag text="10 TAKES THE SPOT" fill={BRUTAL.accent2} rotate={1.5} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 19 — a fully sorted row gets crossed out (too much work), replaced by a
// small branching heap-tree cutout that only ever needed the top.
// ---------------------------------------------------------------------------

export const S19SortXHeapGlow: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const xIn = spring({ frame: frame - 4, fps: 30, config: { damping: 10, stiffness: 240 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={300}>
        <div style={{ position: "relative", display: "flex", gap: 12 }}>
          {[21, 15, 12, 9, 7].map((v, i) => (
            <Block key={i} label={String(v)} seed={`sorted-${i}`} w={80} h={80} fontSize={22} />
          ))}
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
              scale: String(interpolate(xIn, [0, 1], [1.5, 1])),
            }}
          >
            ❌
          </div>
        </div>
      </CenterRow>
      <CenterRow top={430}>
        <BrutalTag text="FULL SORT" fill="#ffffff" rotate={-2} />
      </CenterRow>

      <PaperFlick delay={30} from="bottom">
        <CenterRow top={520}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <PaperCard seed="heap-root" fill={BRUTAL.accent} style={{ width: 100, height: 100 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 26 }}>21</div>
            </PaperCard>
            <div style={{ display: "flex", gap: 60 }}>
              <PaperCard seed="heap-l" style={{ width: 84, height: 84 }}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>15</div>
              </PaperCard>
              <PaperCard seed="heap-r" style={{ width: 84, height: 84 }}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>12</div>
              </PaperCard>
            </div>
          </div>
        </CenterRow>
      </PaperFlick>
      <CenterRow top={880}>
        <div style={{ opacity: Math.min(1, spring({ frame: frame - 60, fps: 30, config: { damping: 12, stiffness: 200 } })) }}>
          <BrutalTag text="O(n log K), NOT O(n log n)" />
        </div>
      </CenterRow>
    </div>
  );
};
