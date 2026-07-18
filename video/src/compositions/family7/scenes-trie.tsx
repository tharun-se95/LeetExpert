import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRUTAL } from "../../lib/theme";
import { BrutalTag, PaperCard, StampText } from "../../lib/brutalist";
import { CenterRow, EmojiSticker, type SceneProps } from "./bits";

const NodeLetter: React.FC<{ letter: string; x: number; y: number; fill?: string; seed: string; delay?: number }> = ({
  letter,
  x,
  y,
  fill = "#ffffff",
  seed,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 210 } });
  return (
    <div style={{ position: "absolute", left: x - 45, top: y - 45, scale: String(interpolate(pop, [0, 1], [0.4, 1])), opacity: Math.min(1, pop * 1.6) }}>
      <PaperCard seed={seed} fill={fill} style={{ width: 90, height: 90 }}>
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 32, color: BRUTAL.ink }}>
          {letter}
        </div>
      </PaperCard>
    </div>
  );
};

// A tape strip stacked directly above its own tag via relative positioning,
// so it stays centered on the tag regardless of the tag's rendered width —
// unlike page-absolute coordinates, which drift out of alignment.
const TapedTag: React.FC<{ text: string; rotate: number }> = ({ text, rotate }) => (
  <div style={{ position: "relative", display: "inline-flex", justifyContent: "center" }}>
    <div
      style={{
        position: "absolute",
        top: -16,
        left: "50%",
        translate: "-50% 0px",
        width: 90,
        height: 30,
        background: `color-mix(in oklab, ${BRUTAL.accent2} 55%, white)`,
        opacity: 0.85,
        border: `2px solid ${BRUTAL.ink}`,
        rotate: `${rotate}deg`,
        boxShadow: `3px 3px 0 ${BRUTAL.ink}`,
      }}
    />
    <BrutalTag text={text} fontSize={30} />
  </div>
);

const ROOT = { x: 960, y: 340 };
const A = { x: 960, y: 500 };
const P1 = { x: 960, y: 660 };
const P2 = { x: 840, y: 820 };
const E = { x: 1080, y: 820 };

// ---------------------------------------------------------------------------
// 25 — a small branching letter tree builds: root -> A -> P -> (P|E).
// ---------------------------------------------------------------------------

export const S25TreeForms: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <line x1={ROOT.x} y1={ROOT.y} x2={A.x} y2={A.y} stroke={BRUTAL.ink} strokeWidth={4} />
      <line x1={A.x} y1={A.y} x2={P1.x} y2={P1.y} stroke={BRUTAL.ink} strokeWidth={4} />
      <line x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y} stroke={BRUTAL.ink} strokeWidth={4} />
      <line x1={P1.x} y1={P1.y} x2={E.x} y2={E.y} stroke={BRUTAL.ink} strokeWidth={4} />
    </svg>
    <NodeLetter letter="•" x={ROOT.x} y={ROOT.y} seed="root" delay={0} />
    <NodeLetter letter="A" x={A.x} y={A.y} seed="a" delay={5} />
    <NodeLetter letter="P" x={P1.x} y={P1.y} seed="p1" delay={10} />
    <NodeLetter letter="P" x={P2.x} y={P2.y} seed="p2" fill={BRUTAL.accent} delay={16} />
    <NodeLetter letter="E" x={E.x} y={E.y} seed="e" fill={BRUTAL.accent} delay={16} />
    <CenterRow top={900}>
      <EmojiSticker emoji="🌳" seed="trie-tag" size={90} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 26 — "APP" and "APE" labels appear; a tape strip marks the shared
// root -> A -> P branch both words walk through.
// ---------------------------------------------------------------------------

export const S26SharedBranch: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame % 40, [0, 20, 40], [0.3, 1, 0.3]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1={ROOT.x} y1={ROOT.y} x2={A.x} y2={A.y} stroke={BRUTAL.accent} strokeWidth={10} opacity={glow} />
        <line x1={A.x} y1={A.y} x2={P1.x} y2={P1.y} stroke={BRUTAL.accent} strokeWidth={10} opacity={glow} />
        <line x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y} stroke={BRUTAL.ink} strokeWidth={4} />
        <line x1={P1.x} y1={P1.y} x2={E.x} y2={E.y} stroke={BRUTAL.ink} strokeWidth={4} />
      </svg>
      <NodeLetter letter="•" x={ROOT.x} y={ROOT.y} seed="root2" />
      <NodeLetter letter="A" x={A.x} y={A.y} seed="a2" fill={BRUTAL.accent} />
      <NodeLetter letter="P" x={P1.x} y={P1.y} seed="p12" fill={BRUTAL.accent} />
      <NodeLetter letter="P" x={P2.x} y={P2.y} seed="p22" />
      <NodeLetter letter="E" x={E.x} y={E.y} seed="e2" />
      <CenterRow top={150}>
        <div style={{ display: "flex", gap: 260 }}>
          <TapedTag text="APP" rotate={-8} />
          <TapedTag text="APE" rotate={8} />
        </div>
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 27 — a walker dot travels down root -> A -> P, leaving a lit trail: one
// letter at a time.
// ---------------------------------------------------------------------------

