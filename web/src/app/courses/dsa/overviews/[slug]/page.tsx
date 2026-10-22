import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ArtifactFrame } from "@/components/course/ArtifactFrame";
import { MODULES, STAGES } from "@/lib/course/manifest";
import {
  OVERVIEWS,
  getOverview,
  overviewHref,
  overviewSrc,
} from "@/lib/course/overviews";
import { lessonHref } from "@/lib/course/nav";
import { canonicalFor } from "@/lib/seo/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Static: every overview is known at build time and nothing here reads the
 * session. `dynamicParams = false` makes an unknown slug a 404 instead of an
 * on-demand render.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OVERVIEWS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const overview = getOverview(slug);
  if (!overview) return {};
  return {
    title: overview.title,
    description: overview.summary,
    alternates: canonicalFor(overviewHref(slug)),
  };
}

/**
 * A stage overview: the built lesson-artifact page in the app's chrome. The
 * page owns the viewport (`isOverviewPath` in AppShell), and the artifact
 * scrolls itself, since it is a whole page with its own contents rail.
 */
export default async function OverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const overview = getOverview(slug);
  if (!overview) notFound();
  const stage = STAGES.find((s) => s.number === overview.stage);
  const stageModules = stage ? MODULES.filter((m) => m.stage === stage.number) : [];
  const firstModule = stageModules[0];
  const firstLesson = firstModule?.lessons[0];

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 pt-6 pb-4 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Lessons", href: "/courses/dsa" },
          {
            label: stage ? `Stage ${stage.number} — ${stage.title}` : "Overview",
            href: stage ? `/courses/dsa#stage-${stage.number}` : "/courses/dsa",
          },
          { label: overview.title },
        ]}
      />
      {/* The artifact's own hero is inside the frame, out of the heading
          outline; this is the page's h1. */}
      <h1 className="sr-only">{overview.title}</h1>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation">
        <ArtifactFrame
          src={overviewSrc(overview.slug)}
          title={`${overview.title}, interactive overview`}
          mode="embed"
        />
      </div>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-3">
        {stage ? (
          <Link
            href={`/courses/dsa#stage-${stage.number}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Stage {stage.number} ({stage.title})</span>
          </Link>
        ) : <div />}
        {firstModule && firstLesson ? (
          <Link
            href={lessonHref(firstModule.slug, firstLesson.slug)}
            className="inline-flex items-center justify-center gap-2 rounded-[length:var(--radius-md)] bg-accent px-3.5 py-1.5 text-xs font-semibold text-on-pop transition hover:opacity-90"
          >
            <span>Start Stage {stage?.number ?? 1}: {firstModule.title}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
