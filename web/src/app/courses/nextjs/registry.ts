import type { CourseRegistryEntry } from "@/lib/courses/registry";
import { totalLessonCount, MODULES } from "./manifest";

/**
 * `coming-soon`, not `available`: the manifest (62 lessons across 8
 * modules) exists, but no route tree, lesson content, or practice-format
 * components have been built yet — see
 * docs/superpowers/plans/2026-09-02-nextjs-course-tasks.md Phases 2-4.
 * Flip to `available` once there's real content behind at least the
 * catalog-facing routes, not just a manifest.
 */
export const NEXTJS_COURSE: CourseRegistryEntry = {
  slug: "nextjs",
  title: "Next.js Interview Prep",
  tagline:
    "Essential and advanced Next.js — from the App Router mental model to system design, taught the way real interviews actually test it.",
  accent: "#4F46E5",
  status: "coming-soon",
  href: "/courses/nextjs",
  stats: [
    { label: "modules", value: String(MODULES.length) },
    { label: "lessons", value: String(totalLessonCount()) },
  ],
};
