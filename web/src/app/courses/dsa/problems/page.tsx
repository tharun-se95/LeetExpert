import type { Metadata } from "next";
import { groupedProblems } from "@/lib/course/manifest";
import { ProblemsListClient } from "@/components/problems/ProblemsListClient";

export const metadata: Metadata = { title: "Practice" };

export default function ProblemsPage() {
  return <ProblemsListClient groups={groupedProblems()} />;
}
