import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/md/Markdown";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import type { LoadedLesson } from "@/lib/course/load";

interface NeighborLink {
  href: string;
  title: string;
  /** Set only when this neighbor sits in a different module than the current lesson. */
  module?: string;
}

interface LessonViewProps {
  lesson: LoadedLesson;
  breadcrumbs: Crumb[];
  eyebrow: string;
  typeLabel: "Concept" | "Problem" | "Practice";
  prev: NeighborLink | null;
  next: NeighborLink | null;
  /** Interactive explorer rendered above the markdown */
  stage?: ReactNode;
  /** Minimal inline audio control, merged into the header's meta row. */
  headerAudio?: ReactNode;
  /** "Watch this lesson" link, merged into the header's meta row next to the audio control — opens the video in a dialog rather than showing it inline. */
  headerVideo?: ReactNode;
  /** Infographic, rendered inside the article after the markdown body — part of the reading flow, not a side card. */
  infographic?: ReactNode;
  /** Injected after markdown (e.g. Practice problem list). */
  afterMarkdown?: ReactNode;
  /**
   * Rendered on the desk BELOW the reading page, in its own panel — for
   * content that follows the lesson rather than belonging to it. The quiz
   * lives here: it is an exercise about the reading, not part of the reading,
   * and setting it on the same sheet made it read as one more section.
   */
  afterPage?: ReactNode;
  /**
   * Page-level JSON-LD. A slot rather than a computed value because only the
   * route knows its own path, and this component has two call sites (concept
   * and practice lessons) that would otherwise each need to wrap their return.
   */
  jsonLd?: ReactNode;
}

export function LessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  typeLabel,
  prev,
  next,
  stage,
  headerAudio,
  headerVideo,
  infographic,
  afterMarkdown,
  afterPage,
  jsonLd,
}: LessonViewProps) {
  return (
    <div className="mx-auto flex w-full justify-center gap-10 px-4 py-8 lg:px-8 lg:py-10">
      <article className="reading-column min-w-0 flex-1">
        {jsonLd}
        <Breadcrumbs items={breadcrumbs} />
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mark">
          {eyebrow}
        </p>
        <h1 className="press-overprint font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.1rem]">
          {lesson.title}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="rounded-full border border-border px-2 py-0.5 text-xs">
            {typeLabel}
          </span>
          ~{lesson.readingMinutes} min
          {headerAudio ? (
            <span className="print:hidden">{headerAudio}</span>
          ) : null}
          {headerAudio && headerVideo ? (
            <span aria-hidden className="text-border print:hidden">
              |
            </span>
          ) : null}
          {headerVideo ? (
            <span className="print:hidden">{headerVideo}</span>
          ) : null}
        </p>
        {stage ? <div className="mt-6 print:hidden">{stage}</div> : null}
        {/* Header, stage and neighbours stay on the desk; only the reading is set on paper. */}
        <div className="reading-page shadow-elevation mt-8">
          <Markdown
            source={lesson.markdown}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
          {infographic ? <div className="mt-10 print:hidden">{infographic}</div> : null}
          {afterMarkdown ? <div className="mt-2">{afterMarkdown}</div> : null}
        </div>
        {afterPage ? (
          // On the desk, NOT on a second sheet. Two reasons: design-tokens.test
          // guards that only the reading is set on paper, and Quiz options
          // already step down to a well when they sit on paper — on an elevated
          // panel they would be elevated-on-elevated and disappear. Bare on the
          // desk is also how the problem tab already renders the same quiz —
          // there because ProblemLessonView has no page at all, so the variant
          // never matches, not because that tab opted out of it.
          <div className="mt-2">{afterPage}</div>
        ) : null}
        <nav className="mt-10 flex items-stretch justify-between gap-4">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex max-w-[45%] items-center gap-3 rounded-[length:var(--radius-md)] bg-pop text-on-pop shadow-elevation px-4 py-3 text-sm transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease)] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-on-pop/15 text-on-pop transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:bg-on-pop/25 motion-reduce:transition-none">
                <ArrowLeft weight="bold" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-on-pop/70">
                  Previous{prev.module ? ` · ${prev.module}` : ""}
                </span>
                <span className="block truncate font-medium">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex max-w-[45%] items-center gap-3 rounded-[length:var(--radius-md)] bg-pop text-on-pop shadow-elevation px-4 py-3 text-right text-sm transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease)] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              <span className="min-w-0">
                <span className="block text-xs text-on-pop/70">
                  Next{next.module ? ` · ${next.module}` : ""}
                </span>
                <span className="block truncate font-medium">{next.title}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-on-pop/15 text-on-pop transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:bg-on-pop/25 motion-reduce:transition-none">
                <ArrowRight weight="bold" className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}
