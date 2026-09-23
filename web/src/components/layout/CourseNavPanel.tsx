"use client";

import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, TreeStructure, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ROUND_CONTROL, TRANSLUCENT_PAPER } from "@/components/layout/headerChrome";
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
   * The desktop drawer's close action. When set, the panel's top row is pinned
   * and carries the close button. The mobile sheet has its own header with a
   * close button, so it passes nothing and renders no pinned row.
   */
  onClose?: () => void;
  /**
   * Rows are scrolling under the pinned row (CourseNavTree observes it). At
   * rest the row is flat paper like the rail; translucent there, it read as a
   * lighter strip.
   */
  scrolled?: boolean;
  /**
   * The module the reader just came back from. Its row takes the focus ref, so
   * returning lands on that row — in its own section, which is what the back
   * row promised — instead of the top of a 24-module list.
   */
  returnSlug?: string | null;
  returnRowRef?: Ref<HTMLAnchorElement>;
}

/**
 * Level 2's module header sits one step in from the section label above it.
 * That label's back caret hangs in the nav's own left padding rather than the
 * text flow — inline, it pushed the section ~20px right of every other row, so
 * the module title beneath read as the SAME level instead of one step in.
 *
 * The lessons share this indent, so their guide line hangs from the module
 * title's first letter — the same rule as level 1, where a stage's line sits
 * under the stage label. With level 1's pl-2 instead, the line hung from the
 * section label and lesson text landed on the module title (34.5px vs
 * 35.75px), reading as siblings of the module rather than its children.
 * Rows then indent via their own pl-3 plus the guide-line segment.
 */
const INDENT_UNDER_CARET = "pl-6";

const rowPad = (compact: boolean) =>
  compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";

/**
 * Every row in both levels: a segment of the guide line, an optional glyph, a
 * label, and optional trailing content. Sharing it is what keeps level 1 and
 * level 2 looking like the same tree — they differ only in tone and trailing.
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
        // Rows sit flush (no space-y) so the segments join into one line.
        "group flex min-w-0 items-center gap-1.5 border-l-2 pr-2 pl-3 text-[13px] leading-snug transition-colors",
        rowPad(compact),
        done ? "border-accent" : "border-border",
        active
          ? "border-accent bg-pop font-semibold text-on-pop"
          : cn(tone, "hover:bg-surface hover:text-foreground"),
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}

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
    <NavRow
      href={navModule.href}
      pathname={pathname}
      compact={compact}
      // A module's segment fills only when every lesson in it is done — the
      // same rule the lesson segments follow, one level up.
      done={hasLessons && doneCount === navModule.lessons.length}
      tone={
        navModule.status === "coming-soon"
          ? "text-muted/60"
          : "text-foreground/80"
      }
      rowRef={rowRef}
      trailing={
        hasLessons ? (
          <CaretRight
            aria-hidden
            className="h-3 w-3 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          />
        ) : null
      }
    >
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
    </NavRow>
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
    <NavRow
      href={lesson.href}
      pathname={pathname}
      compact={compact}
      done={visited.has(lesson.id)}
      tone="text-muted"
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
  return (
    <NavRow
      href={extra.href}
      pathname={pathname}
      compact={compact}
      tone="text-muted"
      // Not a lesson: its own glyph, and never a completed segment.
      icon={
        <TreeStructure
          weight="bold"
          className="h-3 w-3 shrink-0 text-muted"
          aria-hidden
        />
      }
    >
      {extra.title}
    </NavRow>
  );
}

/**
 * The drawer's pinned header row (owner, 2026-09-14; it replaced the close tab
 * that hung off the rail): the back row inside a module, then the close
 * button. Sticky at the top of the drawer's scroller so the way out stays in
 * reach while a 24-module list scrolls beneath. Flat paper like the rail at
 * rest; translucent paper that blurs the rows once they scroll under it
 * (TRANSLUCENT_PAPER, owner 2026-09-15) — flat 90% paper at rest read as a
 * lighter strip against the rail. No shadow. pt-3 is the drawer's top padding, moved onto the row
 * (Sidebar), or rows would scroll into a gap above it. No border-b: the module
 * heading below carries the rule.
 */
function PinnedRow({
  children,
  onClose,
  scrolled = false,
}: {
  children?: ReactNode;
  onClose: () => void;
  scrolled?: boolean;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center justify-end gap-2 pt-3 pb-1",
        scrolled ? TRANSLUCENT_PAPER : "bg-background",
      )}
    >
      {children}
      {/*
        The floating opener's own inverted fill (owner, 2026-09-23), not
        ROUND_CONTROL's plain hairline: this button is its close-side pair, so
        it carries the same dark-on-light/light-on-dark pill the opener does.
      */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close lessons drawer"
        className={cn(ROUND_CONTROL, "floating-invert h-8 w-8")}
      >
        <X className="h-4 w-4" weight="bold" />
      </button>
    </div>
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
  onClose,
  scrolled = false,
}: CourseNavPanelProps) {
  if (view.level === "module") {
    const { navModule } = view;
    const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
    const back = (
      <button
        type="button"
        onClick={onBack}
        // Visible text is the section name; the accessible name adds the
        // verb and still contains it (WCAG 2.5.3, label in name).
        aria-label={`Back to ${view.stage.title}`}
        className={cn(
          "relative flex items-center rounded-[length:var(--radius-xs)] px-2 py-1 text-foreground transition-colors hover:bg-surface",
          // In the pinned row it shares the line with the close button.
          onClose ? "min-w-0 flex-1" : "mb-1 w-full",
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
    );
    return (
      <div>
        {onClose ? <PinnedRow onClose={onClose} scrolled={scrolled}>{back}</PinnedRow> : back}
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
        <div className={cn("mt-2", INDENT_UNDER_CARET)}>
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
      {onClose ? <PinnedRow onClose={onClose} scrolled={scrolled} /> : null}
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
          {/* Same treatment as the level-2 section label, so a stage reads as
              the same kind of thing in both panels. */}
          <p className="mb-1 px-2 text-[19px] leading-tight font-bold tracking-tight text-foreground">
            {stage.title}
          </p>
          <div className="pl-2">
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
