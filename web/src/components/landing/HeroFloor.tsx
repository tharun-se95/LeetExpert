import type { CSSProperties } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { getFamilyTheme } from "@/lib/visual/familyTheme";

/** One block on the floor: its cell, its height in px, and optionally the family it is lit in. */
type Block = {
  col: number;
  row: number;
  h: number;
  family?: FamilyId;
  /** Drawn as a stack of unit blocks rather than one solid column. */
  banded?: boolean;
  bob?: boolean;
  tone?: "good" | "info" | "warn" | "insight" | "bad";
};

const CELL = 56;

/**
 * The data structures standing on the floor:
 * - Array memory cells in neon emerald (--good)
 * - Tree crystal nodes in electric cyan (--info) and royal violet (--insight)
 * - Dynamic programming memoization grid in warm golden amber (--warn)
 * - Stacks and hash buckets in vibrant family accents
 * Cells are in the 24 x 24 plane, whose middle (12, 12) is under the camera.
 */
export const HERO_BLOCKS: readonly Block[] = [
  // Lit array memory cells in neon emerald (--good)
  { col: 7, row: 11, h: 44, family: "linear-traversal", tone: "good" },
  { col: 8, row: 11, h: 44, family: "linear-traversal", tone: "good" },
  { col: 9, row: 11, h: 44, family: "linear-traversal", tone: "good" },
  { col: 10, row: 11, h: 56, family: "linear-traversal", tone: "good", bob: true },
  { col: 11, row: 11, h: 44, family: "linear-traversal", tone: "good" },
  { col: 12, row: 11, h: 44, family: "linear-traversal", tone: "good" },

  // a stack, three high, beside one two high (pointer-movement / warn)
  { col: 15, row: 7, h: 168, banded: true, family: "pointer-movement", tone: "warn" },
  { col: 16, row: 7, h: 112, banded: true, family: "pointer-movement", tone: "warn", bob: true },

  // hash buckets: uneven chains (ordering-search / info)
  { col: 8, row: 15, h: 56, banded: true, family: "ordering-search", tone: "info" },
  { col: 9, row: 15, h: 112, banded: true, family: "ordering-search", tone: "info" },
  { col: 10, row: 15, h: 28, banded: true, family: "ordering-search", tone: "info" },
  { col: 11, row: 15, h: 84, banded: true, family: "ordering-search", tone: "info" },

  // Branching tree crystal nodes in electric cyan (--info) and royal violet (--insight)
  { col: 18, row: 10, h: 120, family: "recursive-exploration", tone: "info" },
  { col: 17, row: 12, h: 72, family: "recursive-exploration", tone: "insight", bob: true },
  { col: 19, row: 12, h: 72, family: "recursive-exploration", tone: "info" },
  { col: 20, row: 14, h: 42, family: "recursive-exploration", tone: "insight", bob: true },

  // Dynamic programming memoization grid in warm golden amber (--warn)
  { col: 13, row: 17, h: 32, family: "state-transition", tone: "warn" },
  { col: 14, row: 17, h: 44, family: "state-transition", tone: "warn" },
  { col: 13, row: 18, h: 44, family: "state-transition", tone: "warn" },
  { col: 14, row: 18, h: 64, family: "state-transition", tone: "warn", bob: true },
  { col: 15, row: 18, h: 38, family: "state-transition", tone: "warn" },
];

/** Floor cells lit where algorithmic walkers and pointers have passed. */
export const HERO_LIT: readonly { col: number; row: number; family: FamilyId; tone?: string }[] = [
  { col: 6, row: 11, family: "linear-traversal", tone: "good" },
  { col: 6, row: 13, family: "linear-traversal", tone: "good" },
  { col: 7, row: 13, family: "linear-traversal", tone: "good" },
  { col: 13, row: 11, family: "linear-traversal", tone: "good" },
  { col: 14, row: 9, family: "ordering-search", tone: "info" },
  { col: 18, row: 9, family: "ordering-search", tone: "info" },
  { col: 10, row: 16, family: "pointer-movement", tone: "warn" },
  { col: 12, row: 17, family: "state-transition", tone: "warn" },
  { col: 15, row: 17, family: "state-transition", tone: "warn" },
  { col: 17, row: 11, family: "recursive-exploration", tone: "insight" },
  { col: 19, row: 13, family: "recursive-exploration", tone: "insight" },
  { col: 20, row: 14, family: "recursive-exploration", tone: "insight" },
];

/**
 * Artifact 1: Classic Algorithmic Hardcover Tome: "Introduction to Algorithms (CLRS)"
 * Pure 3D CSS / SVG card with rich obsidian & gold foil spine and embossed cover.
 */
function HardcoverTome() {
  return (
    <div
      className="hero-artifact-tome"
      style={{
        left: 170,
        top: 360,
      }}
    >
      <div className="hero-tome-3d">
        {/* Front Cover */}
        <div className="hero-tome-cover">
          <div className="hero-tome-border">
            <div className="hero-tome-header">
              <span>THE MIT PRESS</span>
              <span>4TH EDITION</span>
            </div>
            <div className="hero-tome-title-wrap">
              <span className="hero-tome-title block">INTRODUCTION TO ALGORITHMS</span>
              <p className="hero-tome-subtitle">CLRS · RIGOROUS FOUNDATIONS</p>
            </div>
            {/* Geometric SVG motif on the cover (graph & crystal recurrence tree) */}
            <svg className="hero-tome-diagram" viewBox="0 0 100 60" fill="none" aria-hidden>
              <circle cx="50" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="26" cy="34" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="74" cy="34" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="52" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="38" cy="52" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="62" cy="52" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="86" cy="52" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M47 16L29 30 M53 16L71 30 M23 38L16 48 M29 38L36 48 M71 38L64 48 M77 38L84 48" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <div className="hero-tome-authors">
              <span>CORMEN</span>
              <span>·</span>
              <span>LEISERSON</span>
              <span>·</span>
              <span>RIVEST</span>
              <span>·</span>
              <span>STEIN</span>
            </div>
          </div>
        </div>
        {/* Spine */}
        <div className="hero-tome-spine">
          <span className="hero-tome-spine-text">CLRS · INTRODUCTION TO ALGORITHMS</span>
        </div>
        {/* Page block edges */}
        <div className="hero-tome-pages-edge" />
        <div className="hero-tome-pages-bottom" />
      </div>
    </div>
  );
}

