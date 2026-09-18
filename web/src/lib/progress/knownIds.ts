import sandboxIds from "@/lib/sandbox/sandboxIds.generated.json";
import { allLessonIds } from "@/lib/course/manifest";

// Only DSA syncs: the Next.js course 404s every route while disabled.
export const COURSE_SLUGS = ["dsa"] as const;

const LESSON_IDS = new Set(allLessonIds());
const SANDBOX_IDS = new Set<string>(sandboxIds);

export function isKnownLessonId(course: string, id: string): boolean {
  return course === "dsa" && LESSON_IDS.has(id);
}

export function isKnownSandboxId(id: string): boolean {
  return SANDBOX_IDS.has(id);
}
