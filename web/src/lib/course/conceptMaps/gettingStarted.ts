import type { MindMapNode } from "./types";

/**
 * Concept map for the Getting Started module. Hand-authored from the
 * module's 4-lesson structure (course/getting-started/*.md) — no
 * NotebookLM pass yet, since the curriculum-designer review (media-rollout
 * spec §2.5) ran on the pre-restructure 3-lesson list and only informed
 * the lesson-list decision, not a mind-map transcription.
 */
export const gettingStartedConceptMap: MindMapNode = {
  id: "getting-started",
  label: "Getting Started",
  children: [
    {
      id: "intro",
      label: "Course Introduction",
      children: [
        { id: "intro-goal", label: "Goal: mastery, not pattern recognition" },
        {
          id: "intro-promises",
          label: "Three promises",
          children: [
            { id: "intro-promises-mechanics", label: "Mechanics before use" },
            { id: "intro-promises-costs", label: "Costs come with reasons" },
            { id: "intro-promises-implement", label: "You implement everything, both languages" },
          ],
        },
        {
          id: "intro-expects",
          label: "What the course expects",
          children: [
            { id: "intro-expects-program", label: "You can already program" },
            { id: "intro-expects-attempt", label: "Attempt before reading solutions" },
            { id: "intro-expects-honest", label: "Answer quizzes honestly — ungraded, local only" },
          ],
        },
        { id: "intro-length", label: "24 modules, 5 stages, a project of months" },
      ],
    },
    {
      id: "lessons-work",
      label: "How Lessons & Problems Work",
      children: [
        {
          id: "lessons-work-concept-arc",
          label: "Concept lesson arc",
          children: [
            { id: "lessons-work-concept-motivation", label: "Motivation: what breaks without it" },
            { id: "lessons-work-concept-mechanics", label: "Mechanics: memory layout, visualized" },
            { id: "lessons-work-concept-costs", label: "Costs with reasoning, never a table to memorize" },
            { id: "lessons-work-concept-impl", label: "Implementation from scratch, Python + TypeScript" },
            { id: "lessons-work-concept-tradeoffs", label: "Trade-offs: when it wins, when it doesn't" },
            { id: "lessons-work-concept-quiz", label: "Quiz: a short check it stuck" },
          ],
        },
        {
          id: "lessons-work-problem-arc",
          label: "Problem lesson arc (solve-first)",
          children: [
            { id: "lessons-work-problem-statement", label: "Statement and constraints" },
            { id: "lessons-work-problem-attempt", label: "Your attempt" },
            { id: "lessons-work-problem-hints", label: "Progressive hints, one reveal at a time" },
            { id: "lessons-work-problem-brute", label: "Brute force and its cost" },
            { id: "lessons-work-problem-insight", label: "The key insight" },
            { id: "lessons-work-problem-optimal", label: "Optimal solution, then variants" },
          ],
        },
        { id: "lessons-work-blocks", label: "Interactive blocks: code tabs, complexity boxes, reveals, quizzes" },
      ],
    },
    {
      id: "writing-code",
      label: "Writing & Running Code",
      children: [
        { id: "writing-code-workspace", label: "Live in-browser editor, starter code pre-filled" },
        { id: "writing-code-language", label: "Python/TypeScript toggle, drafts saved separately per language" },
        {
          id: "writing-code-run",
          label: "Running code",
          children: [
            { id: "writing-code-run-python", label: "Python: one-time ~10MB runtime download, then cached" },
            { id: "writing-code-run-cases", label: "Runs against hidden test cases, including edge cases" },
          ],
        },
        {
          id: "writing-code-results",
          label: "Result tabs",
          children: [
            { id: "writing-code-results-tests", label: "Tests: pass/fail per case, got vs. expected" },
            { id: "writing-code-results-console", label: "Console: print()/console.log() output" },
            { id: "writing-code-results-insight", label: "Insight: target complexity vs. actual run" },
          ],
        },
        { id: "writing-code-coach", label: "Coach: diagnoses failing cases, supplements hints" },
        { id: "writing-code-reset", label: "Reset restores starter code for the current language only" },
      ],
    },
    {
      id: "roadmap",
      label: "The Roadmap",
      children: [
        { id: "roadmap-stage0", label: "Stage 0 — Foundations: How to Learn, Big O, Math for DSA" },
        { id: "roadmap-stage1", label: "Stage 1 — Linear structures: Arrays, Strings, Hash Tables, Linked Lists, Stacks, Queues" },
        { id: "roadmap-stage2", label: "Stage 2 — Techniques on linear data: Two Pointers, Sliding Window, Prefix Sum, Binary Search, Sorting, Matrix" },
        { id: "roadmap-stage3", label: "Stage 3 — Recursive & hierarchical: Recursion, Binary Trees, BST, Heaps, Tries" },
        { id: "roadmap-stage4", label: "Stage 4 — Global reasoning: Intervals, Greedy, Graphs, Dynamic Programming" },
        { id: "roadmap-order", label: "Order is dependency, not difficulty — in order or jump to a stage's gap" },
      ],
    },
  ],
};
