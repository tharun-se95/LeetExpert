"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LockSimple } from "@phosphor-icons/react";
import type { FamilyId } from "@/lib/content/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { moduleHref } from "@/lib/course/nav";
import { cn } from "@/lib/utils";

const Viz = dynamic(
  () => import("@/components/viz/Viz").then((m) => m.Viz),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-[length:var(--radius-xl)] bg-code" />
    ),
  },
);

export const SANDBOX_PAIR_VIZ = JSON.stringify({
  id: "converging-pointers",
  data: [2, 7, 11, 15, 21],
  target: 22,
  speed: 800,
});

const STRIP_TABS: {
  id: string;
  label: string;
  blurb: string;
  source: string;
  family: FamilyId;
  /** Real module slug — the address bar shows learners where this actually
   *  lives in the course, not a decorative fake path. */
  moduleSlug: string;
}[] = [
  {
    id: "pointers",
    label: "Pointers",
    blurb: "Two ends walk the sorted array until they meet the target.",
    source: JSON.stringify({
      id: "converging-pointers",
      data: [2, 7, 11, 15, 21],
      target: 22,
      speed: 750,
    }),
    family: "pointer-movement",
    moduleSlug: "two-pointers",
  },
  {
    id: "trees",
    label: "Trees",
    blurb: "Naive fib recomputes the same subtrees — the call tree makes waste visible.",
    source: JSON.stringify({
      id: "fib-call-tree",
      n: 4,
      speed: 650,
    }),
    family: "recursive-exploration",
    moduleSlug: "recursion-backtracking",
  },
  {
    id: "hash",
    label: "Hash",
    blurb: "Keys land in buckets. Watch chains grow — and when a resize fires.",
    source: JSON.stringify({
      id: "hash-buckets",
      keys: [10, 3, 18, 7, 25, 11],
      capacity: 4,
      speed: 700,
    }),
    family: "relationships",
    moduleSlug: "hash-tables",
  },
];

/**
 * A browser-window frame around the topic switcher: traffic lights + an
 * address bar naming the real module the active tab lives in, so the demo
 * reads as "this is the actual product at this actual URL" rather than a
 * screenshot. One player, three stories inside it — no nested frames.
 * Each topic carries its real algorithm-family accent (see familyTheme.ts)
 * so color here means something instead of being decoration.
 *
 * Deliberately full-width in its parent (see the marketing page section
 * this renders in): the viz and its paired code panel already split this
 * card 50/50 internally, so squeezing the whole card into half a grid row
 * halves that again — the code column was clipping at ~260px before this
 * was pulled out of a side-by-side text+demo grid into its own full-width
 * row.
 */
export function LandingVizStrip() {
  const [tab, setTab] = useState<(typeof STRIP_TABS)[number]["id"]>("pointers");
  const active = STRIP_TABS.find((t) => t.id === tab) ?? STRIP_TABS[0];

  return (
    <div className="overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated shadow-elevation">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1">
          <LockSimple weight="fill" className="h-3 w-3 shrink-0 text-muted" aria-hidden />
          <span className="truncate font-mono text-[0.7rem] text-muted">
            leetexpert.com{moduleHref(active.moduleSlug)}
          </span>
        </div>
        <div className="w-[46px] shrink-0" aria-hidden />
      </div>

      <div className="border-b border-border px-3 py-3 sm:px-4">
        <div
          role="tablist"
          aria-label="Visualization topics"
          className="flex flex-wrap gap-1.5"
        >
          {STRIP_TABS.map((t) => {
            const theme = getFamilyTheme(t.family);
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.id)}
                style={isActive ? familyCssVars(t.family) : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-[length:var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--family-accent)] text-[var(--family-on-accent)]"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                {!isActive ? (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                ) : null}
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">{active.blurb}</p>
      </div>
      <div className="p-3 sm:p-4">
        <Viz key={active.id} source={active.source} embedded />
      </div>
    </div>
  );
}

/** Intuition before the landing mini-sandbox. */
export function LandingSandboxViz() {
  return (
    <div className="overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated shadow-elevation p-3 sm:p-4">
      <Viz source={SANDBOX_PAIR_VIZ} embedded />
    </div>
  );
}
