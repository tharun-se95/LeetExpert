"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, MagnifyingGlass } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProgress } from "@/components/providers/ProgressProvider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSearch: () => void;
  /** Show the mobile Lessons sheet trigger (course chrome, below lg). */
  showLessonsMenu?: boolean;
  lessonsMenuOpen?: boolean;
  onToggleLessonsMenu?: () => void;
  /** Progress chip is course chrome — hidden on the marketing landing. */
  showProgress?: boolean;
}

export function Header({
  onOpenSearch,
  showLessonsMenu = false,
  lessonsMenuOpen = false,
  onToggleLessonsMenu,
  showProgress = true,
}: HeaderProps) {
  const pathname = usePathname();
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const lessonsActive =
    pathname === "/course" || pathname.startsWith("/course/");
  const practiceActive =
    pathname === "/problems" || pathname.startsWith("/problems/");

  const modeLinkClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-[length:var(--radius-xs)] px-2 py-1.5 text-[13px] font-medium transition-colors md:min-h-9 md:px-2.5",
      active
        ? "bg-pop font-semibold text-on-pop"
        : "text-muted hover:bg-surface hover:text-foreground",
    );

  return (
    <header className="print:hidden sticky top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-elevated px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
        {showLessonsMenu && onToggleLessonsMenu ? (
          <button
            type="button"
            onClick={onToggleLessonsMenu}
            aria-expanded={lessonsMenuOpen}
            aria-controls="mobile-lessons-sheet"
            aria-label={lessonsMenuOpen ? "Close lessons menu" : "Open lessons menu"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent lg:hidden"
          >
            <List className="h-5 w-5" weight="bold" aria-hidden />
          </button>
        ) : null}
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-[13px] font-bold text-on-pop"
            aria-hidden
          >
            {"</>"}
          </span>
          <span className="flex min-w-0 items-baseline gap-2">
            {/*
              When the lessons menu button is present, drop the wordmark below sm
              so left + centered modes + right icons fit ~375px without overlap.
            */}
            <span
              className={cn(
                "truncate text-sm font-semibold tracking-tight",
                showLessonsMenu && "max-sm:hidden",
              )}
            >
              <span className="text-foreground">code</span>
              <span className="text-mark">Macha</span>
            </span>
            <span
              className="hidden h-3.5 w-px shrink-0 bg-border md:block"
              aria-hidden
            />
            <span className="hidden truncate text-[13px] font-medium text-muted md:inline">
              DSA
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="flex shrink-0 items-center gap-0.5 justify-self-center sm:gap-1"
        aria-label="Product modes"
      >
        <Link href="/course" className={modeLinkClass(lessonsActive)}>
          Lessons
        </Link>
        <Link href="/problems" className={modeLinkClass(practiceActive)}>
          Practice
        </Link>
      </nav>

      <div className="flex min-w-0 items-center justify-end gap-1.5 justify-self-end sm:gap-2 md:gap-3">
        {/*
          Icon-only below md: the Search+⌘K pill was the main collision with
          centered Lessons/Practice in the 640–768px band (1fr_auto_1fr).
        */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search lessons and problems"
          className={cn(
            "inline-flex shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground",
            "h-11 w-11 rounded-[length:var(--radius-md)]",
            "md:h-auto md:w-auto md:gap-2 md:rounded-full md:px-2.5 md:py-1 md:text-[11px]",
          )}
        >
          <MagnifyingGlass className="h-4 w-4 md:h-3 md:w-3" aria-hidden />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden font-mono text-[10px] md:inline">⌘K</kbd>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {showProgress ? (
            <div
              className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted"
              title={`${visitedCount} of ${totalCount} lessons completed`}
            >
              <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface lg:block">
                <span
                  className="block h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="tabular-nums">
                {visitedCount}/{totalCount}
              </span>
            </div>
          ) : null}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
