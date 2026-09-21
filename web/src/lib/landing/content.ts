import { MODULES, STAGES, modulesByStage } from "@/lib/course/manifest";
import { lessonHref, moduleHref } from "@/lib/course/nav";
import type { StageCard } from "@/lib/landing/story";

/**
 * The landing page's "What's inside" cards: one per real course stage, counted
 * from the manifest and linking to that stage's section on the curriculum hub.
 */
export function stageCards(): StageCard[] {
  return STAGES.map((stage) => {
    const modules = modulesByStage(stage.number);
    return {
      number: stage.number,
      title: stage.title,
      description: stage.description,
      modules: modules.length,
      lessons: modules.reduce((n, m) => n + m.lessons.length, 0),
      href: `${CURRICULUM}#stage-${stage.number}`,
    };
  });
}

export function curriculumStats() {
  const lessons = MODULES.flatMap((m) => m.lessons);
  const problems = lessons.filter((l) => l.type === "problem").length;
  const concepts = lessons.length - problems;
  const availableModules = MODULES.filter((m) => m.status === "available").length;
  return {
    modules: MODULES.length,
    stages: STAGES.length,
    lessons: lessons.length,
    problems,
    concepts,
    availableModules,
  };
}

export const TOPIC_CHIPS = [
  { label: "Arrays", href: moduleHref("arrays") },
  { label: "Hash Tables", href: moduleHref("hash-tables") },
  { label: "Trees", href: moduleHref("binary-trees") },
  { label: "Graphs", href: moduleHref("graphs") },
  { label: "DP", href: moduleHref("dynamic-programming") },
  { label: "Two Pointers", href: moduleHref("two-pointers") },
  { label: "Binary Search", href: moduleHref("binary-search") },
  { label: "Recursion", href: moduleHref("recursion-backtracking") },
] as const;

export const FIRST_LESSON = lessonHref("getting-started", "course-introduction");
export const CURRICULUM = "/courses/dsa";
export const PRACTICE = "/courses/dsa/problems";
