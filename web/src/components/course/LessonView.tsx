import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import type { LoadedLesson } from "@/lib/course/load";

interface NeighborLink {
  href: string;
  title: string;
}

interface LessonViewProps {
  lesson: LoadedLesson;
  breadcrumbs: Crumb[];
  eyebrow: string;
  typeLabel: "Concept" | "Problem";
  prev: NeighborLink | null;
  next: NeighborLink | null;
  /** Interactive explorer rendered above the markdown */
  stage?: ReactNode;
}

export function LessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  typeLabel,
  prev,
  next,
  stage,
}: LessonViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 lg:px-8 lg:py-10">
      <article className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-[2rem]">
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
          <Markdown source={lesson.markdown} />
        </div>
        <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
              <span className="min-w-0">
                <span className="block text-xs text-muted">Previous</span>
                <span className="block truncate font-medium">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-right text-sm transition hover:border-foreground/25 hover:bg-surface"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted">Next</span>
                <span className="block truncate font-medium">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
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
