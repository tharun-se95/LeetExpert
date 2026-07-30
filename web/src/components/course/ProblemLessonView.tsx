"use client";

import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";
import type { Crumb } from "@/components/layout/Breadcrumbs";
import type { LoadedLesson } from "@/lib/course/load";
import type { SandboxExtraction } from "@/lib/content/extractSandboxFence";

interface NeighborLink {
  href: string;
  title: string;
}

interface ProblemLessonViewProps {
  /** `sandbox` narrowed non-null by the caller — see the route */
  lesson: LoadedLesson & { sandbox: SandboxExtraction };
  breadcrumbs: Crumb[];
  eyebrow: string;
  prev: NeighborLink | null;
  next: NeighborLink | null;
}

/**
 * Course-route entry for problem lessons. Same IDE shell as `/problems/[slug]`;
 * breadcrumbs supply the back link into the module.
 */
export function ProblemLessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  prev,
  next,
}: ProblemLessonViewProps) {
  const back = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <ProblemWorkspace
      lesson={lesson}
      eyebrow={eyebrow}
      backHref={back?.href ?? "/"}
      backLabel={back?.label ?? "Course"}
      prev={prev}
      next={next}
    />
  );
}
