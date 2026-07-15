import type { Metadata } from "next";
import { DecisionObservatory } from "@/components/explorers/DecisionObservatory";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Decision Trees",
};

export default function DecisionTreesPage() {
  const doc = loadStaticPage("decisionTrees");
  return (
    <DocPage
      doc={doc}
      pathname="/decision-trees"
      eyebrow="Recognition"
      breadcrumbs={[
        { label: "Recognition", href: "/recognition" },
        { label: "Decision Trees" },
      ]}
      stage={<DecisionObservatory />}
      markdownInDetails={{
        summary: "Show written decision-tree reference (markdown)",
      }}
    />
  );
}
