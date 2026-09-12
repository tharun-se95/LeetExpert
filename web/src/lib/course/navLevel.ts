import type { CourseNavModule, CourseNavStage } from "@/lib/course/nav";

/** Which pane the course nav shows: every module, or one module's lessons. */
export type NavView =
  | { level: "modules" }
  | { level: "module"; navModule: CourseNavModule };

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Module whose page or a lesson under it matches the current route. */
export function activeModuleSlug(
  stages: CourseNavStage[],
  pathname: string,
): string | null {
  for (const stage of stages) {
    for (const navModule of stage.modules) {
      if (pathname === navModule.href) return navModule.slug;
      if (navModule.lessons.some((l) => isActivePath(pathname, l.href))) {
        return navModule.slug;
      }
    }
  }
  return null;
}

/**
 * The level is derived from the route, not stored — except `backToModules`,
 * the one-shot override the back button sets so a reader can browse other
 * modules without leaving the page they are on.
 */
export function resolveNavView({
  stages,
  pathname,
  backToModules = false,
}: {
  stages: CourseNavStage[];
  pathname: string;
  backToModules?: boolean;
}): NavView {
  if (backToModules) return { level: "modules" };
  const slug = activeModuleSlug(stages, pathname);
  if (!slug) return { level: "modules" };
  const navModule = stages
    .flatMap((stage) => stage.modules)
    .find((m) => m.slug === slug);
  // Nothing to show at level 2, so following the row just navigates.
  if (!navModule || navModule.lessons.length === 0) return { level: "modules" };
  return { level: "module", navModule };
}
