import declared from "./overviews.generated.json";

/**
 * A course overview: one interactive page across a stage's modules ("The Line
 * Underneath" across arrays, linked lists, stacks and queues). Not a lesson, so
 * it is outside the manifest, progress and the ledger's lesson totals.
 *
 * The declarations live in `lesson-artifacts/build.py` (`LESSONS`, under
 * "overviews") and reach the app through `scripts/build-overviews.mjs`, which
 * writes `overviews.generated.json` — one source, so a hub card cannot name a
 * stage the page does not span. `tests/overviewPages.test.ts` fails when the
 * committed JSON drifts from build.py.
 */
export interface Overview {
  slug: string;
  title: string;
  /** `STAGES` number in manifest.ts: the hub section the card sits in. */
  stage: number;
  /** One line for the hub card. */
  summary: string;
  /** Family id (familyTheme.ts) that colours the card and nothing else. */
  family: string;
}

export const OVERVIEWS: readonly Overview[] = declared;

export function overviewsByStage(stage: number): Overview[] {
  return OVERVIEWS.filter((o) => o.stage === stage);
}

export function getOverview(slug: string): Overview | undefined {
  return OVERVIEWS.find((o) => o.slug === slug);
}

export function overviewHref(slug: string): string {
  return `/courses/dsa/overviews/${slug}`;
}

/**
 * Where `scripts/build-overviews.mjs` puts the built page under `public/`. It
 * sits beside `artifacts/fonts` and `artifacts/vendor`, which the page loads
 * by relative path.
 */
export function overviewSrc(slug: string): string {
  return `/artifacts/overviews/${slug}.html`;
}
