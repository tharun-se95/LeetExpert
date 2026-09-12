"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { allLessonIds as allNextjsLessonIds } from "@/app/courses/nextjs/manifest";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";
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
 * A module's concept map owns the viewport: the canvas is the page, so main
 * becomes a non-scrolling flex column and the map takes the leftover height.
 * Separate from isIdePath because it is not an IDE — it keeps the floating
 * lessons button and the normal chrome.
 */
export function isConceptMapPath(pathname: string): boolean {
  return /^\/courses\/dsa\/[^/]+\/concept-map\/?$/.test(pathname);
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

/** The home page is a full-width landing — no course nav chrome.
 *  /courses/dsa/marketing used to be a second route rendering the same
 *  page; it now permanently redirects to "/", so it never reaches this
 *  client-side pathname check and doesn't need a branch here. */
export function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}

/**
 * The current lesson's pattern family, derived from the route.
 *
 * This USED to also drive `themeStyleFor`, which lifted the family's accent
 * to the shell so the whole chrome (header, sidebar, buttons, focus rings)
 * tinted with the lesson's theme. That's gone: general UI is steel/indigo
 * everywhere now, one design across the app, and a family/course accent is
 * scoped to the specific components that still legitimately want it — the
 * viz tracers and curriculum-card identity that already call
 * `familyCssVars`/`singleAccentCssVars` themselves, directly on their own
 * element (`FamilySpotlight`, `VizPlayer`, `PatternLab`, `Diagram`, the
 * course-hub and module-page cards). `activeThemeFor` stays, tested and
 * exported, for exactly that use — a scoped component on a lesson page
 * that needs to know "which family is this page's content in" without the
 * shell doing any global remapping on its behalf.
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

/**
 * Grace before a pointer-out closes the drawer. Long enough to cross the gap
 * between the rail and a lesson link without the panel snapping shut, short
 * enough that it does not feel stuck open.
 */
const HOVER_CLOSE_MS = 220;
/** Hover-driven open only where a pointer can actually hover. */
const HOVER_MQ = "(hover: hover) and (pointer: fine)";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Start false so mobile never writes SIDEBAR_KEY before matchMedia runs.
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const courseSlug = activeCourseSlugFor(pathname);
  // Each course owns its own manifest and lesson-id shape, so the counts
  // ProgressProvider tracks against have to be picked per course rather
  // than always reading DSA's — otherwise a Next.js page would report
  // progress against DSA's lesson count instead of its own.
  const isNextjs = courseSlug === "nextjs";
  const lessonProgressIds = isNextjs ? allNextjsLessonIds() : allLessonsNavIds();
  const totalCount = lessonProgressIds.length;
  // The Next.js course has no separate problems hub — "solved" doesn't
  // apply to it, so 0 rather than DSA's count.
  const totalProblemCount = isNextjs ? 0 : allProblemSlugs().length;
  const ideViewport = isIdePath(pathname);
  const fillMain =
    ideViewport || isProblemsListPath(pathname) || isConceptMapPath(pathname);
  // Every /courses/nextjs/* route 404s while the course is disabled (see
  // NEXTJS_COURSE.status), but the root layout still renders AppShell
  // around that 404 body — without this, a disabled course's full sidebar
  // and progress chrome would render around content that isn't there.
  const showCourseNav =
    !isLandingPath(pathname) && (!isNextjs || NEXTJS_COURSE.status === "available");
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  // The drawer follows the pointer on hover-capable devices: an edge strip
  // opens it, leaving it closes it. Touch has no hover, so those devices keep
  // the explicit close button instead (see Sidebar's showClose).
  const [canHover, setCanHover] = useState(false);
  const hoverCloseTimer = useRef<number | null>(null);
  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }, []);
  const openOnHover = useCallback(() => {
    cancelHoverClose();
    setSidebarOpen(true);
  }, [cancelHoverClose]);
  const closeAfterGrace = useCallback(() => {
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(
      () => setSidebarOpen(false),
      HOVER_CLOSE_MS,
    );
  }, [cancelHoverClose]);

  useEffect(() => {
    const mq = window.matchMedia(HOVER_MQ);
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
    };
  }, []);
  useEffect(() => cancelHoverClose, [cancelHoverClose]);

  /**
   * Closing cannot rely on the panel's own pointerleave: the drawer slides in
   * *under* a stationary cursor, so the browser never fires pointerenter on
   * it, and with no enter there is no leave either (seen in the browser — the
   * drawer stayed open forever). Tracking the pointer against the rail's own
   * edge closes it as soon as the pointer moves away, wherever it came from.
   */
  useEffect(() => {
    if (!canHover || !sidebarOpen) return;
    const onMove = (e: PointerEvent) => {
      const rail = document.getElementById("lessons-sidebar");
      if (!rail) return;
      if (e.clientX > rail.getBoundingClientRect().right) closeAfterGrace();
      else cancelHoverClose();
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [canHover, sidebarOpen, closeAfterGrace, cancelHoverClose]);

  // Dismissible without moving the pointer (WCAG 1.4.13): Esc closes whatever
  // hover opened, and is the keyboard user's way out too.
  useEffect(() => {
    if (!sidebarOpen || !isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, isDesktop]);

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
    // Hover drives the drawer on a fine pointer, so it starts closed and the
    // edge strip brings it in; a stored preference would fight that.
    if (canHover) {
      setSidebarOpen(false);
      return;
    }
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
  }, [showCourseNav, isDesktop, canHover]);

  useEffect(() => {
    // A hover-driven drawer is transient state, not a preference — persisting
    // it would rewrite the key on every pass of the pointer.
    if (!showCourseNav || !isDesktop || canHover) return;
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen, showCourseNav, isDesktop, canHover]);

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
      <>
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
          {/* The drawer sits off-screen when closed, so the open trigger is
              this edge strip rather than the panel itself. 28px wide: a 12px
              strip needed a deliberate aim at the very edge. */}
          {showCourseNav && !ideViewport && canHover && !sidebarOpen ? (
            <div
              aria-hidden
              onPointerEnter={openOnHover}
              className="fixed top-14 bottom-0 left-0 z-30 hidden w-7 lg:block"
            />
          ) : null}
          <div className="flex h-dvh flex-col overflow-hidden">
            <Header
              onOpenSearch={() => setSearchOpen(true)}
              showLessonsMenu={showCourseNav}
              lessonsMenuOpen={mobileNavOpen}
              onToggleLessonsMenu={() => setMobileNavOpen((v) => !v)}
              showProgress={showCourseNav}
            />
            <div className="flex min-h-0 flex-1">
              {showCourseNav ? (
                <Sidebar
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  showClose={!canHover}
                  onPointerEnter={canHover ? cancelHoverClose : undefined}
                  onPointerLeave={canHover ? closeAfterGrace : undefined}
                  onFocusCapture={canHover ? cancelHoverClose : undefined}
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
      </>
    </ProgressProvider>
  );
}
