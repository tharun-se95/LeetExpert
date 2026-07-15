import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/layout/DocPage";
import { PatternLabSlot } from "@/components/lab/PatternLabSlot";
import { allPatternParams, loadPattern } from "@/lib/content/load";
import { getPattern } from "@/lib/content/manifest";

interface PageProps {
  params: Promise<{ family: string; pattern: string }>;
}

export function generateStaticParams() {
  return allPatternParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { family, pattern } = await params;
  const hit = getPattern(family, pattern);
  return { title: hit?.pattern.title ?? "Pattern" };
}

export default async function PatternPage({ params }: PageProps) {
  const { family: familyId, pattern: patternSlug } = await params;
  const hit = getPattern(familyId, patternSlug);
  const doc = loadPattern(familyId, patternSlug);
  if (!hit || !doc) notFound();

  return (
    <DocPage
      doc={doc}
      pathname={`/patterns/${familyId}/${patternSlug}`}
      eyebrow={`Family ${hit.family.number} — ${hit.family.title}`}
      familyId={familyId}
      stage={
        <PatternLabSlot
          familyId={familyId}
          patternSlug={patternSlug}
          patternTitle={hit.pattern.title}
        />
      }
      breadcrumbs={[
        { label: "Patterns", href: `/patterns/${familyId}` },
        { label: hit.family.title, href: `/patterns/${familyId}` },
        { label: doc.title },
      ]}
    />
  );
}
