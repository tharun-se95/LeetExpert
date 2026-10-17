import type { Metadata } from "next";
import { CheatsheetsClient } from "./CheatsheetsClient";
import { canonicalFor } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "DSA Cheatsheets Hub · leetExpert",
  description:
    "Comprehensive interview-ready cheatsheets across all 24 DSA curriculum modules. Asymptotic time/space complexity targets, core pattern cues, interactive diagrams, and traps to avoid.",
  alternates: canonicalFor("/courses/dsa/cheatsheets"),
};

export default function CheatsheetsPage() {
  return <CheatsheetsClient />;
}
