import type { Metadata } from "next";
import { PricingClient } from "./PricingClient";
import { canonicalFor } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Pricing & Lifetime Access · leetExpert",
  description:
    "Transparent pricing for leetExpert. One-time payment for lifetime access to all 24 modules, 116+ curated interview problems, zero-install execution, and Socratic AI coach. No recurring subscriptions.",
  alternates: canonicalFor("/pricing"),
};

export default function PricingPage() {
  return <PricingClient />;
}
