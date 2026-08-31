import { MODULES, STAGES, modulesByStage } from "@/lib/course/manifest";
import { lessonHref, moduleHref, problemHref } from "@/lib/course/nav";

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

export function stageSummaries() {
  return STAGES.map((stage) => {
    const mods = modulesByStage(stage.number);
    const lessonCount = mods.reduce((n, m) => n + m.lessons.length, 0);
    return {
      ...stage,
      moduleCount: mods.length,
      lessonCount,
    };
  });
}

/** First three lessons — the on-ramp. */
export const START_HERE = [
  {
    title: "Course Introduction",
    href: lessonHref("getting-started", "course-introduction"),
  },
  {
    title: "How Lessons & Problems Work",
    href: lessonHref("getting-started", "how-lessons-work"),
  },
  {
    title: "The Roadmap",
    href: lessonHref("getting-started", "course-roadmap"),
  },
] as const;

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
export const BIG_O = moduleHref("big-o");
export const FIRST_PROBLEM = problemHref("two-sum");
export const GITHUB_REPO = "https://github.com/tharun-se95/dsa-handbook";

/** Honest early-bird framing — no fake countdown. */
export const EARLY_BIRD_LINE =
  "Free for early birds · ends when the paid launch ships";

export const LANDING_SANDBOX = `{
  "id": "landing-two-sum-teaser",
  "fn": { "python": "two_sum", "javascript": "twoSum" },
  "check": "return",
  "starter": {
    "python": "def two_sum(nums, target):\\n    # Return the two indices.\\n    pass\\n",
    "javascript": "function twoSum(nums, target) {\\n  // Return the two indices.\\n}\\n"
  },
  "cases": [
    { "args": [[2,7,11,15],9], "expect": [0,1] },
    { "args": [[3,2,4],6], "expect": [1,2] }
  ]
}`;

export const LANDING_COMPLEXITY = `{
  "time": "O(n)",
  "space": "O(n)",
  "why": "One pass: each value is looked up and inserted once in a hash map.",
  "operations": [
    { "name": "hash lookup", "time": "O(1) avg", "why": "Partner check before insert" },
    { "name": "hash insert", "time": "O(1) avg", "why": "Store value → index" }
  ]
}`;
