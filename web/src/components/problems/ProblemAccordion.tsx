"use client";

import { useState, useMemo } from "react";
import {
  CaretDown,
  ArrowRight,
  ArrowLeft,
  Clock,
  Cpu,
  Check,
} from "@phosphor-icons/react";
import { Markdown } from "@/components/md/Markdown";
import { BlurReveal } from "@/components/md/BlurReveal";
import { cn } from "@/lib/utils";
import type { TabBlock } from "@/lib/content/highlightBlocks";
import type { Difficulty } from "@/lib/course/problemDifficulty";

export type ProblemAccordionSection = "description" | "explanation" | "solution";

interface SectionMeta {
  id: ProblemAccordionSection;
  step: string;
  title: string;
  hint: string;
}

const SECTIONS: readonly SectionMeta[] = [
  {
    id: "description",
    step: "01",
    title: "Description",
    hint: "Statement, examples & constraints",
  },
  {
    id: "explanation",
    step: "02",
    title: "Explanation",
    hint: "Intuition, key patterns & hints",
  },
  {
    id: "solution",
    step: "03",
    title: "Solution",
    hint: "Python & TypeScript reference",
  },
];

interface ProblemAccordionProps {
  descriptionSource: string;
  explanationSource: string;
  solutionSource: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  activeSection?: ProblemAccordionSection | null;
  onSectionChange?: (section: ProblemAccordionSection | null) => void;
  className?: string;
  /** Rich problem metadata for enhanced description view */
  difficulty?: Difficulty;
  moduleTitle?: string;
  complexity?: { time?: string; space?: string } | null;
  isSolved?: boolean;
}

/**
 * Strips duplicate leading headings like `## Problem` or `## The Problem`
 * so the accordion's `01 DESCRIPTION` header isn't immediately followed
 * by a redundant duplicate heading.
 */
