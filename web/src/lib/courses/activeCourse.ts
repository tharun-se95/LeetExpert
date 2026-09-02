/**
 * Every route currently belongs to a registered course (`/courses/<slug>/...`)
 * or to no course at all (the catalog root). Progress still needs a bucket
 * even on non-course routes today, so this defaults to "dsa" — the first
 * course registered — rather than returning null.
 *
 * Lives in its own module, not inlined in `AppShell.tsx` (where it
 * originated) or `CourseNavTree.tsx` (which also needs it): those two
 * components already import each other transitively (`AppShell` renders
 * `Sidebar`, which renders `CourseNavTree`), so putting this function in
 * either one would create an import cycle the moment the other imported
 * it back.
 */
export function activeCourseSlugFor(pathname: string): string {
  const match = /^\/courses\/([^/]+)/.exec(pathname);
  return match ? match[1] : "dsa";
}
