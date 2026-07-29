import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import type { LoadedLesson } from "@/lib/course/load";
import type { SandboxExtraction } from "@/lib/content/extractSandboxFence";

interface NeighborLink {
  href: string;
  title: string;
}

interface ProblemLessonViewProps {
  /** `sandbox` narrowed non-null by the caller — see the route */
  lesson: LoadedLesson & { sandbox: SandboxExtraction };
  breadcrumbs: Crumb[];
  eyebrow: string;
  prev: NeighborLink | null;
  next: NeighborLink | null;
}

export function ProblemLessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  prev,
  next,
}: ProblemLessonViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
        {eyebrow}
      </p>
      <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
        {lesson.title}
      </h1>
      <p className="mt-2 flex items-center gap-3 text-sm text-muted">
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">
          Problem
        </span>
        ~{lesson.readingMinutes} min
      </p>

      <div className="problem-layout mt-8">
        <div className="problem-layout-before min-w-0">
          <Markdown
            source={lesson.sandbox.beforeSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>

        <div className="problem-layout-sandbox min-w-0 print:hidden">
          <TableOfContents items={lesson.toc} />
          <div className="mt-6">
            <Sandbox source={lesson.sandbox.sandboxSource} />
          </div>
        </div>

        <div className="problem-layout-after min-w-0">
          <Markdown
            source={lesson.sandbox.afterSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>
      </div>

      <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
          >
            <ArrowLeft weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
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
            <ArrowRight weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
