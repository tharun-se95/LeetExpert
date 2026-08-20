"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
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
  },
];

/**
 * One player, three stories — single outer card, no nested frames. Each
 * topic carries its real algorithm-family accent (see familyTheme.ts) so
 * color here means something instead of being decoration.
 */
export function LandingVizStrip() {
  const [tab, setTab] = useState<(typeof STRIP_TABS)[number]["id"]>("pointers");
  const active = STRIP_TABS.find((t) => t.id === tab) ?? STRIP_TABS[0];
  const activeTheme = getFamilyTheme(active.family);

  return (
    <div
      className="overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated"
      style={{ borderTopColor: activeTheme.accent, borderTopWidth: 2 }}
    >
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
    <div className="overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated p-3 sm:p-4">
      <Viz source={SANDBOX_PAIR_VIZ} embedded />
    </div>
  );
}