export function cleanDescriptionSource(source: string): string {
  return source.replace(/^\s*#{1,3}\s+(?:The\s+)?Problem\b[^\n]*\n*/i, "").trim();
}

/**
 * Strips duplicate leading headings like `## Explanation` or `## Intuition & Approach`.
 */
export function cleanExplanationSource(source: string): string {
  return source
    .replace(/^\s*#{1,3}\s+(?:Explanation|Intuition\s*(?:&|and)\s*Approach)\b[^\n]*\n*/i, "")
    .trim();
}

/**
 * Strips duplicate leading headings like `## Solution` or `## Solutions`
 * (created when slicing afterSandbox on `## Solution`).
 */
export function cleanSolutionSource(source: string): string {
  return source.replace(/^\s*#{1,3}\s+Solutions?\b[^\n]*\n*/i, "").trim();
}

/**
 * Clean, non-boxlike editorial accordion for problem workspace.
 * Displays Description, Explanation, and Solution with refined hairline dividers,
 * open typography, and single-section expansion ("show one at a time").
 */
export function ProblemAccordion({
  descriptionSource,
  explanationSource,
  solutionSource,
  highlightedBlocks,
  highlightedTabs,
  activeSection: controlledSection,
  onSectionChange,
  className,
  difficulty,
  moduleTitle,
  complexity,
  isSolved,
}: ProblemAccordionProps) {
  const [internalSection, setInternalSection] =
    useState<ProblemAccordionSection | null>("description");

  const cleanedDescription = useMemo(
    () => cleanDescriptionSource(descriptionSource),
    [descriptionSource],
  );
  const cleanedExplanation = useMemo(
    () => cleanExplanationSource(explanationSource),
    [explanationSource],
  );
  const cleanedSolution = useMemo(
    () => cleanSolutionSource(solutionSource),
    [solutionSource],
  );

  const currentSection =
    controlledSection !== undefined ? controlledSection : internalSection;

  const handleToggle = (section: ProblemAccordionSection) => {
    const next = currentSection === section ? null : section;
    if (onSectionChange) {
      onSectionChange(next);
    } else {
      setInternalSection(next);
    }
  };

  return (
    <div className={cn("divide-y divide-border/60", className)}>
      {SECTIONS.map((item) => {
        const isOpen = currentSection === item.id;

        return (
          <div key={item.id} className="transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]">
            <button
              type="button"
              id={`accordion-trigger-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => handleToggle(item.id)}
              className={cn(
                "group flex w-full min-h-12 items-center justify-between py-3.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
                isOpen
                  ? "text-foreground"
                  : "text-foreground/75 hover:text-foreground",
              )}
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span
                  className={cn(
                    "font-mono text-xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
                    isOpen
                      ? "text-mark font-bold"
                      : "text-muted font-medium group-hover:text-foreground",
                  )}
                >
                  {item.step}
                </span>
                <span className="font-display text-sm font-bold tracking-tight uppercase sm:text-base">
                  {item.title}
                </span>
                <span className="hidden font-mono text-xs text-muted/70 sm:inline truncate">
                  {"// "}{item.hint}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-3">
                <span className="font-mono text-xs text-muted/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:text-foreground hidden xs:inline">
                  {isOpen ? "Close" : "Open"}
                </span>
                <CaretDown
                  size={14}
                  weight="bold"
                  className={cn(
                    "transition-transform duration-[var(--dur-fast)] ease-[var(--ease)]",
                    isOpen ? "rotate-180 text-foreground" : "rotate-0 text-muted/70",
                  )}
                  aria-hidden
                />
              </div>
            </button>

            {isOpen ? (
              <div
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-trigger-${item.id}`}
                className="pb-8 pt-2"
              >
                <div className="problem-prose">
                  {item.id === "description" ? (
                    <>
                      {difficulty || complexity || moduleTitle ? (
                        <div className="mb-6 flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-border/40 pb-3.5 text-xs">
                          {difficulty ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 font-mono font-bold text-xs",
                                difficulty === "Easy"
                                  ? "text-good"
                                  : difficulty === "Medium"
                                    ? "text-warn"
                                    : "text-bad",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                              {difficulty}
                            </span>
                          ) : null}

                          {moduleTitle ? (
                            <>
                              <span className="text-border select-none" aria-hidden>/</span>
                              <span className="font-mono text-muted text-xs">
                                {moduleTitle}
                              </span>
                            </>
                          ) : null}

                          {complexity?.time ? (
                            <>
                              <span className="text-border select-none" aria-hidden>•</span>
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/85">
                                <Clock size={13} className="text-accent" aria-hidden />
                                <span className="text-muted">Target:</span>
                                <span className="font-bold">{complexity.time}</span>
                              </span>
                            </>
                          ) : null}

                          {complexity?.space ? (
                            <>
                              <span className="text-border select-none" aria-hidden>•</span>
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/85">
                                <Cpu size={13} className="text-mark" aria-hidden />
                                <span className="text-muted">Aux Space:</span>
                                <span className="font-bold">{complexity.space}</span>
                              </span>
                            </>
                          ) : null}

                          {isSolved ? (
                            <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-good text-xs">
                              <Check size={12} weight="bold" aria-hidden />
                              Solved
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <Markdown
                        source={cleanedDescription}
                        highlightedBlocks={highlightedBlocks}
                        highlightedTabs={highlightedTabs}
                        unwrapReveal={true}
                      />
                    </>
                  ) : item.id === "explanation" ? (
                    cleanedExplanation ? (
                      <Markdown
                        source={cleanedExplanation}
                        highlightedBlocks={highlightedBlocks}
                        highlightedTabs={highlightedTabs}
                        unwrapReveal={true}
                      />
                    ) : (
                      <p className="text-sm text-muted">
                        This problem’s explanation is integrated into the solution section.
                      </p>
                    )
                  ) : cleanedSolution ? (
                    cleanedSolution.includes("reveal ") || cleanedSolution.includes("language-reveal") ? (
                      <Markdown
                        source={cleanedSolution}
                        highlightedBlocks={highlightedBlocks}
                        highlightedTabs={highlightedTabs}
                        unwrapReveal={true}
                      />
                    ) : (
                      <BlurReveal label="Reference Solution" type="solution">
                        <Markdown
                          source={cleanedSolution}
                          highlightedBlocks={highlightedBlocks}
                          highlightedTabs={highlightedTabs}
                          unwrapReveal={true}
                        />
                      </BlurReveal>
                    )
                  ) : (
                    <p className="text-sm text-muted">
                      This problem’s solution walkthrough lives under Explanation.
                    </p>
                  )}
                </div>

                {/* Refined inline text navigation */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4 text-xs font-mono">
                  {item.id === "description" ? (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-muted/70">Need intuition or approach?</span>
                      <button
                        type="button"
                        onClick={() => handleToggle("explanation")}
                        className="group inline-flex items-center gap-1.5 text-accent font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-mark touch-manipulation"
                      >
                        <span>Continue to Explanation</span>
                        <ArrowRight
                          size={12}
                          weight="bold"
                          className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </div>
                  ) : item.id === "explanation" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggle("description")}
                        className="inline-flex items-center gap-1 text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground touch-manipulation"
                      >
                        <ArrowLeft size={12} weight="bold" aria-hidden />
                        <span>Description</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle("solution")}
                        className="group inline-flex items-center gap-1.5 text-accent font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-mark touch-manipulation"
                      >
                        <span>Continue to Solution</span>
                        <ArrowRight
                          size={12}
                          weight="bold"
                          className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggle("explanation")}
                        className="inline-flex items-center gap-1 text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground touch-manipulation"
                      >
                        <ArrowLeft size={12} weight="bold" aria-hidden />
                        <span>Explanation</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle("description")}
                        className="inline-flex items-center gap-1 text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground touch-manipulation"
                      >
                        <span>Back to Description</span>
                        <ArrowRight size={12} weight="bold" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
