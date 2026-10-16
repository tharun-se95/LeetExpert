"use client";

import { useEffect, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { CaretDown, CaretRight, TreeStructure } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { NavModeSwitcher } from "@/components/layout/NavModeSwitcher";
import { activeModuleSlug } from "@/lib/course/navLevel";
import type {
  CourseNavExtra,
  CourseNavLesson,
  CourseNavModule,
  CourseNavStage,
} from "@/lib/course/nav";
import type { NavView } from "@/lib/course/navLevel";

export interface CourseNavPanelProps {
  nav: CourseNavStage[];
  pathname: string;
  visited: Set<string>;
  /** Desktop rail uses denser rows; mobile sheet needs ≥44px taps. */
  compact: boolean;
  curriculumHref: string;
  activeFilter?: "lessons" | "practice";
  onFilterChange?: (filter: "lessons" | "practice") => void;
  /** Optional backwards-compatibility props */
  view?: NavView;
  onBack?: () => void;
  onClose?: () => void;
  scrolled?: boolean;
  returnSlug?: string | null;
  returnRowRef?: Ref<HTMLAnchorElement>;
}

const rowPad = (compact: boolean) =>
  compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";

/**
 * Every row in the tree: a segment of the guide line, an optional glyph, a
 * label, and optional trailing content.
 */
function NavRow({
  href,
  pathname,
  compact,
  done = false,
  tone,
  icon,
  trailing,
  rowRef,
  children,
}: {
  href: string;
  pathname: string;
  compact: boolean;
  /** Paints this row's segment of the line as completed. */
  done?: boolean;
  tone: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  rowRef?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}) {
  const active = pathname === href;
  return (
    <Link
      ref={rowRef}
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-w-0 items-center gap-2 border-l-2 pr-2.5 pl-3 text-[13px] leading-snug transition-all duration-[var(--dur-fast)] ease-[var(--ease)]",
        rowPad(compact),
        done ? "border-accent" : "border-border",
        active
          ? "border-accent bg-pop/15 font-semibold text-foreground rounded-r-[length:var(--radius-xs)]"
          : cn(tone, "hover:bg-surface/80 hover:text-foreground"),
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-accent"
        />
      )}
      {icon}
      <span className="min-w-0 flex-1 line-clamp-2">{children}</span>
      {trailing}
    </Link>
  );
}

function LessonRow({
  lesson,
  index,
  pathname,
  visited,
  compact,
}: {
  lesson: CourseNavLesson;
  index: number;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
}) {
  const isDone = visited.has(lesson.id);
  const active = pathname === lesson.href;
  return (
    <NavRow
      href={lesson.href}
      pathname={pathname}
      compact={compact}
      done={isDone}
      tone={
        active
          ? "text-foreground font-medium"
          : isDone
            ? "text-foreground/85"
            : "text-muted"
      }
      icon={
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums shrink-0 transition-colors w-4 text-center",
            active
              ? "text-accent font-bold"
              : isDone
                ? "text-mark font-medium"
                : "text-muted/50 group-hover:text-muted",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      }
      trailing={
        isDone ? (
          <span
            className="shrink-0 text-mark text-[11px] font-bold"
            aria-label="Completed"
          >
            ✓
          </span>
        ) : null
      }
    >
      {lesson.title}
    </NavRow>
  );
}

function ExtraRow({
  extra,
  pathname,
  compact,
}: {
  extra: CourseNavExtra;
  pathname: string;
  compact: boolean;
}) {
  const active = pathname === extra.href;
  return (
    <NavRow
      href={extra.href}
      pathname={pathname}
      compact={compact}
      tone={active ? "text-foreground font-medium" : "text-muted"}
      icon={
        <TreeStructure
          weight="bold"
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-accent" : "text-muted group-hover:text-foreground",
          )}
          aria-hidden
        />
      }
    >
      {extra.title}
    </NavRow>
  );
}

