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
import { allLessonsNavIds, allProblemSlugs } from "@/lib/course/manifest";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "dsa-sidebar-open";

function isIdePath(pathname: string): boolean {
  return /^\/problems\/[^/]+\/?$/.test(pathname);
}

/** Course overview is a full-width landing — no course nav chrome. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const lessonProgressIds = allLessonsNavIds();
  const totalCount = lessonProgressIds.length;
  const totalProblemCount = allProblemSlugs().length;
  const pathname = usePathname();
  const ideViewport = isIdePath(pathname);
  const showSidebar = !isLandingPath(pathname);

  useEffect(() => {
    if (!showSidebar) return;
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (raw === "0" || raw === "1") {
        setSidebarOpen(raw === "1");
        return;
      }
    } catch {
      /* ignore */
    }
    setSidebarOpen(!isMobileViewport());
  }, [showSidebar]);

  useEffect(() => {
    if (!showSidebar) return;
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen, showSidebar]);

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

  return (
    <ProgressProvider
      totalCount={totalCount}
      totalProblemCount={totalProblemCount}
      lessonProgressIds={lessonProgressIds}
    >
      <VisitTracker />
      <ScrollbarAutoHide />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header onOpenSearch={() => setSearchOpen(true)} />
        <div className="flex min-h-0 flex-1">
          {showSidebar ? (
            <Sidebar
              open={sidebarOpen}
              onOpen={() => setSidebarOpen(true)}
              onClose={() => setSidebarOpen(false)}
              onNavigate={() => {
                if (isMobileViewport()) setSidebarOpen(false);
              }}
            />
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
