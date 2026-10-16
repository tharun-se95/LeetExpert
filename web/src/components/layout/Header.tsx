"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, SidebarSimple } from "@phosphor-icons/react";
import { AccountControl } from "@/components/auth/AccountControl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Lamp } from "@/components/brand/Lamp";
import { CodeLangSwitch } from "@/components/layout/CodeLangSwitch";
import {
  LOGO_LAMP_SIZE,
  NAV_LINK,
  NAV_LINK_ACTIVE,
  ROUND_CONTROL,
  WORDMARK,
  THEME_TOGGLE,
} from "@/components/layout/headerChrome";
import { useSidebarOptional } from "@/components/layout/SidebarContext";
import { useProgress } from "@/components/providers/ProgressProvider";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { COURSES } from "@/lib/courses/registry";
import { DSA_COURSE } from "@/app/courses/dsa/registry";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSearch: () => void;
  /** Show the mobile Lessons sheet trigger (course chrome, below lg). */
  showLessonsMenu?: boolean;
  lessonsMenuOpen?: boolean;
  onToggleLessonsMenu?: () => void;
  /** Progress chip is course chrome — hidden on the marketing landing. */
  showProgress?: boolean;
  /** Show the JS/Python code language switch (course chrome, DSA). */
  showCodeLang?: boolean;
}

export function Header({
  onOpenSearch,
  showLessonsMenu = false,
  lessonsMenuOpen = false,
  onToggleLessonsMenu,
  showProgress = true,
  showCodeLang = true,
}: HeaderProps) {
  const pathname = usePathname();
  const sidebar = useSidebarOptional();
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const courseSlug = activeCourseSlugFor(pathname);
  const routeCourse = COURSES.find((c) => c.slug === courseSlug);
  // A disabled course's own name never surfaces in chrome — including on
  // its own now-404 pages, since the route still resolves a slug for
  // activeCourseSlugFor even though there's no real content there anymore.
  // Falls back to DSA, the one course guaranteed available.
  const course = routeCourse?.status === "available" ? routeCourse : DSA_COURSE;
  const courseLabel = course.navLabel ?? course.title;

  const lessonsActive =
    pathname === "/courses/dsa" ||
    (pathname.startsWith("/courses/dsa/") &&
      !pathname.startsWith("/courses/dsa/problems"));
  const practiceActive = pathname.startsWith("/courses/dsa/problems");
  const nextjsCurriculumActive = pathname.startsWith("/courses/nextjs");

  // The landing header's nav: full ink, no pill. The current mode carries a
  // steady underline and aria-current rather than a filled chip.
  const modeLinkClass = (active: boolean) => cn(NAV_LINK, active && NAV_LINK_ACTIVE);

  return (
    <header className="print:hidden absolute inset-x-0 top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-background/90 backdrop-blur-md shadow-edge-bottom px-3 sm:gap-3 sm:px-4 lg:flex lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
        {showLessonsMenu ? (
          <>
            {onToggleLessonsMenu ? (
              <button
                type="button"
                onClick={onToggleLessonsMenu}
                aria-expanded={lessonsMenuOpen}
                aria-controls="mobile-lessons-sheet"
                aria-label={lessonsMenuOpen ? "Close lessons menu" : "Open lessons menu"}
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-xs)] text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              >
                <SidebarSimple
                  className="h-5 w-5"
                  weight={lessonsMenuOpen ? "fill" : "regular"}
                  aria-hidden
                />
              </button>
            ) : null}

            {sidebar ? (
              <button
                type="button"
                onClick={sidebar.toggle}
                aria-expanded={sidebar.open}
                aria-controls="lessons-sidebar"
                aria-label={sidebar.open ? "Close lessons drawer" : "Open lessons drawer"}
                className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-xs)] text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              >
                <SidebarSimple
                  className="h-[18px] w-[18px]"
                  weight={sidebar.open ? "fill" : "regular"}
                  aria-hidden
                />
              </button>
            ) : null}
          </>
        ) : null}
        <Link href="/" className="lamp-link flex min-w-0 items-center gap-2.5">
          <span className="flex min-w-0 items-baseline gap-2">
            {/*
              When the lessons menu button is present, the wordmark gives up its
              room below sm so left + centered modes + right icons fit ~375px
              without overlap. sr-only, not hidden: the lamp is aria-hidden, so
              this text is the link's only accessible name at every width.
            */}
            {/*
              The green signal ends the name, centred on the wordmark in a
              group of its own. The row aligns baselines so the wordmark and
              the fixed-size course label stay level; in that row the text sits
              at the top of a line the 26px lamp makes taller, so a lamp
              centred on the row landed (26 − line height) / 2 low. The group
              reports the wordmark's baseline to the row, so the label still
              lines up with it. tests/appHeaderLampAlign.test.tsx guards this.
            */}
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(WORDMARK, showLessonsMenu && "max-sm:sr-only")}
              >
                <span className="text-foreground">leet</span>
                <span className="text-mark">Expert</span>
              </span>
              {/* The negative margin takes back the halo's transparent edge,
                  only where the wordmark is actually beside it. */}
              <Lamp
                size={LOGO_LAMP_SIZE}
                bloom
                className={showLessonsMenu ? "sm:-ml-1" : "-ml-1"}
              />
            </span>
            <span
              className="hidden h-3.5 w-px shrink-0 bg-border md:block"
              aria-hidden
            />
            <span className="hidden truncate text-[13px] font-medium text-muted md:inline">
              {courseLabel}
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="max-lg:flex lg:hidden shrink-0 items-center gap-5 justify-self-center sm:gap-8"
        aria-label="Product modes"
      >
        {courseSlug === "nextjs" && routeCourse?.status === "available" ? (
          <Link
            href="/courses/nextjs"
            className={modeLinkClass(nextjsCurriculumActive)}
            aria-current={nextjsCurriculumActive ? "page" : undefined}
          >
            Curriculum
          </Link>
        ) : (
          <>
            <Link
              href="/courses/dsa"
              className={modeLinkClass(lessonsActive)}
              aria-current={lessonsActive ? "page" : undefined}
            >
              Lessons
            </Link>
            <Link
              href="/courses/dsa/problems"
              className={modeLinkClass(practiceActive)}
              aria-current={practiceActive ? "page" : undefined}
            >
              Practice
            </Link>
          </>
        )}
      </nav>

      <div className="col-start-3 ml-auto flex min-w-0 items-center justify-end gap-1.5 justify-self-end sm:gap-2 md:gap-3">
        {showCodeLang && courseSlug !== "nextjs" ? <CodeLangSwitch /> : null}

        {/*
          Icon-only below md: the Search+⌘K pill was the main collision with
          centered Lessons/Practice in the 640–768px band (1fr_auto_1fr).
        */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search lessons and problems"
          className={cn(ROUND_CONTROL, "h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm")}
        >
          <MagnifyingGlass className="h-4 w-4" aria-hidden />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden font-mono text-[11px] md:inline">⌘K</kbd>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {showProgress ? (
            <div
              className="flex h-10 items-center gap-2 rounded-full border border-border px-3 text-[11px] text-muted"
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

        <ThemeToggle className={THEME_TOGGLE} />
        <AccountControl />
      </div>
    </header>
  );
}
