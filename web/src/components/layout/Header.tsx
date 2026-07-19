"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProgress } from "@/components/providers/ProgressProvider";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <header className="print:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-foreground lg:hidden"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-semibold text-background">
          DSA
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">
          DSA Course
        </span>
      </Link>

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
