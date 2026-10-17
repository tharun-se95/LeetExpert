import type { Metadata } from "next";
import { RoadmapClient } from "./RoadmapClient";
import { canonicalFor } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Curriculum Roadmap · leetExpert",
  description:
    "Interactive dependency roadmap for the leetExpert Data Structures & Algorithms curriculum. Track progress across all 5 stages from foundations to global reasoning.",
  alternates: canonicalFor("/courses/dsa/roadmap"),
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
