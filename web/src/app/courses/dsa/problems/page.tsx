import type { Metadata } from "next";
import { groupedProblems } from "@/lib/course/manifest";
import { ProblemsListClient } from "@/components/problems/ProblemsListClient";
import { canonicalFor } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Practice Problems",
  description:
    "Every problem in the course in one place — solve first in a live Python or JavaScript sandbox, then read the worked explanation.",
  alternates: canonicalFor("/courses/dsa/problems"),
};

export default function ProblemsPage() {
  return <ProblemsListClient groups={groupedProblems()} />;
}