/**
 * Artifact 2: Saturated Live Code Chip / Memory Visualizer Card
 * Pure 3D CSS / SVG card with live test pass indicator and glowing array pointers.
 */
function CodeChipVisualizer() {
  return (
    <div
      className="hero-artifact-chip"
      style={{
        left: 770,
        top: 670,
      }}
    >
      <div className="hero-chip-3d">
        <div className="hero-chip-header">
          <div className="flex items-center gap-1.5">
            <span className="hero-chip-dot bg-good" />
            <span className="hero-chip-filename">binary_search.py</span>
          </div>
          <span className="hero-chip-pass-badge text-good">
            <svg className="mr-1 inline h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            24/24 PASS (0.3ms)
          </span>
        </div>

        <div className="hero-chip-body">
          <div className="hero-chip-array">
            <div className="hero-chip-cell text-muted">2</div>
            <div className="hero-chip-cell text-muted">5</div>
            <div className="hero-chip-cell text-muted">8</div>
            <div className="hero-chip-cell hero-chip-cell-active text-good">12</div>
            <div className="hero-chip-cell text-muted">19</div>
            <div className="hero-chip-cell text-muted">23</div>
            <div className="hero-chip-cell text-muted">38</div>
          </div>

          <div className="hero-chip-pointers">
            <span className="hero-pointer-tag border-info-line bg-info-surface text-info">
              left = 0
            </span>
            <span className="hero-pointer-tag border-insight-line bg-insight-surface text-insight">
              mid = 3
            </span>
            <span className="hero-pointer-tag border-warn-line bg-warn-surface text-warn">
              right = n-1
            </span>
          </div>

          <div className="hero-chip-code">
            <span className="text-info">nums[mid]</span>
            <span className="text-foreground"> == target </span>
            <span className="font-bold text-good">→ return mid</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Artifact 3: Red ● LIVE Engine Beacon
 * Glowing crimson live indicator pill floating in perspective space.
 */
function LiveEngineBeacon() {
  return (
    <div
      className="hero-artifact-beacon"
      style={{
        left: 520,
        top: 270,
      }}
    >
      <div className="hero-live-engine-pill">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-80 motion-reduce:animate-none" />
          <span className="relative h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="font-mono text-xs font-bold tracking-wider">LIVE WASM RUNTIME</span>
        <span className="font-mono text-[10px] opacity-80">· 0ms</span>
      </div>
    </div>
  );
}

/**
 * The landing hero's 3D floor (owner, 2026-09-23: "instead of 2.5D lets go full
 * 3d"; spec docs/superpowers/specs/2026-09-23-landing-natural-scroll-3d-hero-design.md).
 * A perspective plane of hairline cells below the hero copy, with vibrant data
 * structures standing on it as solid blocks (array, stack, hash buckets, tree, DP grid)
 * and floating tangible 3D physical artifacts (CLRS Tome, Code Chip, Live Beacon).
 *
 * Pure markup: the drift, the bob and the pulse are CSS, so it costs no script
 * and renders on the server. Lit blocks take their family's UI accent from the
 * family table or their saturated tone tokens, scoped to the block. Decorative.
 */
export function HeroFloor() {
  return (
    <div aria-hidden className="landing-hero-floor absolute inset-0">
      <div className="hero-floor">
        <div className="hero-floor-camera">
          <div className="hero-floor-drift">
            <div className="hero-floor-plane">
              <div className="hero-floor-grid" />
              {HERO_LIT.map((cell) => (
                <div
                  key={`${cell.col}-${cell.row}`}
                  className="hero-floor-lit"
                  style={{
                    left: cell.col * CELL,
                    top: cell.row * CELL,
                    "--top": cell.tone ? `var(--${cell.tone})` : getFamilyTheme(cell.family).accentUi,
                  } as CSSProperties}
                />
              ))}
              {HERO_BLOCKS.map((block) => (
                <div
                  key={`${block.col}-${block.row}`}
                  className="hero-block"
                  data-banded={block.banded || undefined}
                  data-bob={block.bob || undefined}
                  data-lit-block={block.family || block.tone ? true : undefined}
                  style={
                    {
                      left: block.col * CELL,
                      top: block.row * CELL,
                      "--h": `${block.h}px`,
                      "--top": block.tone
                        ? `var(--${block.tone})`
                        : block.family
                          ? getFamilyTheme(block.family).accentUi
                          : undefined,
                    } as CSSProperties
                  }
                >
                  <span className="n" />
                  <span className="s" />
                  <span className="e" />
                  <span className="w" />
                  <span className="t" />
                </div>
              ))}
              {/* Floating Tangible 3D Physical Artifacts */}
              <HardcoverTome />
              <CodeChipVisualizer />
              <LiveEngineBeacon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
