import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BigOObservatory } from "@/components/explorers/BigOObservatory";
import { DocPage } from "@/components/layout/DocPage";
import {
  allFoundationSlugs,
  loadFoundation,
} from "@/lib/content/load";
import { getFoundation } from "@/lib/content/manifest";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allFoundationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getFoundation(slug);
  return { title: chapter?.title ?? "Foundations" };
}

export default async function FoundationPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = loadFoundation(slug);
  if (!doc) notFound();

  return (
    <DocPage
      doc={doc}
      pathname={`/foundations/${slug}`}
      eyebrow="Part 1 — Foundations"
      breadcrumbs={[
        { label: "Foundations", href: "/foundations/solving-problems" },
        { label: doc.title },
      ]}
      stage={slug === "big-o" ? <BigOObservatory /> : undefined}
    />
  );
}
