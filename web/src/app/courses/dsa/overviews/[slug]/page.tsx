import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ArtifactFrame } from "@/components/course/ArtifactFrame";
import { STAGES } from "@/lib/course/manifest";
import {
  OVERVIEWS,
  getOverview,
  overviewHref,
  overviewSrc,
} from "@/lib/course/overviews";
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
        />
      </div>
    </div>
  );
}
