import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
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
  /** Injected after markdown (e.g. Practice problem list). */
  afterMarkdown?: ReactNode;
}

export function LessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  typeLabel,
  prev,
  next,
  stage,
  afterMarkdown,
}: LessonViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 lg:px-8 lg:py-10">
      <article className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
        <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
          {lesson.title}
        </h1>
        <p className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span className="rounded-full border border-border px-2 py-0.5 text-xs">
            {typeLabel}
          </span>
          ~{lesson.readingMinutes} min
        </p>
        {stage ? <div className="mt-6 print:hidden">{stage}</div> : null}
        <div className="mt-8">
          <Markdown
            source={lesson.markdown}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>
        {afterMarkdown ? <div className="mt-2">{afterMarkdown}</div> : null}
        <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex max-w-[45%] items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-accent/35 hover:bg-accent/[0.04]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent/15">
                <ArrowLeft weight="bold" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted">
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
              className="group flex max-w-[45%] items-center gap-3 rounded-lg border border-border px-4 py-3 text-right text-sm transition hover:border-accent/35 hover:bg-accent/[0.04]"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted">
                  Next{next.module ? ` · ${next.module}` : ""}
                </span>
                <span className="block truncate font-medium">{next.title}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent/15">
                <ArrowRight weight="bold" className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
      <aside className="print:hidden hidden w-52 shrink-0 xl:block">
        <TableOfContents items={lesson.toc} />
      </aside>
    </div>
  );
}
