import type { CourseRegistryEntry } from "@/lib/courses/registry";
import { totalLessonCount, MODULES } from "./manifest";

/**
 * Content status: all 62 lessons across 8 modules are fully authored, and
 * all 54 drill-bearing lessons carry a real, working practice exercise
 * (a "Try it" prompt ending in a reveal-hidden worked answer, plus a
 * Scratchpad workspace for sandbox-format lessons) — see
 * docs/superpowers/plans/2026-09-02-nextjs-course-tasks.md, Phases 2-4
 * (content) and Phase 3 (practice mechanism), both complete.
 *
 * `status` is deliberately "coming-soon" — the course itself is DISABLED
 * for now (product decision, not a content gap): the catalog card renders
 * non-clickable with a "coming soon" badge (see app/page.tsx), the header's
 * course-mode nav falls back to DSA's Lessons/Practice instead of a
 * Next.js "Curriculum" link (Header.tsx), and every route under
 * /courses/nextjs 404s via app/courses/nextjs/layout.tsx regardless of
 * this flag, since a status change alone doesn't stop direct navigation.
 * To re-enable: flip this back to "available" and delete that layout file.
 */
export const NEXTJS_COURSE: CourseRegistryEntry = {
  slug: "nextjs",
  title: "Next.js Interview Prep",
  tagline:
    "Essential and advanced Next.js — from the App Router mental model to system design, taught the way real interviews actually test it.",
  accent: "#4F46E5",
  status: "coming-soon",
  href: "/courses/nextjs",
  navLabel: "Next.js",
  stats: [
    { label: "modules", value: String(MODULES.length) },
    { label: "lessons", value: String(totalLessonCount()) },
  ],
};
