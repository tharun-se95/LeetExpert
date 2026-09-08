"use client";

import dynamic from "next/dynamic";
import { LockSimple } from "@phosphor-icons/react";
import { LANDING_SANDBOX } from "@/lib/landing/content";
import { problemHref } from "@/lib/course/nav";

const Sandbox = dynamic(
  () => import("@/components/sandbox/Sandbox").then((m) => m.Sandbox),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-[length:var(--radius-xl)] border border-border bg-code-editor" />
    ),
  },
);

/** Real course URL for the problem this teaser sandbox is actually drawn
 *  from — same "honest address bar" convention as LandingViz's browser
 *  chrome, not a decorative fake path. */
const SANDBOX_URL = problemHref("two-sum");

/**
 * Tiny live sandbox on the landing page — separate draft key from course Two
 * Sum. Wrapped in the same browser-window chrome as LandingVizStrip so the
 * two "see it in action" demos on the marketing page read as one visual
 * language rather than two different card styles.
 */
export function LandingSandbox() {
  return (
    <div className="overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated shadow-elevation">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1">
          <LockSimple weight="fill" className="h-3 w-3 shrink-0 text-muted" aria-hidden />
          <span className="truncate font-mono text-[0.7rem] text-muted">
            leetexpert.com{SANDBOX_URL}
          </span>
        </div>
        <div className="w-[46px] shrink-0" aria-hidden />
      </div>
      <Sandbox source={LANDING_SANDBOX} variant="card" embedded />
    </div>
  );
}
