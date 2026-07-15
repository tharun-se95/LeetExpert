import type { Metadata } from "next";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Glossary",
};

export default function GlossaryPage() {
  const doc = loadStaticPage("glossary");
  return (
    <DocPage
      doc={doc}
      pathname="/glossary"
      eyebrow="Reference"
      breadcrumbs={[{ label: "Glossary" }]}
    />
  );
}
