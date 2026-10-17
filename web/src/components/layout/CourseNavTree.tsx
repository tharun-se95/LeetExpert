"use client";

import { useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildCourseNav } from "@/lib/course/nav";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";
import { buildNextjsCourseNav } from "@/app/courses/nextjs/nav";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CURRICULUM } from "@/lib/landing/content";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";

/**
 * Shared course nav for the desktop drawer and mobile sheet:
 * A single-level unified tree showing stages, modules, and their filtered
 * lessons or practice items.
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

  const scrollRef = useRef<HTMLElement | null>(null);

  return (
    <nav
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]",
        className,
      )}
      aria-label="Course"
    >
      <CourseNavPanel
        nav={nav}
        pathname={pathname}
        visited={visited}
        compact={compact}
        curriculumHref={curriculumHref}
        onClose={onClose}
      />
    </nav>
  );
}
