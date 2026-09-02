"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDown as ChevronDown,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  buildCourseNav,
  type CourseNavModule,
  type CourseNavStage,
} from "@/lib/course/nav";
import { buildNextjsCourseNav } from "@/app/courses/nextjs/nav";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CURRICULUM } from "@/lib/landing/content";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Module whose page or a lesson under it matches the current route. */
function activeModuleSlug(
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

function ModuleNode({
  navModule,
  pathname,
  open,
  onToggle,
  compact,
}: {
  navModule: CourseNavModule;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  /** Desktop rail uses denser rows; mobile sheet needs ≥44px taps. */
  compact: boolean;
}) {
  const { visited } = useProgress();
  const hasLessons = navModule.lessons.length > 0;
  const selfActive = pathname === navModule.href;

  const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
  // Desktop: ~32px rows; mobile sheet: ≥44px taps.
  const rowPad = compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";
  const chevronBox = compact ? "h-8 w-6" : "h-11 w-11";

  return (
    <div>
      <div className="group flex items-center gap-1 rounded-[length:var(--radius-md)]">
        {hasLessons ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] text-muted hover:bg-surface hover:text-foreground",
              chevronBox,
            )}
            aria-expanded={open}
            aria-label={open ? "Collapse module" : "Expand module"}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <CaretRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className={cn("inline-flex shrink-0", chevronBox)} />
        )}
        <Link
          href={navModule.href}
          className={cn(
            "min-w-0 flex-1 truncate rounded-[length:var(--radius-xs)] px-2 text-[13px] transition-colors",
            rowPad,
            navModule.status === "coming-soon" && "text-muted/60",
            selfActive
              ? "bg-pop font-semibold text-on-pop"
              : "text-foreground/80 hover:bg-surface hover:text-foreground",
          )}
        >
          <span className="mr-1.5 tabular-nums text-[11px] text-muted">
            {navModule.number}.
          </span>
          {navModule.shortTitle}
          {navModule.status === "coming-soon" ? (
            <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted/50">
              soon
            </span>
          ) : hasLessons ? (
            <span
              className={cn(
                "ml-1.5 font-mono text-[10px] tabular-nums",
                selfActive
                  ? "text-on-pop/70"
                  : doneCount === navModule.lessons.length
                    ? "text-mark"
                    : "text-muted",
              )}
            >
              {doneCount}/{navModule.lessons.length}
            </span>
          ) : null}
        </Link>
      </div>
      {hasLessons && open ? (
        <div
          className={cn(
            "border-l border-border",
            compact
              ? "ml-3.5 mt-1 space-y-0.5 pl-3"
              : "ml-3.5 mt-1.5 space-y-1 pl-3",
          )}
        >
          {navModule.lessons.map((lesson) => {
            const active = pathname === lesson.href;
            const isDone = visited.has(lesson.id);
            return (
              <div key={lesson.id} className="flex items-start gap-1">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center",
                    chevronBox,
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-[length:var(--radius-xs)] transition-colors",
                      isDone
                        ? "bg-accent"
                        : "border border-border bg-transparent",
                    )}
                    title={isDone ? "Completed" : "Not completed"}
                  />
                </span>
                <Link
                  href={lesson.href}
                  className={cn(
                    "flex min-w-0 flex-1 items-center rounded-[length:var(--radius-xs)] px-2 text-[13px] leading-snug transition-colors",
                    rowPad,
                    active
                      ? "bg-pop font-semibold text-on-pop"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  <span className="min-w-0">{lesson.title}</span>
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Shared course module/lesson tree for the desktop drawer and mobile sheet.
 */
export function CourseNavTree({
  compact = true,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const courseSlug = activeCourseSlugFor(pathname);
  const nav = useMemo(
    () => (courseSlug === "nextjs" ? buildNextjsCourseNav() : buildCourseNav()),
    [courseSlug],
  );
  const curriculumHref = courseSlug === "nextjs" ? NEXTJS_COURSE.href : CURRICULUM;
  const [openModuleSlug, setOpenModuleSlug] = useState<string | null>(() =>
    activeModuleSlug(nav, pathname),
  );

  useEffect(() => {
    const active = activeModuleSlug(nav, pathname);
    if (active) setOpenModuleSlug(active);
  }, [nav, pathname]);

  return (
    <nav className={cn("flex-1 overflow-y-auto", className)} aria-label="Course">
      <Link
        href={curriculumHref}
        className={cn(
          "mb-2.5 block rounded-[length:var(--radius-xs)] px-2 text-[13px] font-medium transition-colors",
          compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5",
          pathname === curriculumHref
            ? "bg-pop font-semibold text-on-pop"
            : "text-foreground hover:bg-surface",
        )}
      >
        All modules
      </Link>
      {nav.map((stage) => (
        <div
          key={stage.number}
          className={cn(compact ? "mt-5 first:mt-3" : "mt-6 first:mt-4")}
        >
          <p
            className={cn(
              "border-b border-border px-2 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70",
              compact ? "mb-2 pb-1.5" : "mb-3 pb-2",
            )}
          >
            {stage.title}
          </p>
          <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
            {stage.modules.map((m) => (
              <ModuleNode
                key={m.slug}
                navModule={m}
                pathname={pathname}
                open={openModuleSlug === m.slug}
                onToggle={() =>
                  setOpenModuleSlug((prev) =>
                    prev === m.slug ? null : m.slug,
                  )
                }
                compact={compact}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
