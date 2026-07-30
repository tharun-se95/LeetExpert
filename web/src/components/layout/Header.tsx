"use client";

import Link from "next/link";
import { List as Menu, X , MagnifyingGlass } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProgress } from "@/components/providers/ProgressProvider";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  /** False on the landing page where the course sidebar is not mounted. */
  showSidebarToggle?: boolean;
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  onOpenSearch,
  showSidebarToggle = true,
}: HeaderProps) {
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <header className="print:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {showSidebarToggle ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-foreground lg:hidden"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      ) : null}

      <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-[13px] font-bold text-on-pop"
          aria-hidden
        >
          {"</>"}
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">
          <span className="text-foreground">code</span>
          <span className="text-accent">Macha</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search lessons"
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
    </header>
  );
}
