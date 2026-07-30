"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { ScrollbarAutoHide } from "@/components/providers/ScrollbarAutoHide";
import { VisitTracker } from "@/components/providers/VisitTracker";
import { allLessonIds, allProblemSlugs, getLesson } from "@/lib/course/manifest";
import { cn } from "@/lib/utils";

function isIdePath(pathname: string): boolean {
  if (/^\/problems\/[^/]+\/?$/.test(pathname)) return true;
  const course = /^\/course\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!course) return false;
  return getLesson(course[1], course[2])?.lesson.type === "problem";
}

/** Course overview is a full-width landing — no course nav chrome. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalCount = allLessonIds().length;
  const totalProblemCount = allProblemSlugs().length;
  const pathname = usePathname();
  // Problem lessons (hub + course) use a fixed IDE viewport — panes scroll
  // inside, the shell must not. Concept lessons keep document scroll.
  const ideViewport = isIdePath(pathname);
  const showSidebar = !isLandingPath(pathname);

  // Cmd/Ctrl+K from anywhere. Bound at the shell rather than in the header so
  // it works with focus anywhere on the page — including inside the sandbox
  // editor, which otherwise swallows keystrokes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Landing has no sidebar — clear mobile drawer state so it doesn't reopen
  // when navigating back into a shell route.
  useEffect(() => {
    if (!showSidebar) setSidebarOpen(false);
  }, [showSidebar]);

  return (
    <ProgressProvider totalCount={totalCount} totalProblemCount={totalProblemCount}>
      <VisitTracker />
      <ScrollbarAutoHide />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenSearch={() => setSearchOpen(true)}
          showSidebarToggle={showSidebar}
        />
        <div className="flex min-h-0 flex-1">
          {showSidebar ? (
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          ) : null}
          <main
            className={cn(
              "min-w-0 flex-1",
              ideViewport ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            <PageEnter fill={ideViewport}>{children}</PageEnter>
          </main>
        </div>
      </div>
    </ProgressProvider>
  );
}
