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
 * (see lib/course/navLevel.ts); only the back override lives here. The
 * desktop drawer passes onClose for the panel's pinned header row; the mobile
 * sheet, which has its own header, does not.
 */
export function CourseNavTree({
  compact = true,
  className,
  onClose,
}: {
  compact?: boolean;
  className?: string;
  onClose?: () => void;
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
  const [returnSlug, setReturnSlug] = useState<string | null>(null);
  // Following any row navigates, which is the reader's own answer to "which
  // module am I in" — the override has served its purpose.
  useEffect(() => {
    setBackToModules(false);
    setReturnSlug(null);
  }, [pathname]);

  const view = resolveNavView({ stages: nav, pathname, backToModules });
  const viewKey = view.level === "module" ? view.navModule.slug : "modules";

  const scrollRef = useRef<HTMLElement | null>(null);
  const wantsFocus = useRef(false);

  /**
   * The drawer's pinned row stays flat paper until rows scroll under it —
   * translucent at rest, it read as a lighter strip against the rail. A sentinel
   * at the top of the nav, observed against the nav, rather than a scroll
   * listener: a drawer restored mid-scroll fires no scroll event. Only the
   * desktop drawer has the row (onClose), so only it observes.
   */
  const topRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pinned = Boolean(onClose);
  useEffect(() => {
    const sentinel = topRef.current;
    if (!pinned || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!(entry?.isIntersecting ?? true)),
      { root: scrollRef.current },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pinned]);

  /**
   * Back unmounts its own button, so focus has to be placed deliberately —
   * from a callback ref, which runs exactly when the row mounts. Neither an
   * effect keyed on the level nor AnimatePresence's onExitComplete works
   * here: with mode="wait" the incoming level has not mounted yet when
   * either fires, so the element to focus does not exist (verified in the
   * browser — focus stayed on <body>). Focusing the row also scrolls it into
   * view, which is what makes the section-named back row truthful.
   */
  const returnRowRef = useCallback((el: HTMLAnchorElement | null) => {
    if (el && wantsFocus.current) {
      wantsFocus.current = false;
      el.focus();
    }
  }, []);

  // A fresh level starts at its own top; keeping the old offset lands the
  // reader mid-list in a list they have not seen.
  useEffect(() => {
    if (wantsFocus.current) return;
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
      returnSlug={returnSlug}
      returnRowRef={returnRowRef}
      onClose={onClose}
      scrolled={scrolled}
      onBack={() => {
        // The back button unmounts with the level, so move focus deliberately.
        wantsFocus.current = true;
        setReturnSlug(view.level === "module" ? view.navModule.slug : null);
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
      {/* 1px tall and pulled back by -mb-px, so the list does not move. */}
      {pinned ? <div ref={topRef} aria-hidden className="-mb-px h-px" /> : null}
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
