import { moduleFamily, type ProblemGroup } from "@/lib/course/manifest";
import { lessonId } from "@/lib/course/nav";
import {
  getProblemDifficulty,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import type { FamilyId } from "@/lib/content/manifest";

export type StatusFilter = "All" | "Solved" | "Unsolved";
export type DifficultyFilter = "All" | Difficulty;

export interface FlatProblem {
  slug: string;
  title: string;
  difficulty: Difficulty | undefined;
  moduleSlug: string;
  moduleLabel: string;
  moduleNumber: number;
  familyId: FamilyId | null;
}

/**
 * Module order, then in-module order — the same order the page already
 * presented as stacked sections, so "work it in order, or jump to
 * anything" still holds for the default (unfiltered) view.
 */
export function flattenProblems(groups: ProblemGroup[]): FlatProblem[] {
  return groups.flatMap((g) =>
    g.problems.map((p) => ({
      slug: p.slug,
      title: p.title,
      difficulty: getProblemDifficulty(p.slug),
      moduleSlug: g.module.slug,
      moduleLabel: g.module.shortTitle,
      moduleNumber: g.module.number,
      familyId: moduleFamily(g.module),
    })),
  );
}

export interface FilterOptions {
  query: string;
  difficulty: DifficultyFilter;
  status: StatusFilter;
  /** Module slugs. Empty = every module is eligible, not "match nothing". */
  topics: Set<string>;
  /** lessonId(moduleSlug, slug) set, from useProgress(). */
  solved: Set<string>;
}

export function filterProblems(
  flat: FlatProblem[],
  opts: FilterOptions,
): FlatProblem[] {
  const q = opts.query.trim().toLowerCase();
  return flat.filter((p) => {
    if (opts.difficulty !== "All" && p.difficulty !== opts.difficulty) {
      return false;
    }
    if (opts.topics.size > 0 && !opts.topics.has(p.moduleSlug)) {
      return false;
    }
    const isSolved = opts.solved.has(lessonId(p.moduleSlug, p.slug));
    if (opts.status === "Solved" && !isSolved) return false;
    if (opts.status === "Unsolved" && isSolved) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.moduleLabel.toLowerCase().includes(q) ||
      (p.difficulty?.toLowerCase().includes(q) ?? false)
    );
  });
}
