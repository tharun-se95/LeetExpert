/**
 * Lessons that have an interactive artifact: a self-contained page under
 * `public/lessons/` that the problem workspace shows in a "Lesson" tab, beside
 * the sandbox. Keyed by `lessonId` so a typo cannot silently match nothing
 * (`tests/lessonArtifacts.test.ts` resolves every key against the manifest and
 * every `src` against `public/`).
 *
 * The page is built from `web/lesson-artifacts/` and takes the learner's theme
 * and code language from the app by message (`LessonArtifactFrame`).
 */
export interface LessonArtifact {
  /** Site-relative path of the built page. */
  src: string;
  /** Accessible name of the frame. */
  title: string;
}

export const LESSON_ARTIFACTS: Readonly<Record<string, LessonArtifact>> = {
  "sliding-window/longest-substring-without-repeating": {
    src: "/lessons/sliding-window/longest-substring-without-repeating.html",
    title: "Longest Substring Without Repeating Characters, interactive lesson",
  },
  "dynamic-programming/coin-change": {
    src: "/lessons/dynamic-programming/coin-change.html",
    title: "Coin Change, interactive lesson",
  },
  "graphs/course-schedule": {
    src: "/lessons/graphs/course-schedule.html",
    title: "Course Schedule, interactive lesson",
  },
  "binary-trees/diameter-of-binary-tree": {
    src: "/lessons/binary-trees/diameter-of-binary-tree.html",
    title: "Diameter of Binary Tree, interactive lesson",
  },
};

export function getLessonArtifact(
  moduleSlug: string,
  lessonSlug: string,
): LessonArtifact | null {
  return LESSON_ARTIFACTS[`${moduleSlug}/${lessonSlug}`] ?? null;
}
