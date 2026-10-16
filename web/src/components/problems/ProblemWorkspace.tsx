"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CaretLeft,
  FileText,
  PencilSimple,
  Question,
  Sparkle,
  type Icon,
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
import { extractComplexityFromMarkdown } from "@/lib/insight/extractComplexity";
import { CoachProvider, useCoach } from "@/components/coach/CoachProvider";
import { CoachPanel } from "@/components/coach/CoachPanel";
import { IdeWithCoach } from "@/components/coach/IdeWithCoach";
import { ProblemAccordion } from "@/components/problems/ProblemAccordion";
import { PROBLEM_DIFFICULTY, type Difficulty } from "@/lib/course/problemDifficulty";

interface NeighborLink {
  href: string;
  title: string;
}

type ContentTab = "problem" | "quiz";
type WorkspaceTab = ContentTab | "code" | "coach";

/**
 * One icon per tab, chosen to be distinct from its neighbours in the SAME
 * bar rather than globally unique across the app.
 */
const TAB_ICON: Record<WorkspaceTab, Icon> = {
  problem: FileText,
  quiz: Question,
  code: PencilSimple,
  coach: Sparkle,
};

const CONTENT_TABS: { id: ContentTab; label: string }[] = [
  { id: "problem", label: "Problem" },
  { id: "quiz", label: "Quiz" },
];

/** Mobile: Problem sits first, Code (IDE), Coach, then Quiz. */
const MOBILE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "problem", label: "Problem" },
  { id: "code", label: "Code" },
  { id: "coach", label: "Coach" },
  { id: "quiz", label: "Quiz" },
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
  /** Hint reveal labels only — bodies stay on the server corpus. */
  hintLabels: string[];
}

/**
 * LeetCode-style IDE shell for problem lessons and `/problems/[slug]`.
 * Desktop (`lg+`): problem accordion pane + Sandbox side-by-side.
 * Mobile: Problem (Accordion) | Code | Coach | Quiz.
 */