function ModuleHeader({
  navModule,
  expanded,
  onToggle,
  pathname,
  visited,
  filter,
  compact,
  rowRef,
}: {
  navModule: CourseNavModule;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  visited: Set<string>;
  filter: "lessons" | "practice";
  compact: boolean;
  rowRef?: Ref<HTMLButtonElement>;
}) {
  const items =
    filter === "practice" ? (navModule.problems ?? []) : navModule.lessons;
  const doneCount = items.filter((l) => visited.has(l.id)).length;
  const hasItems = items.length > 0;
  const isComplete = hasItems && doneCount === items.length;
  const isCurrentModule =
    pathname === navModule.href || items.some((i) => pathname === i.href);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${navModule.title}`}
      className={cn(
        "group flex w-full min-w-0 items-center gap-2 rounded-[length:var(--radius-xs)] px-2 text-left text-[13px] font-medium transition-all duration-[var(--dur-fast)] ease-[var(--ease)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        rowPad(compact),
        isCurrentModule
          ? "text-foreground font-semibold bg-surface/70"
          : "text-foreground/85 hover:bg-surface hover:text-foreground",
      )}
    >
      {expanded ? (
        <CaretDown
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:text-foreground"
        />
      ) : (
        <CaretRight
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:text-foreground"
        />
      )}
      <span className="flex-1 min-w-0 truncate">{navModule.shortTitle}</span>
      {navModule.status === "coming-soon" ? (
        <span className="ml-1.5 rounded-[length:var(--radius-xs)] bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted font-mono">
          soon
        </span>
      ) : hasItems ? (
        <span
          className={cn(
            "ml-1.5 font-mono text-[10px] tabular-nums rounded-full px-1.5 py-0.5 transition-colors",
            isCurrentModule
              ? "bg-accent/20 text-accent font-semibold"
              : isComplete
                ? "bg-mark/15 text-mark font-medium"
                : "text-muted bg-surface/60 group-hover:text-muted-foreground",
          )}
        >
          {doneCount}/{items.length}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Single-level course navigation panel.
 * Displays stages, modules, and their filtered lessons or practice problems
 * in a unified hierarchical tree without drill-down levels.
 */
export function CourseNavPanel({
  nav,
  pathname,
  visited,
  compact,
  curriculumHref,
  activeFilter,
  onFilterChange,
  returnSlug,
  returnRowRef,
}: CourseNavPanelProps) {
  const isPracticeRoute = pathname.startsWith("/courses/dsa/problems");
  const [internalFilter, setInternalFilter] = useState<"lessons" | "practice">(
    isPracticeRoute ? "practice" : "lessons",
  );
  const filter = activeFilter ?? internalFilter;

  const handleFilterChange = (nextFilter: "lessons" | "practice") => {
    setInternalFilter(nextFilter);
    onFilterChange?.(nextFilter);
  };

  const currentModuleSlug = activeModuleSlug(nav, pathname);

  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    if (currentModuleSlug) {
      initial[currentModuleSlug] = true;
    }
    return initial;
  });

  // Automatically keep current module expanded when route changes
  useEffect(() => {
    if (currentModuleSlug) {
      setExpandedModules((prev) =>
        prev[currentModuleSlug] ? prev : { ...prev, [currentModuleSlug]: true },
      );
    }
  }, [currentModuleSlug]);

  const toggleModule = (slug: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const overviewHref =
    filter === "practice" ? "/courses/dsa/problems" : curriculumHref;
  const overviewLabel =
    filter === "practice" ? "All Practice Problems" : "Overview";
  const overviewActive = pathname === overviewHref;

  const displayedStages = nav
    .map((stage) => {
      if (filter === "practice") {
        const modulesWithProblems = stage.modules.filter(
          (m) => (m.problems?.length ?? 0) > 0,
        );
        return { ...stage, modules: modulesWithProblems };
      }
      return stage;
    })
    .filter((stage) => stage.modules.length > 0);

  return (
    <div id="nav-tree-content">
      <NavModeSwitcher
        filter={filter}
        onFilterChange={handleFilterChange}
        compact={compact}
        className="mb-2.5"
      />

      <Link
        href={overviewHref}
        aria-current={overviewActive ? "page" : undefined}
        className={cn(
          "mb-3 block rounded-[length:var(--radius-xs)] px-2.5 text-[13px] font-medium transition-all duration-[var(--dur-fast)] ease-[var(--ease)]",
          rowPad(compact),
          overviewActive
            ? "border-l-2 border-accent bg-pop/15 font-semibold text-foreground"
            : "text-foreground hover:bg-surface",
        )}
      >
        {overviewLabel}
      </Link>

      {displayedStages.map((stage) => (
        <div
          key={stage.number}
          className={cn(compact ? "mt-5 first:mt-3" : "mt-6 first:mt-4")}
        >
          <p className="mb-1 px-2 text-[17px] leading-tight font-bold tracking-tight text-foreground font-display">
            {stage.title}
          </p>
          <div className="space-y-1">
            {stage.modules.map((m) => {
              const isExpanded = expandedModules[m.slug] ?? false;
              const items =
                filter === "practice" ? (m.problems ?? []) : m.lessons;

              return (
                <div key={m.slug} className="min-w-0">
                  <ModuleHeader
                    navModule={m}
                    expanded={isExpanded}
                    onToggle={() => toggleModule(m.slug)}
                    pathname={pathname}
                    visited={visited}
                    filter={filter}
                    compact={compact}
                    rowRef={
                      m.slug === returnSlug
                        ? (returnRowRef as Ref<HTMLButtonElement>)
                        : undefined
                    }
                  />

                  {isExpanded && (
                    <div className="pl-3.5 my-0.5">
                      {filter === "lessons" && m.href && (
                        <NavRow
                          href={m.href}
                          pathname={pathname}
                          compact={compact}
                          tone={
                            pathname === m.href
                              ? "text-foreground font-semibold"
                              : "text-muted"
                          }
                        >
                          Overview
                        </NavRow>
                      )}

                      {items.map((item, idx) => (
                        <LessonRow
                          key={item.id}
                          lesson={item}
                          index={idx}
                          pathname={pathname}
                          visited={visited}
                          compact={compact}
                        />
                      ))}

                      {filter === "lessons" &&
                        (m.extras ?? []).map((extra) => (
                          <ExtraRow
                            key={extra.id}
                            extra={extra}
                            pathname={pathname}
                            compact={compact}
                          />
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
