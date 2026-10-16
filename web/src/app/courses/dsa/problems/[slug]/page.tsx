import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";
import { loadLesson, readLessonMarkdown } from "@/lib/course/load";
import {
  findProblemBySlug,
  getProblemNeighbors,
  allProblemSlugs,
} from "@/lib/course/manifest";
import { lessonHref, moduleHref, problemHref } from "@/lib/course/nav";
import { canonicalFor } from "@/lib/seo/site";
import { metaDescription } from "@/lib/seo/description";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, learningResourceLd } from "@/lib/seo/jsonLd";
import { splitProblemTabs } from "@/lib/content/splitProblemTabs";
import { extractHints } from "@/lib/coach/extractHints";
import {
  getAllCatalogExtraSlugs,
  getCatalogExtraProblem,
} from "@/lib/course/catalog/catalogExtraProblems";
import {
  loadCatalogLesson,
  getCatalogProblemNeighbors,
} from "@/lib/course/catalog/catalogLessonLoader";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const coreSlugs = allProblemSlugs();
  const extraSlugs = getAllCatalogExtraSlugs();
  return [...coreSlugs, ...extraSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);
  if (hit) {
    const body = readLessonMarkdown(hit.module.slug, hit.lesson.slug);
    return {
      title: hit.lesson.title,
      description: body ? metaDescription(body) : undefined,
      alternates: canonicalFor(problemHref(slug)),
    };
  }

  const extra = getCatalogExtraProblem(slug);
  if (extra) {
    return {
      title: `${extra.title} — Practice Problem`,
      description: metaDescription(extra.description),
      alternates: canonicalFor(problemHref(slug)),
    };
  }

  return {
    title: "Problem",
    alternates: canonicalFor(problemHref(slug)),
  };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);

  if (hit) {
    const lesson = await loadLesson(hit.module.slug, hit.lesson.slug);
    if (!lesson || !lesson.sandbox) notFound();

    const { prev, next } = getProblemNeighbors(hit.module.slug, slug);
    const hasPractice = hit.module.lessons.some(
      (l) => l.type === "practice" && l.slug === "practice",
    );
    const backHref = hasPractice
      ? lessonHref(hit.module.slug, "practice")
      : moduleHref(hit.module.slug);
    const backLabel = hasPractice ? "Practice" : hit.module.shortTitle;
    const { explanation } = splitProblemTabs(lesson.sandbox.afterSandbox);
    const hintLabels = extractHints(explanation).map((h) => h.label);

    return (
      <>
        {/* ProblemWorkspace shows the module eyebrow and a back link rather
            than a full trail, so the hierarchy is visible but not as a
            <Breadcrumbs>; emit the list here instead. */}
        <JsonLd
          data={breadcrumbLd([
            { name: "Practice", path: "/courses/dsa/problems" },
            { name: hit.module.shortTitle, path: moduleHref(hit.module.slug) },
            { name: hit.lesson.title },
          ])}
        />
        <JsonLd
          data={learningResourceLd({
            name: hit.lesson.title,
            path: problemHref(slug),
            learningResourceType: "Coding problem",
            description: metaDescription(lesson.markdown),
          })}
        />
        <ProblemWorkspace
          lesson={{ ...lesson, sandbox: lesson.sandbox }}
          eyebrow={`Module ${hit.module.number} · ${hit.module.title}`}
          backHref={backHref}
          backLabel={backLabel}
          hintLabels={hintLabels}
          prev={prev ? { href: problemHref(prev.slug), title: prev.title } : null}
          next={next ? { href: problemHref(next.slug), title: next.title } : null}
        />
      </>
    );
  }

  const extra = getCatalogExtraProblem(slug);
  if (!extra) notFound();

  const lesson = await loadCatalogLesson(extra);
  if (!lesson || !lesson.sandbox) notFound();

  const { prev, next } = getCatalogProblemNeighbors(slug);
  const { explanation } = splitProblemTabs(lesson.sandbox.afterSandbox);
  const hintLabels = extractHints(explanation).map((h) => h.label);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Practice", path: "/courses/dsa/problems" },
          { name: extra.topics[0] ?? "Algorithm Practice", path: "/courses/dsa/problems" },
          { name: extra.title },
        ])}
      />
      <JsonLd
        data={learningResourceLd({
          name: extra.title,
          path: problemHref(slug),
          learningResourceType: "Coding problem",
          description: metaDescription(extra.description),
        })}
      />
      <ProblemWorkspace
        lesson={{ ...lesson, sandbox: lesson.sandbox }}
        eyebrow={`LeetCode #${extra.id} · ${extra.topics.join(", ")} · ${extra.difficulty}`}
        backHref="/courses/dsa/problems"
        backLabel="All Problems"
        hintLabels={hintLabels}
        prev={prev}
        next={next}
      />
    </>
  );
}
