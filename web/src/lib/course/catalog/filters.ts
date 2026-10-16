import type {
  CatalogFilterOptions,
  CatalogProblem,
  CuratedListId,
  Difficulty,
  SortField,
  SortOrder,
} from "./types";

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/**
 * Determines whether a problem is marked as solved, checking either its course
 * navigation ID (e.g. "arrays/move-zeroes"), its URL slug, or its LeetCode ID.
 */
export function isProblemSolved(
  problem: CatalogProblem,
  solvedIds: Set<string>,
): boolean {
  if (
    problem.courseModuleSlug &&
    problem.courseLessonSlug &&
    solvedIds.has(`${problem.courseModuleSlug}/${problem.courseLessonSlug}`)
  ) {
    return true;
  }
  if (solvedIds.has(problem.slug)) return true;
  if (solvedIds.has(`catalog/${problem.slug}`)) return true;
  if (solvedIds.has(String(problem.id))) return true;
  return false;
}

/**
 * Filter problems across list, difficulty, solved status, topic tags, and search query.
 */
export function filterCatalog(
  problems: readonly CatalogProblem[],
  opts: CatalogFilterOptions,
): CatalogProblem[] {
  const q = opts.query.trim().toLowerCase();
  const numericQuery = q.startsWith("#") ? q.slice(1).trim() : q;
  const isNumericSearch = /^\d+$/.test(numericQuery);

  return problems.filter((p) => {
    // 1. Curated list filter
    if (opts.list !== "all") {
      if (opts.list === "course") {
        if (!p.courseModuleSlug) return false;
      } else if (!p.lists.includes(opts.list)) {
        return false;
      }
    }

    // 2. Difficulty filter
    if (opts.difficulty !== "All" && p.difficulty !== opts.difficulty) {
      return false;
    }

    // 3. Status filter
    const solved = isProblemSolved(p, opts.solvedIds);
    if (opts.status === "Solved" && !solved) return false;
    if (opts.status === "Unsolved" && solved) return false;

    // 4. Topic filter: empty set means unrestricted (all eligible)
    if (opts.topics.size > 0) {
      const hasTopic = p.topics.some((t) => opts.topics.has(t));
      if (!hasTopic) return false;
    }

    // 5. Search query
    if (!q) return true;

    if (isNumericSearch) {
      if (String(p.id) === numericQuery || String(p.id).startsWith(numericQuery)) {
        return true;
      }
    }

    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.pattern?.toLowerCase().includes(q) ?? false) ||
      p.topics.some((t) => t.toLowerCase().includes(q))
    );
  });
}

/**
 * Sort catalog problems with stable tie-breaking on problem ID.
 */
export function sortCatalog(
  problems: CatalogProblem[],
  sortBy: SortField = "id",
  sortOrder: SortOrder = "asc",
  solvedIds: Set<string> = new Set(),
): CatalogProblem[] {
  const factor = sortOrder === "asc" ? 1 : -1;
  const copy = [...problems];

  return copy.sort((a, b) => {
    switch (sortBy) {
      case "id":
        return (a.id - b.id) * factor;

      case "title": {
        const cmp = a.title.localeCompare(b.title);
        return cmp !== 0 ? cmp * factor : a.id - b.id;
      }

      case "difficulty": {
        const diffA = DIFFICULTY_WEIGHT[a.difficulty] ?? 0;
        const diffB = DIFFICULTY_WEIGHT[b.difficulty] ?? 0;
        const cmp = diffA - diffB;
        return cmp !== 0 ? cmp * factor : a.id - b.id;
      }

      case "status": {
        const solvedA = isProblemSolved(a, solvedIds) ? 1 : 0;
        const solvedB = isProblemSolved(b, solvedIds) ? 1 : 0;
        const cmp = solvedA - solvedB;
        return cmp !== 0 ? cmp * factor : a.id - b.id;
      }

      default:
        return a.id - b.id;
    }
  });
}

/**
 * Compute the count of problems per topic tag for badge indicators.
 */
export function computeTopicCounts(
  problems: readonly CatalogProblem[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of problems) {
    for (const t of p.topics) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Compute problem counts across each curated list preset.
 */
export function computeListCounts(
  problems: readonly CatalogProblem[],
): Record<CuratedListId, number> {
  const counts: Record<CuratedListId, number> = {
    all: problems.length,
    course: 0,
    blind75: 0,
    neetcode150: 0,
    top150: 0,
  };

  for (const p of problems) {
    if (p.courseModuleSlug) counts.course++;
    if (p.lists.includes("blind75")) counts.blind75++;
    if (p.lists.includes("neetcode150")) counts.neetcode150++;
    if (p.lists.includes("top150")) counts.top150++;
  }

  return counts;
}
