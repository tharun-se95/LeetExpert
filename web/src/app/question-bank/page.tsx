import type { Metadata } from "next";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Question Bank",
};

export default function QuestionBankPage() {
  const doc = loadStaticPage("questionBank");
  return (
    <DocPage
      doc={doc}
      pathname="/question-bank"
      eyebrow="Reference"
      breadcrumbs={[{ label: "Question Bank" }]}
    />
  );
}
