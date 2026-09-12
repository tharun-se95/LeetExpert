"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { buildCourseNav } from "@/lib/course/nav";
import { resolveNavView } from "@/lib/course/navLevel";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";
import { buildNextjsCourseNav } from "@/app/courses/nextjs/nav";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CURRICULUM } from "@/lib/landing/content";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";

/** Matches --dur/--ease in globals.css, and the mobile sheet's own motion. */
const SLIDE = {
  duration: 0.22,
  ease: [0.2, 0, 0, 1] as [number, number, number, number],
};
const SLIDE_PX = 24;

/**
 * Shared course nav for the desktop drawer and mobile sheet: a module list
 * that drills into one module's lessons. The level is derived from the route
 * (see lib/course/navLevel.ts); only the back override lives here.
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
  const curriculumHref =
    courseSlug === "nextjs" ? NEXTJS_COURSE.href : CURRICULUM;
  const { visited } = useProgress();
  const reduceMotion = useReducedMotion();

  const [backToModules, setBackToModules] = useState(false);
  // Following any row navigates, which is the reader's own answer to "which
  // module am I in" — the override has served its purpose.
  useEffect(() => {
    setBackToModules(false);
  }, [pathname]);

  const view = resolveNavView({ stages: nav, pathname, backToModules });
  const viewKey = view.level === "module" ? view.navModule.slug : "modules";

  const scrollRef = useRef<HTMLElement | null>(null);
  const wantsFocus = useRef(false);

  /**
   * Back unmounts its own button, so focus has to be placed deliberately —
   * from a callback ref, which runs exactly when the row mounts. Neither an
   * effect keyed on the level nor AnimatePresence's onExitComplete works
   * here: with mode="wait" the incoming level has not mounted yet when
   * either fires, so the element to focus does not exist (verified in the
   * browser — focus stayed on <body>).
   */
  const allModulesRef = useCallback((el: HTMLAnchorElement | null) => {
    if (el && wantsFocus.current) {
      wantsFocus.current = false;
      el.focus();
    }
  }, []);

  // A fresh level starts at its own top; keeping the old offset lands the
  // reader mid-list in a list they have not seen.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [viewKey]);

  const panel = (
    <CourseNavPanel
      nav={nav}
      view={view}
      pathname={pathname}
      visited={visited}
      compact={compact}
      curriculumHref={curriculumHref}
      allModulesRef={allModulesRef}
      onBack={() => {
        // The back button unmounts with the level, so move focus deliberately.
        wantsFocus.current = true;
        setBackToModules(true);
      }}
    />
  );

  return (
    <nav
      ref={scrollRef}
      className={cn("flex-1 overflow-y-auto", className)}
      aria-label="Course"
    >
      {reduceMotion ? (
        panel
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewKey}
            initial={{
              opacity: 0,
              x: view.level === "module" ? SLIDE_PX : -SLIDE_PX,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: view.level === "module" ? -SLIDE_PX : SLIDE_PX,
            }}
            transition={SLIDE}
          >
            {panel}
          </motion.div>
        </AnimatePresence>
      )}
    </nav>
  );
}
