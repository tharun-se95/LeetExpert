"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AccountRuntime } from "@/components/auth/AccountRuntime";
import { Header } from "@/components/layout/Header";
import { FloatingLessonsButton } from "@/components/layout/FloatingLessonsButton";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { MobileLessonsSheet } from "@/components/layout/MobileLessonsSheet";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { SyncBridgeProvider } from "@/components/providers/SyncBridge";
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

/** The account's sign-in page: not a course page, so no lessons drawer or
 *  progress chrome (owner, 2026-09-24 — the drawer opens by default, and on
 *  /sign-in it took 320px beside a card about accounts). */
export function isSignInPath(pathname: string): boolean {
  return pathname === "/sign-in" || pathname.startsWith("/sign-in/");
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
 * element (`VizPlayer`, `PatternLab`, `Diagram`, the
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

export function AppShell({ children, authEnabled = false }: { children: React.ReactNode; authEnabled?: boolean }) {
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
  const landing = isLandingPath(pathname);
  const showCourseNav =
    !landing && !isSignInPath(pathname) && (!isNextjs || NEXTJS_COURSE.status === "available");
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  // Esc is a second, keyboard-only way to close the drawer (WCAG 1.4.13),
  // alongside the explicit close button in its own header row — the drawer
  // opens by default and by the floating button, and closes only from one of
  // these two deliberate actions, never from the pointer moving away.
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
  // Open by default: a reader who never touched the close button gets the
  // drawer every visit. A stored preference only exists once they've closed
  // it themselves, and is honoured until they reopen it.
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

  // The landing header is sticky and gains a translucent paper once content
  // scrolls beneath it. A sentinel at the page top, observed against <main>,
  // rather than a scroll listener: a landing page restored mid-scroll fires no
  // scroll event (measured 2026-09-14), which would leave the header clear
  // over text.
  const landingTop = useRef<HTMLDivElement>(null);
  const [landingScrolled, setLandingScrolled] = useState(false);
  useEffect(() => {
    const sentinel = landingTop.current;
    if (!landing || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLandingScrolled(!(entry?.isIntersecting ?? true)),
      { root: sentinel.closest("main") },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [landing]);

  return (
    <SyncBridgeProvider authEnabled={authEnabled}>
    <ProgressProvider
      courseSlug={courseSlug}
      totalCount={totalCount}
      totalProblemCount={totalProblemCount}
      lessonProgressIds={lessonProgressIds}
    >
      <>
        <VisitTracker />
        <AccountRuntime />
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
            The drawer opener: one round floating button, bottom-left, on every
            page with the course nav, problem pages included — never in the app
            Header, which carries only search, progress and theme. Hidden while
            the drawer is open (FloatingLessonsButton), which it is by default.
          */}
          {showCourseNav ? <FloatingLessonsButton /> : null}
          <div className="relative flex h-dvh flex-col overflow-hidden">
            {/*
              The app header overlays the page (absolute, translucent with blur;
              spec 2026-09-15): the page scrolls up under it, so it is the
              positioning context here and the desk wrapper below starts its
              content 3.5rem down. The landing page renders its own header
              inside <main> instead.
            */}
            {landing ? null : (
              <Header
                onOpenSearch={() => setSearchOpen(true)}
                showLessonsMenu={showCourseNav}
                lessonsMenuOpen={mobileNavOpen}
                onToggleLessonsMenu={() => setMobileNavOpen((v) => !v)}
                showProgress={showCourseNav}
              />
            )}
            <div className="flex min-h-0 flex-1">
              {showCourseNav ? (
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              ) : null}
              {/*
                relative: <main> is the only scroller inside an h-dvh,
                overflow-hidden shell, so it must also be the containing block
                for anything positioned inside a page. Without it, an absolute
                element with no positioned ancestor — the Cheatsheet table's
                sr-only <caption> — resolved against the initial containing
                block, escaped the shell's clip and made the document scrollable
                (577px on the Strings practice page): Page Down dragged the whole
                shell up over blank background.
              */}
              <main
                className={cn(
                  "relative min-w-0 flex-1",
                  fillMain
                    ? "flex min-h-0 flex-col overflow-hidden"
                    : "overflow-y-auto",
                )}
              >
                {/*
                  The app's desk, inside the scroller so it moves with the
                  content, once per page. isolate keeps a page's own z-index
                  layers (the landing hero's floor, its copy and its strip)
                  inside the page, under the headers. The app Header overlays it
                  translucently and the drawer sits beside it, both outside
                  <main>; pt-14 starts the page below the header it scrolls
                  under. On / the landing header
                  lives in here, above the page and outside PageEnter so it
                  does not replay the page's rise.
                */}
                <div
                  className={cn(
                    "relative isolate",
                    fillMain ? "flex min-h-0 flex-1 flex-col" : "min-h-full",
                    !landing && "pt-14",
                  )}
                >
                  {landing ? (
                    <>
                      <div
                        ref={landingTop}
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      />
                      <LandingHeader
                        onOpenSearch={() => setSearchOpen(true)}
                        scrolled={landingScrolled}
                      />
                    </>
                  ) : null}
                  <PageEnter fill={fillMain}>{children}</PageEnter>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </>
    </ProgressProvider>
    </SyncBridgeProvider>
  );
}
