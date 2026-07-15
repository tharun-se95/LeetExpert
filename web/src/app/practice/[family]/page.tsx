import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/layout/DocPage";
import { allFamilyIds, loadPractice } from "@/lib/content/load";
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
  return { title: family ? `${family.title} Practice` : "Practice" };
}

export default async function PracticePage({ params }: PageProps) {
  const { family: id } = await params;
  const family = getFamily(id);
  const doc = loadPractice(id);
  if (!family || !doc) notFound();

  return (
    <DocPage
      doc={doc}
      pathname={`/practice/${id}`}
      eyebrow="Part 5 — Practice Roadmap"
      breadcrumbs={[
        { label: "Practice", href: "/practice" },
        { label: family.title },
      ]}
    />
  );
}
