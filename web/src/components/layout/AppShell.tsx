"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FloatingLessonsButton } from "@/components/layout/FloatingLessonsButton";
import { MobileLessonsSheet } from "@/components/layout/MobileLessonsSheet";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { ScrollbarAutoHide } from "@/components/providers/ScrollbarAutoHide";
import { VisitTracker } from "@/components/providers/VisitTracker";
import {
  allLessonsNavIds,
  allProblemSlugs,
  findProblemBySlug,
  moduleFamily,
} from "@/lib/course/manifest";
import { familyCssVars } from "@/lib/visual/familyTheme";
import type { FamilyId } from "@/lib/content/manifest";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "dsa-sidebar-open";

/** Matches Tailwind `lg` — persistent sidebar only at this width and above. */
const DESKTOP_MQ = "(min-width: 1024px)";

/** Exported for `appShellRouting.test.ts` — these are pure route-matching
 *  functions with no React dependency, and had zero test coverage until a
 *  final-review pass caught `isIdePath` still matching the pre-migration
 *  `/problems/[slug]` shape instead of `/courses/dsa/problems/[slug]`. */
export function isIdePath(pathname: string): boolean {
  return /^\/courses\/dsa\/problems\/[^/]+\/?$/.test(pathname);
}

/**
 * The problems list also needs a viewport-locked main — its filter sidebar
 * and result list scroll internally, not the page, so a fixed height chrome
 * above them doesn't leave `main` scrolling to reveal blank space beneath a
 * shorter column (see ProblemsListClient.tsx).
 */
function isProblemsListPath(pathname: string): boolean {
  return (
    pathname === "/courses/dsa/problems" ||
    pathname === "/courses/dsa/problems/"
  );
}

/** Both the catalog root and DSA's own marketing page are full-width
 *  landings — no course nav chrome. */
export function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/courses/dsa/marketing";
}

/**
 * The current topic's theme, derived from the route. Lifted to the shell
 * so the whole chrome (header, sidebar, mobile sheet, search) tints with
 * the lesson's theme instead of staying steel. List/landing routes have no
 * single topic → null → monochrome.
 *
 * DSA resolves its theme via its own 7-family lookup (moduleFamily). A
 * future course under /courses/<slug>/ can dispatch to whatever theming
 * logic it wants here — one accent per module, a single course-wide
 * accent, or none — this function is the one place that needs a new
 * branch per course, not a shared family system every course must adopt.
 */
export function activeThemeFor(pathname: string): FamilyId | null {
  const dsaModule = /^\/courses\/dsa\/(?!problems(?:\/|$))([^/]+)/.exec(
    pathname,
  );
  if (dsaModule) return moduleFamily(dsaModule[1]);
  const dsaProblem = /^\/courses\/dsa\/problems\/([^/]+)/.exec(pathname);
  if (dsaProblem) {
    const hit = findProblemBySlug(dsaProblem[1]);
    if (hit) return moduleFamily(hit.module);
  }
  return null;
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
  const courseSlug = activeCourseSlugFor(pathname);
  const ideViewport = isIdePath(pathname);
  const fillMain = ideViewport || isProblemsListPath(pathname);
  const showCourseNav = !isLandingPath(pathname);
  // The lesson/problem counts above are DSA-specific (allLessonsNavIds()
  // reads DSA's manifest only) — progress tracking for other courses
  // hasn't been wired up yet (a deliberately deferred item, see
  // docs/superpowers/plans/2026-09-02-nextjs-course-tasks.md Phase 2), so
  // showing the chip there would display DSA's totals on someone else's
  // course rather than something honestly empty or absent.
  const showProgress = showCourseNav && courseSlug === "dsa";
  const family = activeThemeFor(pathname);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

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
      courseSlug={courseSlug}
      totalCount={totalCount}
      totalProblemCount={totalProblemCount}
      lessonProgressIds={lessonProgressIds}
    >
      <div
        className="contents"
        style={family ? familyCssVars(family) : undefined}
      >
        <VisitTracker />
        <ScrollbarAutoHide />
        <SidebarProvider open={sidebarOpen} toggle={toggleSidebar}>
          <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
          {showCourseNav ? (
            <MobileLessonsSheet
              open={mobileNavOpen}
              onClose={() => setMobileNavOpen(false)}
            />
          ) : null}
          {/*
            The drawer opener lives here (lesson pages) or inline next to the
            problem title (ProblemWorkspace's own header) — never in the app
            Header, which now carries only search, progress and theme.
          */}
          {showCourseNav && !ideViewport ? <FloatingLessonsButton /> : null}
          <div className="flex h-dvh flex-col overflow-hidden">
            <Header
              onOpenSearch={() => setSearchOpen(true)}
              showLessonsMenu={showCourseNav}
              lessonsMenuOpen={mobileNavOpen}
              onToggleLessonsMenu={() => setMobileNavOpen((v) => !v)}
              showProgress={showProgress}
            />
            <div className="flex min-h-0 flex-1">
              {showCourseNav ? (
                <Sidebar
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              ) : null}
              <main
                className={cn(
                  "min-w-0 flex-1",
                  fillMain
                    ? "flex min-h-0 flex-col overflow-hidden"
                    : "overflow-y-auto",
                )}
              >
                <PageEnter fill={fillMain}>{children}</PageEnter>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ProgressProvider>
  );
}
