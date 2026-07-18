import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag, PaperCard, StampText } from "../../lib/brutalist";
import { Block, CenterRow, type SceneProps } from "./bits";

// ---------------------------------------------------------------------------
// 16 — the reusable pipeline: SORT ONCE -> SCAN, staged across the scene.
// ---------------------------------------------------------------------------

export const S16Pipeline: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box1 = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const arrow = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box2 = spring({ frame: frame - 55, fps, config: { damping: 12, stiffness: 200 } });
  const pulse = frame > 100 ? 1 + Math.sin((frame - 100) * 0.15) * 0.05 : 1;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ scale: String(interpolate(box1, [0, 1], [0.5, 1]) * pulse) }}>
            <PaperCard seed="pipe-1" fill={BRUTAL.accent} style={{ width: 280, height: 130 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30 }}>SORT ONCE</div>
            </PaperCard>
          </div>
          <div style={{ width: 90 * arrow, height: 8, background: BRUTAL.ink }} />
          <div style={{ scale: String(interpolate(box2, [0, 1], [0.5, 1])) }}>
            <PaperCard seed="pipe-2" fill="#ffffff" style={{ width: 280, height: 130 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30 }}>SCAN</div>
            </PaperCard>
          </div>
        </div>
      </CenterRow>
      <CenterRow top={680}>
        <BrutalTag text="THE HABIT THAT SHOWS UP EVERYWHERE" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 17 — letters of a word scramble, then sort into a key.
// ---------------------------------------------------------------------------

const LETTERS = ["E", "A", "T"];
const SORTED = ["A", "E", "T"];
const SCRAMBLE_X = [0, 260, 130];
const SORTED_X = [0, 130, 260];

export const S17Anagram: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = spring({ frame: frame - 20, fps, config: { damping: 13, stiffness: 150 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={420}>
        <div style={{ position: "relative", width: 320, height: 110 }}>
          {LETTERS.map((l, i) => {
            const x = interpolate(settle, [0, 1], [SCRAMBLE_X[i], SORTED_X[SORTED.indexOf(l)]]);
            return (
              <div key={l} style={{ position: "absolute", left: x, top: 0 }}>
                <Block label={l} seed={`ana-${l}`} w={100} h={100} fontSize={38} fill={BRUTAL.accent} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={620}>
        <BrutalTag text="SORT THE LETTERS = THE KEY" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 18 — two pointers slide in from both ends of a sorted row, meet in the
// middle.
// ---------------------------------------------------------------------------

const ROW = [2, 4, 6, 9, 11, 15];

export const S18TwoPointer: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, dur - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leftIdx = Math.min(2, Math.floor(progress * 3));
  const rightIdx = ROW.length - 1 - Math.min(2, Math.floor(progress * 3));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={460}>
        <div style={{ display: "flex", gap: 16 }}>
          {ROW.map((v, i) => (
            <Block key={i} label={String(v)} seed={`tp-${i}`} w={90} h={90} fontSize={26} fill={i === leftIdx || i === rightIdx ? BRUTAL.accent : "#ffffff"} />
          ))}
        </div>
      </CenterRow>
      <CenterRow top={620}>
        <BrutalTag text="WALK IN FROM BOTH ENDS" fill="#ffffff" fontSize={26} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 19 — Sort Colors: red / white / blue tiles jumbled together.
// ---------------------------------------------------------------------------

const COLOR_TILES = [BRUTAL.accent2, "#ffffff", BRUTAL.ink, "#ffffff", BRUTAL.accent2, BRUTAL.ink, "#ffffff", BRUTAL.accent2];

export const S19ColorsShuffle: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 10 }}>
          {COLOR_TILES.map((c, i) => {
            const pop = spring({ frame: frame - i * 3, fps, config: { damping: 10, stiffness: 220 } });
            return (
              <div key={i} style={{ scale: String(interpolate(pop, [0, 1], [0.3, 1])), rotate: `${(i % 2 ? 1 : -1) * 8}deg` }}>
                <PaperCard seed={`color-${i}`} fill={c} style={{ width: 80, height: 80 }} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={620}>
        <BrutalTag text="SORT COLORS: EVEN THIS IS THE HABIT" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 20 — the colors sweep into three clean zones: give order the chance.
// ---------------------------------------------------------------------------

const PARTITIONED = [
  BRUTAL.accent2, BRUTAL.accent2, BRUTAL.accent2,
  "#ffffff", "#ffffff", "#ffffff",
  BRUTAL.ink, BRUTAL.ink,
];

export const S20ColorsPartition: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <CenterRow top={480}>
        <div style={{ display: "flex", gap: 10 }}>
          {PARTITIONED.map((c, i) => {
            const pop = spring({ frame: frame - i * 2, fps, config: { damping: 13, stiffness: 190 } });
            return (
              <div key={i} style={{ translate: `0px ${interpolate(pop, [0, 1], [-20, 0])}px`, opacity: Math.min(1, pop * 1.6) }}>
                <PaperCard seed={`part-${i}`} fill={c} style={{ width: 80, height: 80 }} />
              </div>
            );
          })}
        </div>
      </CenterRow>
      <CenterRow top={620}>
        <StampText text="THE PASS AFTERWARD IS BORING ✅" delay={40} fontSize={44} bg="#ffffff" rotate={-1} />
      </CenterRow>
    </div>
  );
};
