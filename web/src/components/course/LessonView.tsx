import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
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

        {/* Elevated Chapter Header Card (Matching Fanout.sh's integrated chapter header) */}
        <header className="rounded-[length:var(--radius-lg)] border border-border/80 bg-surface/60 p-6 sm:p-8 shadow-elevation backdrop-blur-xs mb-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <Breadcrumbs items={breadcrumbs} className="mb-0" />
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border/80 bg-elevated px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent shadow-elevation">
                {eyebrow}
              </span>
              <span className="rounded-full border border-border/80 bg-elevated px-2.5 py-0.5 font-mono text-[11px] text-muted shadow-elevation">
                {typeLabel}
              </span>
            </div>
          </div>
          <h1 className="press-overprint font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.6rem] text-foreground">
            {lesson.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-muted border-t border-border/60 pt-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock weight="bold" className="h-3.5 w-3.5 text-accent" />
              ~{lesson.readingMinutes} min read
            </span>
            {headerAudio ? (
              <span className="flex items-center gap-1.5 print:hidden">
                <span aria-hidden className="text-border">·</span>
                {headerAudio}
              </span>
            ) : null}
            {headerAudio && headerVideo ? (
              <span aria-hidden className="text-border print:hidden">
                |
              </span>
            ) : null}
            {headerVideo ? (
              <span className="flex items-center gap-1.5 print:hidden">
                <span aria-hidden className="text-border">·</span>
                {headerVideo}
              </span>
            ) : null}
          </div>
        </header>

        {stage ? (
          <div className="overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-code shadow-elevation mb-8 print:hidden">
            <div className="flex items-center justify-between border-b border-border/80 bg-surface/80 px-4 py-2.5 text-xs font-mono text-muted">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Interactive Stage
              </span>
              <span className="text-[11px] text-muted font-mono">Live In-Browser Explorer</span>
            </div>
            <div className="p-4 sm:p-6">{stage}</div>
          </div>
        ) : null}

        {/* Fanout-style Notes Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <div className="relative rounded-full border border-border/80 bg-surface px-4 py-1 text-[11px] font-mono uppercase tracking-widest text-muted shadow-elevation">
            Lesson Notes
          </div>
        </div>

        {/* Header, stage and neighbours stay on the desk; only the reading is set on paper. */}
        <div className="reading-page shadow-elevation mt-4">
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
              className="group flex max-w-[48%] sm:max-w-[45%] items-center gap-3.5 rounded-[length:var(--radius-md)] bg-elevated border border-border/80 shadow-elevation px-4 py-3.5 text-sm transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent/40 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface/60 text-muted transition-all duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent arrow-badge-glow motion-reduce:transition-none">
                <ArrowLeft weight="bold" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-muted group-hover:text-accent transition-colors">
                  Previous{prev.module ? ` · ${prev.module}` : ""}
                </span>
                <span className="block truncate font-medium text-foreground">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex max-w-[48%] sm:max-w-[45%] items-center gap-3.5 rounded-[length:var(--radius-md)] bg-elevated border border-border/80 shadow-elevation px-4 py-3.5 text-right text-sm transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent/40 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-muted group-hover:text-accent transition-colors">
                  Next{next.module ? ` · ${next.module}` : ""}
                </span>
                <span className="block truncate font-medium text-foreground">{next.title}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface/60 text-muted transition-all duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent arrow-badge-glow motion-reduce:transition-none">
                <ArrowRight weight="bold" className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      {lesson.toc && lesson.toc.length >= 2 ? (
        <aside className="hidden 2xl:block w-64 shrink-0 print:hidden">
          <div className="sticky top-20">
            <TableOfContents items={lesson.toc} />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
