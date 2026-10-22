/**
 * Lessons that have an interactive artifact: a self-contained page under
 * `public/lessons/` that the problem workspace shows in a "Lesson" tab beside
 * the sandbox, or that the concept lesson view embeds as the interactive lesson.
 * Keyed by `${moduleSlug}/${lessonSlug}`.
 *
 * The page is built from `web/lesson-artifacts/` and takes the learner's theme
 * and code language from the app by postMessage (`ArtifactFrame`).
 */
export interface LessonArtifact {
  /** Site-relative path of the built page. */
  src: string;
  /** Accessible name of the frame. */
  title: string;
}

export const LESSON_ARTIFACTS: Readonly<Record<string, LessonArtifact>> = {
  // Getting Started (4 lessons)
  "getting-started/course-introduction": {
    src: "/lessons/getting-started/course-introduction.html",
    title: "Course Introduction, interactive lesson",
  },
  "getting-started/how-lessons-work": {
    src: "/lessons/getting-started/how-lessons-work.html",
    title: "How Lessons & Problems Work, interactive lesson",
  },
  "getting-started/writing-and-running-code": {
    src: "/lessons/getting-started/writing-and-running-code.html",
    title: "Writing & Running Code, interactive lesson",
  },
  "getting-started/course-roadmap": {
    src: "/lessons/getting-started/course-roadmap.html",
    title: "The Roadmap, interactive lesson",
  },

  // Big O (9 lessons)
  "big-o/why-efficiency-matters": {
    src: "/lessons/big-o/why-efficiency-matters.html",
    title: "Why Efficiency Matters, interactive lesson",
  },
  "big-o/big-o-notation": {
    src: "/lessons/big-o/big-o-notation.html",
    title: "Big O Notation, Precisely, interactive lesson",
  },
  "big-o/common-complexity-classes": {
    src: "/lessons/big-o/common-complexity-classes.html",
    title: "The Common Complexity Classes, interactive lesson",
  },
  "big-o/input-dependency-best-worst-average": {
    src: "/lessons/big-o/input-dependency-best-worst-average.html",
    title: "Input Dependency: Best, Worst, & Average, interactive lesson",
  },
  "big-o/analyzing-loops-api-complexity": {
    src: "/lessons/big-o/analyzing-loops-api-complexity.html",
    title: "Analyzing Loops & API Complexity, interactive lesson",
  },
  "big-o/analyzing-recursion-tree-method": {
    src: "/lessons/big-o/analyzing-recursion-tree-method.html",
    title: "Analyzing Recursion: The Tree Method, interactive lesson",
  },
  "big-o/amortized-analysis-dynamic-arrays": {
    src: "/lessons/big-o/amortized-analysis-dynamic-arrays.html",
    title: "Amortized Analysis & Dynamic Arrays, interactive lesson",
  },
  "big-o/space-complexity": {
    src: "/lessons/big-o/space-complexity.html",
    title: "Space Complexity, interactive lesson",
  },
  "big-o/complexity-drills": {
    src: "/lessons/big-o/complexity-drills.html",
    title: "Complexity Drills, interactive lesson",
  },

  // Math for DSA (6 lessons)
  "math-for-dsa/logarithms-and-exponents": {
    src: "/lessons/math-for-dsa/logarithms-and-exponents.html",
    title: "Logarithms & Exponents, interactive lesson",
  },
  "math-for-dsa/summations-and-series": {
    src: "/lessons/math-for-dsa/summations-and-series.html",
    title: "Summations & Series, interactive lesson",
  },
  "math-for-dsa/modular-arithmetic": {
    src: "/lessons/math-for-dsa/modular-arithmetic.html",
    title: "Modular Arithmetic, interactive lesson",
  },
  "math-for-dsa/divisibility-primes-gcd": {
    src: "/lessons/math-for-dsa/divisibility-primes-gcd.html",
    title: "Divisibility, Primes & GCD, interactive lesson",
  },
  "math-for-dsa/counting-and-combinatorics": {
    src: "/lessons/math-for-dsa/counting-and-combinatorics.html",
    title: "Counting & Combinatorics, interactive lesson",
  },
  "math-for-dsa/math-drills": {
    src: "/lessons/math-for-dsa/math-drills.html",
    title: "Math Drills, interactive lesson",
  },

  // Arrays (9 lessons)
  "arrays/contiguous-memory": {
    src: "/lessons/arrays/contiguous-memory.html",
    title: "Arrays in Memory, interactive lesson",
  },
  "arrays/dynamic-arrays": {
    src: "/lessons/arrays/dynamic-arrays.html",
    title: "Dynamic Arrays, Built From Scratch, interactive lesson",
  },
  "arrays/in-place-foundations": {
    src: "/lessons/arrays/in-place-foundations.html",
    title: "In-Place Foundations & Symmetric Pointers, interactive lesson",
  },
  "arrays/stable-compaction-cyclic-placement": {
    src: "/lessons/arrays/stable-compaction-cyclic-placement.html",
    title: "Stable Compaction & Cyclic Placement, interactive lesson",
  },
  "arrays/remove-duplicates-sorted": {
    src: "/lessons/arrays/remove-duplicates-sorted.html",
    title: "Remove Duplicates from Sorted Array, interactive lesson",
  },
  "arrays/move-zeroes": {
    src: "/lessons/arrays/move-zeroes.html",
    title: "Move Zeroes, interactive lesson",
  },
  "arrays/best-time-to-buy-sell-stock": {
    src: "/lessons/arrays/best-time-to-buy-sell-stock.html",
    title: "Best Time to Buy & Sell Stock, interactive lesson",
  },
  "arrays/rotate-array": {
    src: "/lessons/arrays/rotate-array.html",
    title: "Rotate Array, interactive lesson",
  },
  "arrays/product-except-self": {
    src: "/lessons/arrays/product-except-self.html",
    title: "Product of Array Except Self, interactive lesson",
  },

  // Linked Lists (8 lessons)
  "linked-lists/nodes-and-pointers": {
    src: "/lessons/linked-lists/nodes-and-pointers.html",
    title: "Nodes & Pointers, interactive lesson",
  },
  "linked-lists/build-a-linked-list": {
    src: "/lessons/linked-lists/build-a-linked-list.html",
    title: "Build a Linked List From Scratch, interactive lesson",
  },
  "linked-lists/pointer-surgery": {
    src: "/lessons/linked-lists/pointer-surgery.html",
    title: "Pointer Surgery Patterns, interactive lesson",
  },
  "linked-lists/reverse-linked-list": {
    src: "/lessons/linked-lists/reverse-linked-list.html",
    title: "Reverse Linked List, interactive lesson",
  },
  "linked-lists/middle-of-list": {
    src: "/lessons/linked-lists/middle-of-list.html",
    title: "Middle of the Linked List, interactive lesson",
  },
  "linked-lists/linked-list-cycle": {
    src: "/lessons/linked-lists/linked-list-cycle.html",
    title: "Linked List Cycle, interactive lesson",
  },
  "linked-lists/merge-two-sorted": {
    src: "/lessons/linked-lists/merge-two-sorted.html",
    title: "Merge Two Sorted Lists, interactive lesson",
  },
  "linked-lists/remove-nth-from-end": {
    src: "/lessons/linked-lists/remove-nth-from-end.html",
    title: "Remove Nth Node From End, interactive lesson",
  },

  // Sliding Window (1 lesson)
  "sliding-window/longest-substring-without-repeating": {
    src: "/lessons/sliding-window/longest-substring-without-repeating.html",
    title: "Longest Substring Without Repeating Characters, interactive lesson",
  },

  // Binary Trees (1 lesson)
  "binary-trees/diameter-of-binary-tree": {
    src: "/lessons/binary-trees/diameter-of-binary-tree.html",
    title: "Diameter of Binary Tree, interactive lesson",
  },

  // Graphs (1 lesson)
  "graphs/course-schedule": {
    src: "/lessons/graphs/course-schedule.html",
    title: "Course Schedule, interactive lesson",
  },

  // Dynamic Programming (1 lesson)
  "dynamic-programming/coin-change": {
    src: "/lessons/dynamic-programming/coin-change.html",
    title: "Coin Change, interactive lesson",
  },
};

export function getLessonArtifact(
  moduleSlug: string,
  lessonSlug: string,
): LessonArtifact | null {
  return LESSON_ARTIFACTS[`${moduleSlug}/${lessonSlug}`] ?? null;
}

/**
 * Returns true if the pathname corresponds to a DSA concept lesson that
 * possesses an interactive artifact. When true, the shell gives <main>
 * the full-viewport height with overflow-hidden so the artifact frame can
 * manage its own smooth scrolling.
 */
export function isConceptLessonArtifactPath(pathname: string): boolean {
  const match = pathname.match(/^\/courses\/dsa\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return false;
  const [, moduleSlug, lessonSlug] = match;
  if (moduleSlug === "problems" || moduleSlug === "overviews" || lessonSlug === "concept-map") {
    return false;
  }
  return getLessonArtifact(moduleSlug, lessonSlug) !== null;
}
