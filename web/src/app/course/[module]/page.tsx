import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Puzzle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getModule, STAGES } from "@/lib/course/manifest";
import { allModuleSlugs } from "@/lib/course/load";
import { lessonHref } from "@/lib/course/nav";

interface PageProps {
  params: Promise<{ module: string }>;
}

export function generateStaticParams() {
  return allModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = getModule(slug);
  return { title: mod ? mod.title : "Course" };
}

export default async function ModulePage({ params }: PageProps) {
  const { module: slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const stage = STAGES.find((s) => s.number === mod.stage);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
      <Breadcrumbs
        items={[{ label: "Course", href: "/" }, { label: mod.title }]}
      />
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
        Stage {mod.stage} — {stage?.title} · Module {mod.number}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-[2rem]">
        {mod.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
        {mod.description}
      </p>

      {mod.status === "coming-soon" ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-surface/40 p-6">
          <p className="text-sm font-medium">Coming soon</p>
          <p className="mt-1 text-sm text-muted">
            This module hasn&apos;t been written yet. Modules are being built
            in curriculum order — earlier modules come first.
          </p>
        </div>
      ) : (
        <ol className="mt-10 grid gap-2">
          {mod.lessons.map((lesson, i) => (
            <li key={lesson.slug}>
              <Link
                href={lessonHref(mod.slug, lesson.slug)}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
              >
                <span className="w-6 shrink-0 tabular-nums text-muted">
                  {i + 1}.
                </span>
                {lesson.type === "problem" ? (
                  <Puzzle className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <BookOpen className="h-4 w-4 shrink-0 text-accent" />
                )}
                <span className="font-medium">{lesson.title}</span>
                <span className="ml-auto text-xs uppercase tracking-wide text-muted/70">
                  {lesson.type}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
