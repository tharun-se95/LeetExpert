import { lessonIdFromPathname as dsaLessonIdFromPathname } from "@/lib/course/nav";
import { nextjsLessonIdFromPathname } from "@/app/courses/nextjs/nav";

/**
 * Dispatches a pathname to whichever registered course's own id parser
 * recognizes it, or `null` if none does. `VisitTracker` is course-
 * agnostic and needs exactly one function to call regardless of which
 * course's route the visitor is on — each course keeps its own parser
 * next to its own manifest (matching the platform's "everything about a
 * course lives isolated under its own folder" design) rather than one
 * shared parser trying to cover every course's URL shape.
 */
export function courseLessonIdFromPathname(pathname: string): string | null {
  return (
    dsaLessonIdFromPathname(pathname) ?? nextjsLessonIdFromPathname(pathname)
  );
}
