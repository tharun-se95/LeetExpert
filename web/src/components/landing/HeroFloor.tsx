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
};

const CELL = 56;

/**
 * The data structures standing on the floor: an array with one element under
 * the pointer, a stack, uneven hash buckets, a small tree and a matrix corner.
 * Cells are in the 24 x 24 plane, whose middle (12, 12) is under the camera.
 */
export const HERO_BLOCKS: readonly Block[] = [
  // an array: six equal blocks, one under the pointer
  { col: 7, row: 11, h: 40 },
  { col: 8, row: 11, h: 40 },
  { col: 9, row: 11, h: 40 },
  { col: 10, row: 11, h: 40, family: "linear-traversal", bob: true },
  { col: 11, row: 11, h: 40 },
  { col: 12, row: 11, h: 40 },
  // a stack, three high, beside one two high
  { col: 15, row: 7, h: 168, banded: true },
  { col: 16, row: 7, h: 112, banded: true, family: "pointer-movement", bob: true },
  // hash buckets: uneven chains
  { col: 8, row: 15, h: 56, banded: true },
  { col: 9, row: 15, h: 112, banded: true, family: "ordering-search" },
  { col: 10, row: 15, h: 28, banded: true },
  { col: 11, row: 15, h: 84, banded: true },
  // a tree: the root high, its children lower
  { col: 18, row: 10, h: 120 },
  { col: 17, row: 12, h: 72, family: "recursive-exploration", bob: true },
  { col: 19, row: 12, h: 72 },
  { col: 20, row: 14, h: 36 },
  // a matrix corner and one DP cell
  { col: 13, row: 17, h: 24 },
  { col: 14, row: 17, h: 24 },
  { col: 13, row: 18, h: 24 },
  { col: 14, row: 18, h: 48, family: "state-transition", bob: true },
];

/** Floor cells lit where a pointer would have passed. */
export const HERO_LIT: readonly { col: number; row: number; family: FamilyId }[] = [
  { col: 6, row: 13, family: "linear-traversal" },
  { col: 7, row: 13, family: "linear-traversal" },
  { col: 14, row: 9, family: "ordering-search" },
  { col: 10, row: 16, family: "pointer-movement" },
  { col: 20, row: 14, family: "recursive-exploration" },
];

/**
 * The landing hero's 3D floor (owner, 2026-09-23: "instead of 2.5D lets go full
 * 3d"; spec docs/superpowers/specs/2026-09-23-landing-natural-scroll-3d-hero-design.md).
 * A perspective plane of hairline cells below the hero copy, with data
 * structures standing on it as solid blocks — each a top and four sides in one
 * preserve-3d context, styled in globals.css (.hero-floor…). It fades out along
 * its top edge, so nothing it draws sits under the copy.
 *
 * Pure markup: the drift, the bob and the pulse are CSS, so it costs no script
 * and renders on the server. Lit blocks take their family's UI accent from the
 * family table, scoped to the block (content, never chrome). Decorative.
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
                  style={{ left: cell.col * CELL, top: cell.row * CELL, "--top": getFamilyTheme(cell.family).accentUi } as CSSProperties}
                />
              ))}
              {HERO_BLOCKS.map((block) => (
                <div
                  key={`${block.col}-${block.row}`}
                  className="hero-block"
                  data-banded={block.banded || undefined}
                  data-bob={block.bob || undefined}
                  data-lit-block={block.family ? true : undefined}
                  style={
                    {
                      left: block.col * CELL,
                      top: block.row * CELL,
                      "--h": `${block.h}px`,
                      ...(block.family ? { "--top": getFamilyTheme(block.family).accentUi } : {}),
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
