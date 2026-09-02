import type { CourseRegistryEntry } from "@/lib/courses/registry";
import { totalLessonCount, MODULES } from "./manifest";

/**
 * `available`: all 62 lessons across 8 modules are fully authored, and
 * all 54 drill-bearing lessons carry a real, working practice exercise
 * (a "Try it" prompt ending in a reveal-hidden worked answer, plus a
 * Scratchpad workspace for sandbox-format lessons) — see
 * docs/superpowers/plans/2026-09-02-nextjs-course-tasks.md, Phases 2-4
 * (content) and Phase 3 (practice mechanism), both complete.
 */
export const NEXTJS_COURSE: CourseRegistryEntry = {
  slug: "nextjs",
  title: "Next.js Interview Prep",
  tagline:
    "Essential and advanced Next.js — from the App Router mental model to system design, taught the way real interviews actually test it.",
  accent: "#4F46E5",
  status: "available",
  href: "/courses/nextjs",
  navLabel: "Next.js",
  stats: [
    { label: "modules", value: String(MODULES.length) },
    { label: "lessons", value: String(totalLessonCount()) },
  ],
};