export const S27WalkHighlight: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [10, dur - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const seg1 = Math.min(1, progress * 2);
  const seg2 = Math.max(0, Math.min(1, progress * 2 - 1));
  const walkerY = interpolate(progress, [0, 1], [ROOT.y, P1.y]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1={ROOT.x} y1={ROOT.y} x2={A.x} y2={ROOT.y + (A.y - ROOT.y) * seg1} stroke={BRUTAL.accent} strokeWidth={10} />
        <line x1={A.x} y1={A.y} x2={P1.x} y2={A.y + (P1.y - A.y) * seg2} stroke={BRUTAL.accent} strokeWidth={10} />
      </svg>
      <div style={{ position: "absolute", left: ROOT.x - 16, top: walkerY - 16, width: 32, height: 32, borderRadius: 999, background: BRUTAL.accent2, border: `3px solid ${BRUTAL.ink}` }} />
      <NodeLetter letter="•" x={ROOT.x} y={ROOT.y} seed="root3" />
      <NodeLetter letter="A" x={A.x} y={A.y} seed="a3" fill={seg1 >= 1 ? BRUTAL.accent : "#ffffff"} />
      <NodeLetter letter="P" x={P1.x} y={P1.y} seed="p13" fill={seg2 >= 1 ? BRUTAL.accent : "#ffffff"} />
      <CenterRow top={900}>
        <BrutalTag text="ONE LETTER AT A TIME" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 28 — a full dictionary scan gets crossed out.
// ---------------------------------------------------------------------------

export const S28FullScanX: React.FC<SceneProps> = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <CenterRow top={480}>
      <StampText text="📚 FULL DICTIONARY SCAN ❌" delay={4} fontSize={56} bg="#ffffff" rotate={-1} />
    </CenterRow>
  </div>
);

// ---------------------------------------------------------------------------
// 29 — the rest of the tree folds away; only the one live path stays lit.
// ---------------------------------------------------------------------------

export const S29SinglePathLit: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const fold = spring({ frame, fps: 30, config: { damping: 11, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1={ROOT.x} y1={ROOT.y} x2={A.x} y2={A.y} stroke={BRUTAL.accent} strokeWidth={10} />
        <line x1={A.x} y1={A.y} x2={P1.x} y2={P1.y} stroke={BRUTAL.accent} strokeWidth={10} />
      </svg>
      <NodeLetter letter="•" x={ROOT.x} y={ROOT.y} seed="root4" fill={BRUTAL.accent} />
      <NodeLetter letter="A" x={A.x} y={A.y} seed="a4" fill={BRUTAL.accent} />
      <NodeLetter letter="P" x={P1.x} y={P1.y} seed="p14" fill={BRUTAL.accent} />
      <div
        style={{
          position: "absolute",
          left: P2.x - 45,
          top: P2.y - 45,
          opacity: interpolate(fold, [0, 1], [1, 0]),
          translate: `${interpolate(fold, [0, 1], [0, -140])}px ${interpolate(fold, [0, 1], [0, -60])}px`,
          rotate: `${interpolate(fold, [0, 1], [0, -30])}deg`,
        }}
      >
        <PaperCard seed="p2-fold" style={{ width: 90, height: 90 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: E.x - 45,
          top: E.y - 45,
          opacity: interpolate(fold, [0, 1], [1, 0]),
          translate: `${interpolate(fold, [0, 1], [0, 140])}px ${interpolate(fold, [0, 1], [0, -60])}px`,
          rotate: `${interpolate(fold, [0, 1], [0, 30])}deg`,
        }}
      >
        <PaperCard seed="e-fold" style={{ width: 90, height: 90 }} />
      </div>
      <CenterRow top={900}>
        <BrutalTag text="ONE WALK, NOT A FULL SCAN ✅" fill="#ffffff" fontSize={24} />
      </CenterRow>
    </div>
  );
};
