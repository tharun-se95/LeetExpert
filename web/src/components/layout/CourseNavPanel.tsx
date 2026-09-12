"use client";

import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
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
  /** Focus target after back, so the unmounting button doesn't drop focus. */
  allModulesRef?: Ref<HTMLAnchorElement>;
}

const rowPad = (compact: boolean) =>
  compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";
const iconBox = (compact: boolean) => (compact ? "h-8 w-6" : "h-11 w-11");

function ModuleRow({
  navModule,
  pathname,
  visited,
  compact,
}: {
  navModule: CourseNavModule;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
}) {
  const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
  const hasLessons = navModule.lessons.length > 0;
  const active = pathname === navModule.href;

  return (
    <Link
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
  marker,
}: {
  href: string;
  title: string;
  pathname: string;
  compact: boolean;
  marker: ReactNode;
}) {
  const active = pathname === href;
  return (
    <div className="flex items-start gap-1">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          iconBox(compact),
        )}
      >
        {marker}
      </span>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center rounded-[length:var(--radius-xs)] px-2 text-[13px] leading-snug transition-colors",
          rowPad(compact),
          active
            ? "bg-pop font-semibold text-on-pop"
            : "text-muted hover:bg-surface hover:text-foreground",
        )}
      >
        <span className="min-w-0">{title}</span>
      </Link>
    </div>
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
  const isDone = visited.has(lesson.id);
  return (
    <DestinationRow
      href={lesson.href}
      title={lesson.title}
      pathname={pathname}
      compact={compact}
      marker={
        <span
          className={cn(
            "h-2 w-2 rounded-[length:var(--radius-xs)] transition-colors",
            isDone ? "bg-accent" : "border border-border bg-transparent",
          )}
          title={isDone ? "Completed" : "Not completed"}
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
  allModulesRef,
}: CourseNavPanelProps) {
  if (view.level === "module") {
    const { navModule } = view;
    const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-2.5 flex w-full items-center gap-1.5 rounded-[length:var(--radius-xs)] px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-surface",
            rowPad(compact),
          )}
        >
          <CaretLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted" />
          All modules
        </button>
        <div className="border-b border-border px-2 pb-2">
          <h2 className="font-display text-[13px] font-bold tracking-tight text-foreground">
            <span className="mr-1.5 tabular-nums text-[11px] text-muted">
              {navModule.number}.
            </span>
            {navModule.title}
          </h2>
          {navModule.lessons.length > 0 ? (
            <p className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
              {doneCount}/{navModule.lessons.length}
            </p>
          ) : null}
        </div>
        <div className={cn("mt-2", compact ? "space-y-0.5" : "space-y-1")}>
          {navModule.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              pathname={pathname}
              visited={visited}
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
        ref={allModulesRef}
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
        All modules
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
          <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
            {stage.modules.map((m) => (
              <ModuleRow
                key={m.slug}
                navModule={m}
                pathname={pathname}
                visited={visited}
                compact={compact}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
