"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { buildCourseNav } from "@/lib/course/nav";
import { FIRST_LESSON } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

/**
 * For returning learners: continue from the first incomplete lesson in
 * curriculum order, or fall back to the first lesson.
 */
export function ContinueBanner() {
  const { visited, visitedCount } = useProgress();
  const [href, setHref] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (visitedCount === 0) {
      setHref(null);
      return;
    }
    const nav = buildCourseNav();
    for (const stage of nav) {
      for (const mod of stage.modules) {
        for (const lesson of mod.lessons) {
          if (!visited.has(lesson.id)) {
            setHref(lesson.href);
            setTitle(lesson.title);
            return;
          }
        }
      }
    }
    // Everything visited — send them to the curriculum.
    setHref("/course");
    setTitle("Course overview");
  }, [visited, visitedCount]);

  if (!href || visitedCount === 0) return null;

  return (
    <div className="border-b border-border bg-accent/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <p className="text-sm text-foreground">
          Welcome back —{" "}
          <span className="text-muted">
            {visitedCount} lesson{visitedCount === 1 ? "" : "s"} visited.
          </span>
        </p>
        <Link
          href={href}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-semibold text-mark transition hover:text-foreground",
          )}
        >
          Continue: {title}
          <ArrowRight weight="bold" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function StickyCta() {
  const [scrolledPast, setScrolledPast] = useState(false);
  const [closingVisible, setClosingVisible] = useState(false);

  useEffect(() => {
    // AppShell scrolls <main>, not the window — window.scrollY stays 0.
    const root =
      document.querySelector("main") ??
      (document.scrollingElement as HTMLElement | null) ??
      null;

    const readTop = () =>
      root && "scrollTop" in root ? root.scrollTop : window.scrollY;

    const onScroll = () => setScrolledPast(readTop() > 480);
    onScroll();

    const target: HTMLElement | Window = root ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // The closing pop slab repeats this bar's exact CTAs — hide the bar once
    // it's on screen so the two pairs never show together.
    const closing = document.getElementById("closing-cta");
    if (!closing) return;

    const observer = new IntersectionObserver(
      ([entry]) => setClosingVisible(!!entry?.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(closing);
    return () => observer.disconnect();
  }, []);

  const visible = scrolledPast && !closingVisible;

  return (
    <div
      className={cn(
        "print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <p className="hidden text-sm text-muted sm:block">
          Early bird · free for a limited time
        </p>
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial">
          <Link
            href="/course"
            className="rounded-[length:var(--radius-md)] border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface"
          >
            Curriculum
          </Link>
          <Link
            href={FIRST_LESSON}
            className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] bg-pop px-3 py-2 text-sm font-semibold text-on-pop transition hover:opacity-90"
          >
            Start free
            <ArrowRight weight="bold" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