export function ProblemWorkspace({
  lesson,
  eyebrow,
  prev,
  next,
  backHref,
  backLabel = "Problems",
  hintLabels,
}: ProblemWorkspaceProps) {
  const { solved, markSolved } = useProgress();
  const id = lessonId(lesson.moduleSlug, lesson.lessonSlug);
  const isSolved = solved.has(id);
  const [tab, setTab] = useState<WorkspaceTab>("problem");
  const [wide, setWide] = useState(false);
  const tabsId = useId();

  useEffect(() => {
    const mq = window.matchMedia(IDE_WIDE_MQ);
    const sync = () => {
      const nextWide = mq.matches;
      setWide(nextWide);
      // Desktop has no Code tab — fall back so the left pane stays valid.
      if (nextWide) {
        setTab((t) => (t === "code" || t === "coach" ? "problem" : t));
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { explanation, solution, quiz } = useMemo(
    () => splitProblemTabs(lesson.sandbox.afterSandbox),
    [lesson.sandbox.afterSandbox],
  );

  const sandboxId = useMemo(() => {
    try {
      const spec = JSON.parse(lesson.sandbox.sandboxSource) as { id?: unknown };
      return typeof spec.id === "string" ? spec.id : lesson.lessonSlug;
    } catch {
      return lesson.lessonSlug;
    }
  }, [lesson.sandbox.sandboxSource, lesson.lessonSlug]);

  const extractedComplexity = useMemo(
    () => extractComplexityFromMarkdown(lesson.markdown),
    [lesson.markdown],
  );

  const difficulty = PROBLEM_DIFFICULTY[lesson.lessonSlug];

  const contentTab: ContentTab =
    tab === "code" || tab === "coach" ? "problem" : tab;

  const activeContentTabs = useMemo(() => {
    return quiz.trim()
      ? CONTENT_TABS
      : CONTENT_TABS.filter((t) => t.id !== "quiz");
  }, [quiz]);

  const activeMobileTabs = useMemo(() => {
    return quiz.trim()
      ? MOBILE_TABS
      : MOBILE_TABS.filter((t) => t.id !== "quiz");
  }, [quiz]);

  const sandbox = (
    <Sandbox
      source={lesson.sandbox.sandboxSource}
      onSolved={() => markSolved(id)}
      variant="ide"
      syncDraft
      moduleSlug={lesson.moduleSlug}
      extractedComplexity={extractedComplexity}
    />
  );

  return (
    // Fills AppShell's main pane (`overflow-hidden` on /problems/[slug]).
    // Panes scroll internally — no document scroll.
    <CoachProvider sandboxId={sandboxId} hintLabels={hintLabels}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/*
          No paper of its own, like the root above: both are transparent over
          the app's desk, so the app header, this band and the drawer
          read as one sheet. A solid band here read as a second surface under
          the header. The IDE below stays solid.
        */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
          <Link
            href={backHref}
            className="inline-flex min-h-11 touch-manipulation items-center gap-1 rounded-[length:var(--radius-md)] px-2 text-xs text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-surface hover:text-foreground motion-reduce:transition-none"
          >
            <CaretLeft size={14} weight="bold" aria-hidden />
            <span className="max-w-[5.5rem] truncate sm:max-w-none">
              {backLabel}
            </span>
          </Link>
          <span
            className="hidden h-6 w-px shrink-0 bg-border sm:block"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-sm font-bold tracking-tight uppercase sm:text-base">
              {lesson.title}
            </h1>
            <p className="truncate text-[0.7rem] text-muted">{eyebrow}</p>
          </div>
          {isSolved ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-[length:var(--radius-md)] bg-good/15 px-2 py-0.5 text-[0.7rem] font-medium text-good">
              <Check size={11} strokeWidth={3} aria-hidden />
              Solved
            </span>
          ) : null}
          <span
            className="hidden h-6 w-px shrink-0 bg-border sm:block"
            aria-hidden
          />
          <nav
            className="flex shrink-0 items-center"
            aria-label="Problem navigation"
          >
            {prev ? (
              <Link
                href={prev.href}
                title={prev.title}
                aria-label={`Previous: ${prev.title}`}
                className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-[length:var(--radius-md)] text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-surface hover:text-foreground motion-reduce:transition-none"
              >
                <ArrowLeft size={16} weight="bold" />
              </Link>
            ) : (
              <span
                className="inline-flex h-11 w-11 items-center justify-center text-border"
                aria-hidden
              >
                <ArrowLeft size={16} />
              </span>
            )}
            {next ? (
              <Link
                href={next.href}
                title={next.title}
                aria-label={`Next: ${next.title}`}
                className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-[length:var(--radius-md)] text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-surface hover:text-foreground motion-reduce:transition-none"
              >
                <ArrowRight size={16} weight="bold" />
              </Link>
            ) : (
              <span
                className="inline-flex h-11 w-11 items-center justify-center text-border"
                aria-hidden
              >
                <ArrowRight size={16} />
              </span>
            )}
          </nav>
        </header>

        {wide ? (
          /*
          Desktop: problem accordion pane + Sandbox side-by-side.
          The row is marked so the coach can read its width to choose column
          or floating (IdeWithCoach).
        */
          <div data-problem-workspace className="flex min-h-0 min-w-0 flex-1">
            <PanelSplit
              orientation="horizontal"
              initialPrimary={0.5}
              minPrimary={0.28}
              maxPrimary={0.58}
              primaryClassName="problem-description-pane"
              primary={
                <LeftPane
                  tab={contentTab}
                  onTabChange={setTab}
                  tabs={activeContentTabs}
                  descriptionSource={lesson.sandbox.beforeSandbox}
                  explanationSource={explanation}
                  solutionSource={solution}
                  quizSource={quiz}
                  highlightedBlocks={lesson.highlightedBlocks}
                  highlightedTabs={lesson.highlightedTabs}
                  tabsId={tabsId}
                  difficulty={difficulty}
                  moduleTitle={eyebrow}
                  complexity={extractedComplexity}
                  isSolved={isSolved}
                />
              }
              secondary={<IdeWithCoach sandbox={sandbox} />}
            />
          </div>
        ) : (
          <MobileWorkspace
            tab={tab}
            onTabChange={setTab}
            tabs={activeMobileTabs}
            descriptionSource={lesson.sandbox.beforeSandbox}
            explanationSource={explanation}
            solutionSource={solution}
            quizSource={quiz}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
            tabsId={tabsId}
            sandbox={sandbox}
            difficulty={difficulty}
            moduleTitle={eyebrow}
            complexity={extractedComplexity}
            isSolved={isSolved}
          />
        )}
      </div>
    </CoachProvider>
  );
}

function MobileWorkspace({
  tab,
  onTabChange,
  tabs,
  descriptionSource,
  explanationSource,
  solutionSource,
  quizSource,
  highlightedBlocks,
  highlightedTabs,
  tabsId,
  sandbox,
  difficulty,
  moduleTitle,
  complexity,
  isSolved,
}: {
  tab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  tabs: readonly { id: WorkspaceTab; label: string }[];
  descriptionSource: string;
  explanationSource: string;
  solutionSource: string;
  quizSource: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  tabsId: string;
  sandbox: ReactNode;
  difficulty?: Difficulty;
  moduleTitle?: string;
  complexity?: { time?: string; space?: string } | null;
  isSolved?: boolean;
}) {
  const panelId = `${tabsId}-panel`;
  const showCode = tab === "code";
  const showCoach = tab === "coach";
  const showArticle = !showCode && !showCoach;
  const { unread, mobileCoachTick } = useCoach();

  useEffect(() => {
    if (mobileCoachTick > 0) onTabChange("coach");
  }, [mobileCoachTick, onTabChange]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-elevated">
      <TabList
        tabs={tabs}
        active={tab}
        onChange={onTabChange}
        tabsId={tabsId}
        label="Problem workspace"
        panelId={panelId}
        className="h-11"
        badgeId={unread ? "coach" : null}
      />
      {showArticle ? (
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabsId}-tab-${tab}`}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          {tab === "problem" ? (
            <ProblemAccordion
              descriptionSource={descriptionSource}
              explanationSource={explanationSource}
              solutionSource={solutionSource}
              highlightedBlocks={highlightedBlocks}
              highlightedTabs={highlightedTabs}
              difficulty={difficulty}
              moduleTitle={moduleTitle}
              complexity={complexity}
              isSolved={isSolved}
            />
          ) : (
            <ContentBody
              tab="quiz"
              source={quizSource}
              highlightedBlocks={highlightedBlocks}
              highlightedTabs={highlightedTabs}
            />
          )}
        </div>
      ) : null}
      <div
        role={showCode ? "tabpanel" : undefined}
        id={showCode ? panelId : undefined}
        aria-labelledby={showCode ? `${tabsId}-tab-code` : undefined}
        aria-hidden={!showCode}
        className={cn("min-h-0", showCode ? "h-full min-h-0 flex-1" : "hidden")}
      >
        {sandbox}
      </div>
      <div
        role={showCoach ? "tabpanel" : undefined}
        id={showCoach ? panelId : undefined}
        aria-labelledby={showCoach ? `${tabsId}-tab-coach` : undefined}
        aria-hidden={!showCoach}
        className={cn(
          "min-h-0",
          showCoach ? "h-full min-h-0 flex-1" : "hidden",
        )}
      >
        <CoachPanel variant="page" active={showCoach} />
      </div>
    </div>
  );
}

function LeftPane({
  tab,
  onTabChange,
  tabs,
  descriptionSource,
  explanationSource,
  solutionSource,
  quizSource,
  highlightedBlocks,
  highlightedTabs,
  tabsId,
  difficulty,
  moduleTitle,
  complexity,
  isSolved,
}: {
  tab: ContentTab;
  onTabChange: (tab: WorkspaceTab) => void;
  tabs: readonly { id: ContentTab; label: string }[];
  descriptionSource: string;
  explanationSource: string;
  solutionSource: string;
  quizSource: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  tabsId: string;
  difficulty?: Difficulty;
  moduleTitle?: string;
  complexity?: { time?: string; space?: string } | null;
  isSolved?: boolean;
}) {
  const panelId = `${tabsId}-panel`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      {tabs.length > 1 ? (
        <TabList
          tabs={tabs}
          active={tab}
          onChange={onTabChange}
          tabsId={tabsId}
          label="Problem content"
          panelId={panelId}
          className="h-9"
        />
      ) : null}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabs.length > 1 ? `${tabsId}-tab-${tab}` : undefined}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:pb-21"
      >
        {tab === "problem" ? (
          <ProblemAccordion
            descriptionSource={descriptionSource}
            explanationSource={explanationSource}
            solutionSource={solutionSource}
            highlightedBlocks={highlightedBlocks}
            highlightedTabs={highlightedTabs}
            difficulty={difficulty}
            moduleTitle={moduleTitle}
            complexity={complexity}
            isSolved={isSolved}
          />
        ) : (
          <ContentBody
            tab="quiz"
            source={quizSource}
            highlightedBlocks={highlightedBlocks}
            highlightedTabs={highlightedTabs}
          />
        )}
      </div>
    </div>
  );
}

function ContentBody({
  tab,
  source,
  highlightedBlocks,
  highlightedTabs,
}: {
  tab: WorkspaceTab;
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}) {
  if (source.trim()) {
    return (
      <div className={tab !== "code" ? "problem-prose" : undefined}>
        <Markdown
          source={source}
          highlightedBlocks={highlightedBlocks}
          highlightedTabs={highlightedTabs}
        />
      </div>
    );
  }
  return (
    <p className="text-sm text-muted">
      {tab === "quiz" ? "No quiz for this problem yet." : "Nothing here yet."}
    </p>
  );
}

function TabList({
  tabs,
  active,
  onChange,
  tabsId,
  label,
  panelId,
  className,
  badgeId = null,
}: {
  tabs: readonly { id: WorkspaceTab; label: string }[];
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
  tabsId: string;
  label: string;
  panelId: string;
  className?: string;
  badgeId?: WorkspaceTab | null;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    const el = refs.current[index];
    el?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active);
    if (i < 0) return;
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (i + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (i - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onChange(tabs[next].id);
    focusTab(next);
  };

  return (
    // The rule lives on this wrapper, not on the scroller. overflow-x: auto
    // silently makes overflow-y auto too, so an underline drawn 1px below the
    // scroller to sit on its own border-b was 1px of vertical overflow: the bar
    // scrolled by a pixel, showed a scrollbar on mobile, and clipped the tabs'
    // focus outline.
    <div className={cn("flex shrink-0 border-b border-border", className)}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        // -mb-px stretches the scroller over the wrapper's rule, so each
        // underline at bottom-0 still lands exactly on it; overflow-y-hidden
        // pins the axis the browser would otherwise make scrollable. Horizontal
        // scroll stays: mobile tabs fit cleanly.
        className="-mb-px flex min-w-0 flex-1 items-stretch overflow-x-auto overflow-y-hidden"
      >
        {tabs.map((t, i) => {
          const selected = active === t.id;
          const TabIcon = TAB_ICON[t.id];
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative h-full min-w-11 touch-manipulation px-3.5 text-[0.75rem] font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:transition-colors after:duration-[var(--dur-fast)] after:content-['']",
                selected
                  ? "text-foreground after:bg-pop"
                  : "text-muted after:bg-transparent hover:text-foreground hover:after:bg-border",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <TabIcon
                  className="h-3.5 w-3.5 shrink-0"
                  weight={selected ? "fill" : undefined}
                  aria-hidden
                />
                {t.label}
                {badgeId === t.id && !selected ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-pop"
                    aria-hidden
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
