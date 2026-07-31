"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CaretLeft,
} from "@phosphor-icons/react";
import { Markdown } from "@/components/md/Markdown";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { useProgress } from "@/components/providers/ProgressProvider";
import { splitProblemTabs } from "@/lib/content/splitProblemTabs";
import { lessonId } from "@/lib/course/nav";
import { cn } from "@/lib/utils";
import type { LoadedLesson } from "@/lib/course/load";
import type { SandboxExtraction } from "@/lib/content/extractSandboxFence";
import type { TabBlock } from "@/lib/content/highlightBlocks";

interface NeighborLink {
  href: string;
  title: string;
}

type LeftTab = "description" | "explanation" | "solution";

const TABS: { id: LeftTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "explanation", label: "Explanation" },
  { id: "solution", label: "Solution" },
];

/** Matches Tailwind `lg` — side-by-side IDE needs this width. */
const IDE_WIDE_MQ = "(min-width: 1024px)";

interface ProblemWorkspaceProps {
  lesson: LoadedLesson & { sandbox: SandboxExtraction };
  eyebrow: string;
  prev: NeighborLink | null;
  next: NeighborLink | null;
  /** Hub or module link for the compact back control */
  backHref: string;
  backLabel?: string;
}

/**
 * LeetCode-style IDE shell for problem lessons and `/problems/[slug]`.
 * One Sandbox instance for all viewports — layout axis flips at `lg`.
 */
export function ProblemWorkspace({
  lesson,
  eyebrow,
  prev,
  next,
  backHref,
  backLabel = "Problems",
}: ProblemWorkspaceProps) {
  const { solved, markSolved } = useProgress();
  const id = lessonId(lesson.moduleSlug, lesson.lessonSlug);
  const isSolved = solved.has(id);
  const [tab, setTab] = useState<LeftTab>("description");
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(IDE_WIDE_MQ);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { explanation, solution } = useMemo(
    () => splitProblemTabs(lesson.sandbox.afterSandbox),
    [lesson.sandbox.afterSandbox],
  );

  const tabSource =
    tab === "description"
      ? lesson.sandbox.beforeSandbox
      : tab === "explanation"
        ? explanation
        : solution;

  const leftPane = (
    <LeftPane
      tab={tab}
      onTabChange={setTab}
      source={tabSource}
      highlightedBlocks={lesson.highlightedBlocks}
      highlightedTabs={lesson.highlightedTabs}
    />
  );

  const sandbox = (
    <Sandbox
      source={lesson.sandbox.sandboxSource}
      onSolved={() => markSolved(id)}
      variant="ide"
    />
  );

  return (
    // Fills AppShell's main pane (`overflow-hidden` on /problems/[slug]).
    // Panes scroll internally — no document scroll.
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 sm:px-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-foreground"
        >
          <CaretLeft size={14} weight="bold" aria-hidden />
          {backLabel}
        </Link>
        <span className="hidden text-border sm:inline" aria-hidden>
          /
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-sm font-bold tracking-tight uppercase sm:text-base">
            {lesson.title}
          </h1>
          <p className="truncate text-[0.7rem] text-muted">{eyebrow}</p>
        </div>
        {isSolved ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-good/15 px-2 py-0.5 text-[0.7rem] font-medium text-good">
            <Check size={11} strokeWidth={3} aria-hidden />
            Solved
          </span>
        ) : (
          <span className="hidden shrink-0 rounded-md border border-border px-2 py-0.5 text-[0.7rem] text-muted sm:inline">
            Problem
          </span>
        )}
        <nav className="flex shrink-0 items-center gap-0.5" aria-label="Problem navigation">
          {prev ? (
            <Link
              href={prev.href}
              title={prev.title}
              aria-label={`Previous: ${prev.title}`}
              className="rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
          ) : (
            <span className="p-1.5 text-border" aria-hidden>
              <ArrowLeft size={16} />
            </span>
          )}
          {next ? (
            <Link
              href={next.href}
              title={next.title}
              aria-label={`Next: ${next.title}`}
              className="rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              <ArrowRight size={16} weight="bold" />
            </Link>
          ) : (
            <span className="p-1.5 text-border" aria-hidden>
              <ArrowRight size={16} />
            </span>
          )}
        </nav>
      </header>

      {/*
        Single Sandbox for all breakpoints. Stacked (vertical split) below lg;
        side-by-side (horizontal) from lg. Children stay mounted across the flip.
      */}
      <PanelSplit
        orientation={wide ? "horizontal" : "vertical"}
        initialPrimary={wide ? 0.42 : 0.38}
        minPrimary={wide ? 0.28 : 0.22}
        maxPrimary={wide ? 0.58 : 0.55}
        primary={leftPane}
        secondary={sandbox}
      />
    </div>
  );
}

function LeftPane({
  tab,
  onTabChange,
  source,
  highlightedBlocks,
  highlightedTabs,
}: {
  tab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div
        role="tablist"
        aria-label="Problem content"
        className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "h-full px-3.5 text-[0.75rem] font-medium transition-colors",
              tab === t.id
                ? "bg-pop text-on-pop"
                : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {source.trim() ? (
          <Markdown
            source={source}
            highlightedBlocks={highlightedBlocks}
            highlightedTabs={highlightedTabs}
          />
        ) : (
          <p className="text-sm text-muted">
            {tab === "solution"
              ? "This problem’s solution walkthrough lives under Explanation."
              : "Nothing here yet."}
          </p>
        )}
      </div>
    </div>
  );
}
