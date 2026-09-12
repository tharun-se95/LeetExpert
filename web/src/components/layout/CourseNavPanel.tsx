"use client";

import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, TreeStructure } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
  CourseNavExtra,
  CourseNavLesson,
  CourseNavModule,
  CourseNavStage,
} from "@/lib/course/nav";
import type { NavView } from "@/lib/course/navLevel";

export interface CourseNavPanelProps {
  nav: CourseNavStage[];
  view: NavView;
  pathname: string;
  visited: Set<string>;
  /** Desktop rail uses denser rows; mobile sheet needs ≥44px taps. */
  compact: boolean;
  curriculumHref: string;
  onBack: () => void;
  /**
   * The module the reader just came back from. Its row takes the focus ref, so
   * returning lands on that row — in its own section, which is what the back
   * row promised — instead of the top of a 24-module list.
   */
  returnSlug?: string | null;
  returnRowRef?: Ref<HTMLAnchorElement>;
}

/**
 * One indent step per level of the tree: stage > module on level 1, section >
 * module > lesson on level 2. Rows keep their own px-2 so the hover/active
 * fill still starts left of the text.
 *
 * The section row's caret hangs in the nav's own left padding rather than
 * sitting in the text flow. Inline, it pushed the section label ~20px right of
 * every other row, so the module title beneath it read as the SAME level (or
 * further left) instead of one step in.
 */
const INDENT = "pl-3";
const INDENT_UNDER_CARET = "pl-6";

const rowPad = (compact: boolean) =>
  compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";

