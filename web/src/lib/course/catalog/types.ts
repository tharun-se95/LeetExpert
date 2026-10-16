import type { Difficulty } from "@/lib/course/problemDifficulty";
export type { Difficulty };

export type CuratedListId =
  | "all"
  | "course"
  | "blind75"
  | "neetcode150"
  | "top150";

export interface CatalogProblem {
  /** Official LeetCode problem ID number (e.g., 1, 15, 42). */
  id: number;
  /** LeetCode URL slug (e.g., "two-sum", "trapping-rain-water"). */
  slug: string;
  /** Human-readable title. */
  title: string;
  /** Official difficulty rating. */
  difficulty: Difficulty;
  /** Primary category / topic tags (e.g. ["Arrays", "Two Pointers"]). */
  topics: string[];
  /** Algorithmic pattern (e.g., "Converging Pointers", "Monotonic Stack"). */
  pattern?: string;
  /** Curated lists this problem belongs to. */
  lists: CuratedListId[];
  /** Course module slug if implemented in LeetExpert, else undefined. */
  courseModuleSlug?: string;
  /** Course lesson slug if implemented in LeetExpert, else undefined. */
  courseLessonSlug?: string;
}

export type SortField = "id" | "title" | "difficulty" | "status";
export type SortOrder = "asc" | "desc";

export interface CatalogFilterOptions {
  query: string;
  list: CuratedListId;
  difficulty: "All" | Difficulty;
  status: "All" | "Solved" | "Unsolved";
  topics: Set<string>;
  solvedIds: Set<string>;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface CuratedListMeta {
  id: CuratedListId;
  label: string;
  description: string;
}

export const CURATED_LISTS: readonly CuratedListMeta[] = [
  {
    id: "all",
    label: "All DSA",
    description: "Complete catalog of essential DSA problems across all categories",
  },
  {
    id: "course",
    label: "Course Drills",
    description: "Problems with full interactive sandboxes in this course",
  },
  {
    id: "blind75",
    label: "Blind 75",
    description: "The classic 75 questions covering core interview patterns",
  },
  {
    id: "neetcode150",
    label: "NeetCode 150",
    description: "Comprehensive 150-problem pattern roadmap",
  },
  {
    id: "top150",
    label: "Top Interview 150",
    description: "LeetCode official top interview collection",
  },
] as const;
