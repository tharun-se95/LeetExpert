import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/layout/DocPage";
import { PosterGrid } from "@/components/posters/PosterGrid";
import { allFamilyIds, loadCheatSheet } from "@/lib/content/load";
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
  return { title: family ? `${family.title} Cheat Sheet` : "Cheat Sheet" };
}

export default async function CheatSheetPage({ params }: PageProps) {
  const { family: id } = await params;
  const family = getFamily(id);
  const doc = loadCheatSheet(id);
  if (!family || !doc) notFound();

  return (
    <DocPage
      doc={doc}
      pathname={`/cheat-sheets/${id}`}
      eyebrow="Part 4 — Cheat Sheets"
      breadcrumbs={[
        { label: "Cheat Sheets", href: "/cheat-sheets" },
        { label: family.title },
      ]}
      familyId={family.id}
      stage={<PosterGrid familyId={family.id} markdown={doc.markdown} />}
      markdownInDetails={{
        summary: "Show full cheat-sheet markdown",
      }}
    />
  );
}