function ModuleRow({
  navModule,
  pathname,
  visited,
  compact,
  rowRef,
}: {
  navModule: CourseNavModule;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
  rowRef?: Ref<HTMLAnchorElement>;
}) {
  const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
  const hasLessons = navModule.lessons.length > 0;
  const active = pathname === navModule.href;

  return (
    <Link
      ref={rowRef}
      href={navModule.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-1 rounded-[length:var(--radius-xs)] px-2 text-[13px] transition-colors",
        rowPad(compact),
        navModule.status === "coming-soon" && "text-muted/60",
        active
          ? "bg-pop font-semibold text-on-pop"
          : "text-foreground/80 hover:bg-surface hover:text-foreground",
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className="mr-1.5 tabular-nums text-[11px] text-muted">
          {navModule.number}.
        </span>
        {navModule.shortTitle}
        {navModule.status === "coming-soon" ? (
          <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted/50">
            soon
          </span>
        ) : hasLessons ? (
          <span
            className={cn(
              "ml-1.5 font-mono text-[10px] tabular-nums",
              active
                ? "text-on-pop/70"
                : doneCount === navModule.lessons.length
                  ? "text-mark"
                  : "text-muted",
            )}
          >
            {doneCount}/{navModule.lessons.length}
          </span>
        ) : null}
      </span>
      {hasLessons ? (
        <CaretRight
          aria-hidden
          className="h-3 w-3 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}

function DestinationRow({
  href,
  title,
  pathname,
  compact,
  done = false,
  icon,
}: {
  href: string;
  title: string;
  pathname: string;
  compact: boolean;
  /** Paints this row's segment of the guide line as completed. */
  done?: boolean;
  icon?: ReactNode;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // The rail IS the marker: each row owns a segment of one continuous
        // line, so the list reads as a branch of the module rather than a
        // column of dots. Rows sit flush (no space-y) or the line breaks.
        "flex min-w-0 items-center gap-1.5 border-l-2 pr-2 pl-3 text-[13px] leading-snug transition-colors",
        rowPad(compact),
        done ? "border-accent" : "border-border",
        active
          ? "border-accent bg-pop font-semibold text-on-pop"
          : "text-muted hover:bg-surface hover:text-foreground",
      )}
    >
      {icon}
      <span className="min-w-0">{title}</span>
    </Link>
  );
}

function LessonRow({
  lesson,
  pathname,
  visited,
  compact,
}: {
  lesson: CourseNavLesson;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
}) {
  return (
    <DestinationRow
      href={lesson.href}
      title={lesson.title}
      pathname={pathname}
      compact={compact}
      done={visited.has(lesson.id)}
    />
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
  return (
    <DestinationRow
      href={extra.href}
      title={extra.title}
      pathname={pathname}
      compact={compact}
      // Not a lesson: it carries its own glyph and never a completed segment.
      icon={
        <TreeStructure
          weight="bold"
          className="h-3 w-3 shrink-0 text-muted"
          aria-hidden
        />
      }
    />
  );
}

/**
 * Props-only view for both nav levels — no hooks and no context, so it
 * renders under renderToStaticMarkup in tests without mocking the router.
 */
export function CourseNavPanel({
  nav,
  view,
  pathname,
  visited,
  compact,
  curriculumHref,
  onBack,
  returnSlug,
  returnRowRef,
}: CourseNavPanelProps) {
  if (view.level === "module") {
    const { navModule } = view;
    const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          // Visible text is the section name; the accessible name adds the
          // verb and still contains it (WCAG 2.5.3, label in name).
          aria-label={`Back to ${view.stage.title}`}
          className={cn(
            "relative mb-1 flex w-full items-center rounded-[length:var(--radius-xs)] px-2 py-1 text-foreground transition-colors hover:bg-surface",
          )}
        >
          <CaretLeft
            aria-hidden
            className="absolute top-1/2 left-[-16px] h-4 w-4 -translate-y-1/2 text-muted"
          />
          <span className="min-w-0 truncate text-[19px] leading-tight font-bold tracking-tight">
            {view.stage.title}
          </span>
        </button>
        <div
          className={cn("border-b border-border pr-2 pb-2", INDENT_UNDER_CARET)}
        >
          {/* Sits between the 19px section label and the 13px rows, so the
              hierarchy reads section > module > lesson. The count rides on the
              same line: on its own row it read as a separate fact rather than
              this module's progress. */}
          <h2 className="flex items-baseline gap-2 font-display text-[15px] font-bold tracking-tight text-foreground">
            <span className="min-w-0">{navModule.title}</span>
            {navModule.lessons.length > 0 ? (
              <span className="shrink-0 font-mono text-[10px] font-normal tabular-nums text-muted">
                {doneCount}/{navModule.lessons.length}
              </span>
            ) : null}
          </h2>
        </div>
        <div
          className={cn("mt-2", "pl-2")}
        >
          {navModule.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              pathname={pathname}
              visited={visited}
              compact={compact}
            />
          ))}
          {/* Non-lesson destinations: no completion dot, and deliberately not
              part of the x/y count above — they have no progress to track. */}
          {(navModule.extras ?? []).map((extra) => (
            <ExtraRow
              key={extra.id}
              extra={extra}
              pathname={pathname}
              compact={compact}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={curriculumHref}
        aria-current={pathname === curriculumHref ? "page" : undefined}
        className={cn(
          "mb-2.5 block rounded-[length:var(--radius-xs)] px-2 text-[13px] font-medium transition-colors",
          rowPad(compact),
          pathname === curriculumHref
            ? "bg-pop font-semibold text-on-pop"
            : "text-foreground hover:bg-surface",
        )}
      >
        Overview
      </Link>
      {nav.map((stage) => (
        <div
          key={stage.number}
          className={cn(compact ? "mt-5 first:mt-3" : "mt-6 first:mt-4")}
        >
          <p
            className={cn(
              "border-b border-border px-2 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70",
              compact ? "mb-2 pb-1.5" : "mb-3 pb-2",
            )}
          >
            {stage.title}
          </p>
          <div
            className={cn(INDENT, compact ? "space-y-1" : "space-y-1.5")}
          >
            {stage.modules.map((m) => (
              <ModuleRow
                key={m.slug}
                navModule={m}
                pathname={pathname}
                visited={visited}
                compact={compact}
                rowRef={m.slug === returnSlug ? returnRowRef : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
