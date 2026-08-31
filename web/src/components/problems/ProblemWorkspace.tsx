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
import { ArrowLeft, ArrowRight, Check, CaretLeft, List } from "@phosphor-icons/react";
import { Markdown } from "@/components/md/Markdown";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useSidebar } from "@/components/layout/SidebarContext";
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

interface NeighborLink {
  href: string;
  title: string;
}

type ContentTab = "description" | "explanation" | "solution" | "quiz";
type WorkspaceTab = ContentTab | "code" | "coach";

const CONTENT_TABS: { id: ContentTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "explanation", label: "Explanation" },
  { id: "solution", label: "Solution" },
  { id: "quiz", label: "Quiz" },
];

/** Mobile: Code sits between Description and Explanation so reading comes first. */
const MOBILE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "code", label: "Code" },
  { id: "coach", label: "Coach" },
  { id: "explanation", label: "Explanation" },
  { id: "solution", label: "Solution" },
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
 * Desktop (`lg+`): description pane + Sandbox side-by-side.
 * Mobile: Description | Code | Explanation | Solution — Sandbox only in Code.
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
  const [tab, setTab] = useState<WorkspaceTab>("description");
  const [wide, setWide] = useState(false);
  const tabsId = useId();
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  useEffect(() => {
    const mq = window.matchMedia(IDE_WIDE_MQ);
    const sync = () => {
      const nextWide = mq.matches;
      setWide(nextWide);
      // Desktop has no Code tab — fall back so the left pane stays valid.
      if (nextWide) {
        setTab((t) => (t === "code" || t === "coach" ? "description" : t));
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

  const contentTab: ContentTab =
    tab === "code" || tab === "coach" ? "description" : tab;

  const tabSource =
    contentTab === "description"
      ? lesson.sandbox.beforeSandbox
      : contentTab === "explanation"
        ? explanation
        : contentTab === "solution"
          ? solution
          : quiz;

  const sandbox = (
    <Sandbox
      source={lesson.sandbox.sandboxSource}
      onSolved={() => markSolved(id)}
      variant="ide"
      moduleSlug={lesson.moduleSlug}
      extractedComplexity={extractedComplexity}
    />
  );

  return (
    // Fills AppShell's main pane (`overflow-hidden` on /problems/[slug]).
    // Panes scroll internally — no document scroll.
    <CoachProvider sandboxId={sandboxId} hintLabels={hintLabels}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-elevated px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
          <Link
            href={backHref}
            className="inline-flex min-h-11 touch-manipulation items-center gap-1 rounded-[length:var(--radius-md)] px-2 text-xs text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-surface hover:text-foreground motion-reduce:transition-none"
          >
            <CaretLeft size={14} weight="bold" aria-hidden />
            <span className="max-w-[5.5rem] truncate sm:max-w-none">
              {backLabel}
            </span>
          </Link>
          {/*
            The lessons-drawer opener, inline next to the title it sits
            beside — desktop only (lg:); mobile keeps the app Header's own
            hamburger for the lessons sheet, so this isn't a second control
            for the same job at that width.
          */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="lessons-sidebar"
            aria-label={sidebarOpen ? "Close lessons drawer" : "Open lessons drawer"}
            className={cn(
              "hidden h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] transition-colors lg:inline-flex",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              sidebarOpen
                ? "bg-surface text-foreground"
                : "text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" weight="bold" aria-hidden />
          </button>
          {/*
            Divides controls from content. This used to be a "/" sitting
            BEFORE the drawer button, which read as a breadcrumb separator
            pointing at a button — as if the toggle were a crumb in the
            path. A rule after the controls says what is actually true:
            everything left of it acts on the view, everything right of it
            describes the problem.
          */}
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
          {/*
            Solved is the only state worth a chip. The old "Problem" pill it
            replaced was constant — every page this component renders IS a
            problem — so it spent prime space next to the nav saying nothing,
            and its absence now carries "not solved yet" on its own.
          */}
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
          Desktop: description pane + Sandbox side-by-side. Unchanged from the
          prior IDE shell — do not stack Code into the left tablist here.
        */
          <PanelSplit
            orientation="horizontal"
            initialPrimary={0.3}
            minPrimary={0.28}
            maxPrimary={0.58}
            primary={
              <LeftPane
                tab={contentTab}
                onTabChange={setTab}
                source={tabSource}
                highlightedBlocks={lesson.highlightedBlocks}
                highlightedTabs={lesson.highlightedTabs}
                tabsId={tabsId}
              />
            }
            secondary={<IdeWithCoach sandbox={sandbox} />}
          />
        ) : (
          <MobileWorkspace
            tab={tab}
            onTabChange={setTab}
            source={tabSource}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
            tabsId={tabsId}
            sandbox={sandbox}
          />
        )}
      </div>
    </CoachProvider>
  );
}

function MobileWorkspace({
  tab,
  onTabChange,
  source,
  highlightedBlocks,
  highlightedTabs,
  tabsId,
  sandbox,
}: {
  tab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  tabsId: string;
  sandbox: ReactNode;
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
        tabs={MOBILE_TABS}
        active={tab}
        onChange={onTabChange}
        tabsId={tabsId}
        label="Problem workspace"
        panelId={panelId}
        // Full-height touch targets on the only tab bar below lg.
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
          <ContentBody
            tab={tab}
            source={source}
            highlightedBlocks={highlightedBlocks}
            highlightedTabs={highlightedTabs}
          />
        </div>
      ) : null}
      {/*
        Keep Sandbox mounted while hidden so drafts/runner state survive tab
        switches. Drafts also live in localStorage if the tree remounts at lg.
      */}
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
  source,
  highlightedBlocks,
  highlightedTabs,
  tabsId,
}: {
  tab: ContentTab;
  onTabChange: (tab: WorkspaceTab) => void;
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  tabsId: string;
}) {
  const panelId = `${tabsId}-panel`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      <TabList
        tabs={CONTENT_TABS}
        active={tab}
        onChange={onTabChange}
        tabsId={tabsId}
        label="Problem content"
        panelId={panelId}
        className="h-9"
      />
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${tabsId}-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5"
      >
        <ContentBody
          tab={tab}
          source={source}
          highlightedBlocks={highlightedBlocks}
          highlightedTabs={highlightedTabs}
        />
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
      {tab === "solution"
        ? "This problem’s solution walkthrough lives under Explanation."
        : tab === "quiz"
          ? "No quiz for this problem yet."
          : "Nothing here yet."}
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
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex shrink-0 items-stretch overflow-x-auto border-b border-border",
        className,
      )}
    >
      {tabs.map((t, i) => {
        const selected = active === t.id;
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
              // Underline indicator, not a filled pill: a bottom bar sitting
              // exactly on the tablist's own border-b (after:-bottom-px)
              // reads as "this tab owns the rule beneath it" — the modern
              // convention (GitHub, Linear) — rather than a colour block.
              "relative h-full min-w-11 touch-manipulation px-3.5 text-[0.75rem] font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
              "after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:rounded-full after:transition-colors after:duration-[var(--dur-fast)] after:content-['']",
              selected
                ? "text-foreground after:bg-pop"
                : "text-muted after:bg-transparent hover:text-foreground hover:after:bg-border",
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {badgeId === t.id && !selected ? (
                <span className="h-1.5 w-1.5 rounded-full bg-pop" aria-hidden />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
