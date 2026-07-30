"use client";

import dynamic from "next/dynamic";
import { LANDING_SANDBOX } from "@/lib/landing/content";

const Sandbox = dynamic(
  () => import("@/components/sandbox/Sandbox").then((m) => m.Sandbox),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl border border-border bg-code" />
    ),
  },
);

/** Tiny live sandbox on the landing page — separate draft key from course Two Sum. */
export function LandingSandbox() {
  return <Sandbox source={LANDING_SANDBOX} variant="card" />;
}
