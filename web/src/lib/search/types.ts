/**
 * One search-index entry. Field names stay short (matches the existing
 * `build-search-index.mjs` output) since this file is fetched by every
 * client that opens search — see that script's own comment on why the
 * index carries only titles/headings, not full prose.
 */
export interface SearchDocument {
  /** Course slug, e.g. "dsa". */
  c: string;
  /** Module slug within the course. */
  m: string;
  /** Lesson slug. */
  s: string;
  /** Lesson title. */
  t: string;
  /** Lesson type: "concept" | "problem" | "practice" (course-defined). */
  y: string;
  /** ## headings, for heading-level matches. */
  h: string[];
}
