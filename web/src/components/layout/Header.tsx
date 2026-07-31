"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProgress } from "@/components/providers/ProgressProvider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const pathname = usePathname();
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const lessonsActive =
    pathname === "/course" || pathname.startsWith("/course/");
  const practiceActive =
    pathname === "/problems" || pathname.startsWith("/problems/");

  const modeLinkClass = (active: boolean) =>
    cn(
      "rounded-[4px] px-2.5 py-1 text-[13px] font-medium transition-colors",
      active
        ? "bg-pop font-semibold text-on-pop"
        : "text-muted hover:bg-surface hover:text-foreground",
    );

  return (
    <header className="print:hidden sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-3 justify-self-start">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-[13px] font-bold text-on-pop"
            aria-hidden
          >
            {"</>"}
          </span>
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-semibold tracking-tight">
              <span className="text-foreground">code</span>
              <span className="text-accent">Macha</span>
            </span>
            <span
              className="hidden h-3.5 w-px shrink-0 bg-border sm:block"
              aria-hidden
            />
            <span className="hidden truncate text-[13px] font-medium text-muted sm:inline">
              DSA
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="flex shrink-0 items-center gap-1 justify-self-center"
        aria-label="Product modes"
      >
        <Link href="/course" className={modeLinkClass(lessonsActive)}>
          Lessons
        </Link>
        <Link href="/problems" className={modeLinkClass(practiceActive)}>
          Practice
        </Link>
      </nav>

      <div className="flex min-w-0 items-center justify-end gap-3 justify-self-end">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search lessons and problems"
          className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          <MagnifyingGlass size={12} aria-hidden />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden font-mono text-[10px] sm:inline">⌘K</kbd>
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted"
            title={`${visitedCount} of ${totalCount} lessons completed`}
          >
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface">
              <span
                className="block h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="tabular-nums">
              {visitedCount}/{totalCount}
            </span>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
