import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocPage } from "@/components/layout/DocPage";
import { allFamilyIds, loadFamilyOverview } from "@/lib/content/load";
import { getFamily } from "@/lib/content/manifest";

interface PageProps {
  params: Promise<{ family: string }>;
}

export function generateStaticParams() {
  return allFamilyIds().map((family) => ({ family }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { family: id } = await params;
  const family = getFamily(id);
  return {
    title: family ? `Family ${family.number} — ${family.title}` : "Patterns",
  };
}

export default async function FamilyOverviewPage({ params }: PageProps) {
  const { family: id } = await params;
  const family = getFamily(id);
  const doc = loadFamilyOverview(id);
  if (!family || !doc) notFound();

  return (
    <div>
      <DocPage
        doc={doc}
        pathname={`/patterns/${id}`}
        eyebrow={`Part 2 · Family ${family.number}`}
        breadcrumbs={[
          { label: "Patterns", href: `/patterns/${id}` },
          { label: family.title },
        ]}
      />
      <div className="print:hidden mx-auto max-w-6xl px-4 pb-12 lg:px-8">
        <div className="grid max-w-[65ch] gap-2 sm:grid-cols-2">
          {family.patterns.map((p) => (
            <Link
              key={p.slug}
              href={`/patterns/${id}/${p.slug}`}
              className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition hover:border-foreground/20 hover:bg-surface"
            >
              {p.title}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/cheat-sheets/${id}`}
            className="text-accent hover:underline"
          >
            Cheat sheet →
          </Link>
          <Link href={`/practice/${id}`} className="text-accent hover:underline">
            Practice drills →
          </Link>
        </div>
      </div>
    </div>
  );
}
