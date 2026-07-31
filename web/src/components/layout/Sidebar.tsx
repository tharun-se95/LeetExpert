"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDown as ChevronDown,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  buildCourseNav,
  type CourseNavModule,
  type CourseNavStage,
} from "@/lib/course/nav";
import { useProgress } from "@/components/providers/ProgressProvider";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Module whose page or a lesson under it matches the current route. */
function activeModuleSlug(
  stages: CourseNavStage[],
  pathname: string,
): string | null {
  for (const stage of stages) {
    for (const navModule of stage.modules) {
      if (pathname === navModule.href) return navModule.slug;
      if (navModule.lessons.some((l) => isActivePath(pathname, l.href))) {
        return navModule.slug;
      }
    }
  }
  return null;
}

function ModuleNode({
  navModule,
  pathname,
  open,
  onToggle,
}: {
  navModule: CourseNavModule;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { visited } = useProgress();
  const hasLessons = navModule.lessons.length > 0;
  const selfActive = pathname === navModule.href;

  const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;

  return (
    <div>
      <div className="group flex items-center gap-0.5 rounded-md">
        {hasLessons ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-surface hover:text-foreground"
            aria-expanded={open}
            aria-label={open ? "Collapse module" : "Expand module"}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <CaretRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 shrink-0" />
        )}
        <Link
          href={navModule.href}
          className={cn(
            "min-w-0 flex-1 truncate rounded-[4px] py-1 pl-1.5 pr-1.5 text-[13px] transition-colors",
            navModule.status === "coming-soon" && "text-muted/60",
            selfActive
              ? "bg-pop font-semibold text-on-pop"
              : "text-foreground/80 hover:bg-surface hover:text-foreground",
          )}
        >
          <span className="mr-1.5 tabular-nums text-[11px] text-muted/70">
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
                selfActive
                  ? "text-on-pop/70"
                  : doneCount === navModule.lessons.length
                    ? "text-accent"
                    : "text-muted/60",
              )}
            >
              {doneCount}/{navModule.lessons.length}
            </span>
          ) : null}
        </Link>
      </div>
      {hasLessons && open ? (
        <div className="ml-2 border-l border-border pl-1">
          {navModule.lessons.map((lesson) => {
            const active = pathname === lesson.href;
            const isDone = visited.has(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center gap-0.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-[1px] transition-colors",
                      isDone
                        ? "bg-accent"
                        : "border border-border bg-transparent",
                    )}
                    title={isDone ? "Completed" : "Not completed"}
                  />
                </span>
                <Link
                  href={lesson.href}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1 rounded-[4px] py-1 pl-1.5 pr-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-pop font-semibold text-on-pop"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  <span className="min-w-0 truncate">{lesson.title}</span>
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Collapse to the rail after navigation on small viewports. */
  onNavigate: () => void;
}

/**
 * Persistent Lessons drawer: full panel when open, narrow rail with an
 * open control when closed — never fully removed from the layout.
 */
export function Sidebar({ open, onOpen, onClose, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const nav = useMemo(() => buildCourseNav(), []);
  const [openModuleSlug, setOpenModuleSlug] = useState<string | null>(() =>
    activeModuleSlug(nav, pathname),
  );

  useEffect(() => {
    const active = activeModuleSlug(nav, pathname);
    if (active) setOpenModuleSlug(active);
  }, [nav, pathname]);

  useEffect(() => {
    onNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        "print:hidden relative z-20 flex h-full shrink-0 flex-col border-r border-border bg-background transition-[width] duration-[var(--dur)] ease-[var(--ease)]",
        open ? "w-[min(18rem,85vw)] sm:w-64" : "w-12",
      )}
    >
      {open ? (
        <>
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
            <span className="truncate text-sm font-semibold tracking-tight">
              Lessons
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-foreground"
              aria-label="Close lessons drawer"
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </button>
          </div>
          <nav
            className="flex-1 overflow-y-auto px-3 py-4"
            aria-label="Course"
          >
            <Link
              href="/course"
              className={cn(
                "mb-1 block rounded-[4px] py-1 pl-2 text-[13px] font-medium transition-colors",
                pathname === "/course"
                  ? "bg-pop font-semibold text-on-pop"
                  : "text-foreground hover:bg-surface",
              )}
            >
              All modules
            </Link>
            {nav.map((stage) => (
              <div key={stage.number} className="mt-4 first:mt-2">
                <p className="mb-1.5 border-b border-border px-2 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70">
                  <span className="text-accent">{stage.number}</span>{" "}
                  {stage.title}
                </p>
                {stage.modules.map((m) => (
                  <ModuleNode
                    key={m.slug}
                    navModule={m}
                    pathname={pathname}
                    open={openModuleSlug === m.slug}
                    onToggle={() =>
                      setOpenModuleSlug((prev) =>
                        prev === m.slug ? null : m.slug,
                      )
                    }
                  />
                ))}
              </div>
            ))}
          </nav>
        </>
      ) : (
        <div className="flex h-full flex-col items-center py-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            aria-label="Open lessons drawer"
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </button>
          <span
            className="mt-4 origin-center rotate-180 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            Lessons
          </span>
        </div>
      )}
    </aside>
  );
}
