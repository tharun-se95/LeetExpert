/**
 * The one contract every course must satisfy to appear in the catalog,
 * top-nav switcher, and course-prefix routing resolvers (theming,
 * progress namespacing). Nothing else about a course's internals is
 * shared — see docs/superpowers/specs/2026-08-31-multi-course-platform-design.md.
 */
export interface CourseRegistryEntry {
  slug: string;
  title: string;
  tagline: string;
  /** Single accent hex for the catalog card + nav chip. */
  accent: string;
  status: "available" | "coming-soon";
  href: string;
  stats?: { label: string; value: string }[];
}

import { DSA_COURSE } from "@/app/courses/dsa/registry";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";

/**
 * Static, compile-time registration — not a dynamic plugin loader. This is
 * the one file a new course must add itself to; everything else about a
 * course lives isolated under its own `app/courses/<slug>/` folder.
 */
export const COURSES: CourseRegistryEntry[] = [DSA_COURSE, NEXTJS_COURSE];
