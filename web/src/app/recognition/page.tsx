import type { Metadata } from "next";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Pattern Recognition Guide",
};

export default function RecognitionPage() {
  const doc = loadStaticPage("recognition");
  return (
    <DocPage
      doc={doc}
      pathname="/recognition"
      eyebrow="Part 3"
      breadcrumbs={[{ label: "Recognition" }]}
    />
  );
}
