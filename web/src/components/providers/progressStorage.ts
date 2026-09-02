/**
 * Legacy flat keys, pre-multi-course. Migrated once per course into the
 * namespaced keys below, then left alone (not deleted — a second read
 * would just no-op against Step 3's "existing namespaced key wins" check,
 * and deleting adds a failure mode — an interrupted migration — for no
 * benefit).
 */
const LEGACY_VISITED_KEY = "dsa-course-progress";
const LEGACY_SOLVED_KEY = "dsa-course-solved";

export function visitedKey(courseSlug: string): string {
  return `course-progress:${courseSlug}`;
}

export function solvedKey(courseSlug: string): string {
  return `course-solved:${courseSlug}`;
}

export function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function writeSet(key: string, value: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    /* private mode or a full quota — losing the record is survivable */
  }
}

/**
 * One-time migration from the pre-multi-course flat keys into DSA's
 * namespaced keys. Only DSA ever had the legacy keys (it was the only
 * course when they were written) — gated explicitly on courseSlug, not
 * just "does this course lack a namespaced key yet," because that weaker
 * gate would copy DSA's legacy visited/solved ids into ANY future
 * course's bucket the first time a user opens it (a real cross-course
 * data leak caught in review, not a hypothetical).
 */
export function migrateLegacyProgress(courseSlug: string) {
  if (courseSlug !== "dsa") return;
  try {
    if (localStorage.getItem(visitedKey(courseSlug)) === null) {
      const legacy = localStorage.getItem(LEGACY_VISITED_KEY);
      if (legacy !== null) localStorage.setItem(visitedKey(courseSlug), legacy);
    }
    if (localStorage.getItem(solvedKey(courseSlug)) === null) {
      const legacy = localStorage.getItem(LEGACY_SOLVED_KEY);
      if (legacy !== null) localStorage.setItem(solvedKey(courseSlug), legacy);
    }
  } catch {
    /* private mode or a full quota — losing the migration is survivable */
  }
}
