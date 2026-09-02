import type { CourseRegistryEntry } from "@/lib/courses/registry";
import { MODULES, allProblemSlugs } from "@/lib/course/manifest";

export const DSA_COURSE: CourseRegistryEntry = {
  slug: "dsa",
  title: "Data Structures & Algorithms",
  tagline:
    "Learn data structures and algorithms from first principles — interactive lessons, live sandboxes, and solve-first problems.",
  accent: "#1E293B",
  status: "available",
  href: "/courses/dsa",
  navLabel: "DSA",
  stats: [
    { label: "modules", value: String(MODULES.length) },
    { label: "problems", value: String(allProblemSlugs().length) },
  ],
};
