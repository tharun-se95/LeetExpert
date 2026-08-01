"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileLessonsSheet } from "@/components/layout/MobileLessonsSheet";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { ScrollbarAutoHide } from "@/components/providers/ScrollbarAutoHide";
import { VisitTracker } from "@/components/providers/VisitTracker";
import { allLessonsNavIds, allProblemSlugs } from "@/lib/course/manifest";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "dsa-sidebar-open";

/** Matches Tailwind `lg` — persistent sidebar only at this width and above. */
const DESKTOP_MQ = "(min-width: 1024px)";

function isIdePath(pathname: string): boolean {
  return /^\/problems\/[^/]+\/?$/.test(pathname);
}

/** Course overview is a full-width landing — no course nav chrome. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Start false so mobile never writes SIDEBAR_KEY before matchMedia runs.
  const [isDesktop, setIsDesktop] = useState(false);
  const lessonProgressIds = allLessonsNavIds();
  const totalCount = lessonProgressIds.length;
  const totalProblemCount = allProblemSlugs().length;
  const pathname = usePathname();
  const ideViewport = isIdePath(pathname);
  const showCourseNav = !isLandingPath(pathname);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      // Leaving mobile: drop the sheet so it doesn't flash open on resize.
      if (desktop) setMobileNavOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Desktop open/closed preference only — mobile sheet must not overwrite it.
  useEffect(() => {
    if (!showCourseNav || !isDesktop) return;
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (raw === "0" || raw === "1") {
        setSidebarOpen(raw === "1");
        return;
      }
    } catch {
      /* ignore */
    }
    setSidebarOpen(true);
  }, [showCourseNav, isDesktop]);

  useEffect(() => {
    if (!showCourseNav || !isDesktop) return;
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen, showCourseNav, isDesktop]);

  // Close the mobile sheet after in-app navigation.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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
      {showCourseNav ? (
        <MobileLessonsSheet
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      ) : null}
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          showLessonsMenu={showCourseNav}
          lessonsMenuOpen={mobileNavOpen}
          onToggleLessonsMenu={() => setMobileNavOpen((v) => !v)}
        />
        <div className="flex min-h-0 flex-1">
          {showCourseNav ? (
            <Sidebar
              open={sidebarOpen}
              onOpen={() => setSidebarOpen(true)}
              onClose={() => setSidebarOpen(false)}
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
