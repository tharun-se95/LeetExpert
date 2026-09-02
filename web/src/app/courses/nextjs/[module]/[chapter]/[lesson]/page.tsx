import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { allNextjsLessonParams, loadNextjsLesson } from "../../../load";
import { getLesson, MODULES } from "../../../manifest";

interface PageProps {
  params: Promise<{ module: string; chapter: string; lesson: string }>;
}

export function generateStaticParams() {
  return allNextjsLessonParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: moduleSlug, chapter: chapterSlug, lesson: lessonSlug } =
    await params;
  const hit = getLesson(moduleSlug, chapterSlug, lessonSlug);
  return { title: hit ? hit.lesson.title : "Lesson" };
}

const PRACTICE_FORMAT_LABEL: Record<string, string> = {
  trace: "Trace-the-Execution / Spot-the-Bug",
  sandbox: "Semi-Constrained Sandbox",
  "pr-review": "Pull Request Code Review",
  "canvas-defense": "Architectural Canvas + Defense",
};

/** Flat, ordered list of every lesson id for prev/next navigation. */
function flatLessonList() {
  return MODULES.flatMap((m) =>
    m.chapters.flatMap((c) =>
      c.lessons.map((l) => ({
        module: m.slug,
        chapter: c.slug,
        lesson: l.slug,
        title: l.title,
      })),
    ),
  );
}

export default async function NextjsLessonPage({ params }: PageProps) {
  const { module: moduleSlug, chapter: chapterSlug, lesson: lessonSlug } =
    await params;
  const hit = getLesson(moduleSlug, chapterSlug, lessonSlug);
  if (!hit) notFound();

  const loaded = await loadNextjsLesson(moduleSlug, chapterSlug, lessonSlug);
  if (!loaded) {
    // Content not written yet for this lesson (Phase 4 in progress) —
    // an honest "not yet available" state, not a 404 (the lesson is a
    // real, planned part of the curriculum, just not authored yet).
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Next.js Course", href: "/courses/nextjs" },
            { label: hit.module.title, href: `/courses/nextjs/${moduleSlug}` },
            { label: hit.lesson.title },
          ]}
        />
        <div className="mt-8 flex flex-col items-center gap-3 rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 text-center shadow-elevation">
          <Wrench className="h-6 w-6 text-muted" weight="regular" />
          <h1 className="text-lg font-semibold text-foreground">
            {hit.lesson.title}
          </h1>
          <p className="max-w-md text-sm text-muted">{hit.lesson.scope}</p>
          <p className="text-xs text-muted">
            This lesson is part of the course curriculum but its content
            hasn&rsquo;t been written yet.
          </p>
        </div>
      </div>
    );
  }

  const flat = flatLessonList();
  const idx = flat.findIndex(
    (l) =>
      l.module === moduleSlug && l.chapter === chapterSlug && l.lesson === lessonSlug,
  );
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_240px] lg:px-8 lg:py-12">
      <article className="min-w-0">
        <Breadcrumbs
          items={[
            { label: "Next.js Course", href: "/courses/nextjs" },
            { label: hit.module.title, href: `/courses/nextjs/${moduleSlug}` },
            { label: hit.chapter.title },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-[length:var(--radius-xs)] border border-border px-1.5 py-0.5 text-xs text-muted">
            {hit.lesson.depth === "essential" ? "Essential" : "Advanced"}
          </span>
          <span className="text-xs text-muted">
            {loaded.readingMinutes} min read
          </span>
        </div>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {loaded.title}
        </h1>

        <div className="mt-6">
          <Markdown
            source={loaded.markdown}
            highlightedBlocks={loaded.highlightedBlocks}
            highlightedTabs={loaded.highlightedTabs}
          />
        </div>

        {hit.lesson.practiceFormat && !loaded.hasEmbeddedPractice ? (
          <div className="mt-10 rounded-[length:var(--radius-lg)] border border-dashed border-border bg-surface p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Wrench className="h-4 w-4" weight="bold" />
              Practice — {PRACTICE_FORMAT_LABEL[hit.lesson.practiceFormat]}
            </p>
            <p className="mt-2 text-sm text-foreground">
              {hit.lesson.practiceScenario}
            </p>
            <p className="mt-3 text-xs text-muted">
              This lesson&rsquo;s interactive drill hasn&rsquo;t been wired
              up yet — see Phase 3 of the course build-out plan.
            </p>
          </div>
        ) : null}

        <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
          {prev ? (
            <Link
              href={`/courses/nextjs/${prev.module}/${prev.chapter}/${prev.lesson}`}
              className="flex min-w-0 items-center gap-2 text-sm text-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" weight="bold" />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/courses/nextjs/${next.module}/${next.chapter}/${next.lesson}`}
              className="flex min-w-0 items-center gap-2 text-right text-sm text-muted hover:text-foreground"
            >
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" weight="bold" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TableOfContents items={loaded.toc} />
        </div>
      </aside>
    </div>
  );
}
