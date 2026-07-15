import type { Metadata } from "next";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Recognition Stems",
};

export default function StemsPage() {
  const doc = loadStaticPage("stems");
  return (
    <DocPage
      doc={doc}
      pathname="/recognition/stems"
      eyebrow="Part 3"
      breadcrumbs={[
        { label: "Recognition", href: "/recognition" },
        { label: "Practice Stems" },
      ]}
    />
  );
}
