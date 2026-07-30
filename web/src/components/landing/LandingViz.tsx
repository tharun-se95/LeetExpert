"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Viz = dynamic(
  () => import("@/components/viz/Viz").then((m) => m.Viz),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-[length:var(--radius-md)] bg-code" />
    ),
  },
);

export const SANDBOX_PAIR_VIZ = JSON.stringify({
  id: "converging-pointers",
  data: [2, 7, 11, 15, 21],
  target: 22,
  speed: 800,
});

const STRIP_TABS = [
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
  },
] as const;

/** One player, three stories — single outer card, no nested frames. */
export function LandingVizStrip() {
  const [tab, setTab] = useState<(typeof STRIP_TABS)[number]["id"]>("pointers");
  const active = STRIP_TABS.find((t) => t.id === tab) ?? STRIP_TABS[0];

  return (
    <div className="elevated-card overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated">
      <div className="border-b border-border px-3 py-3 sm:px-4">
        <div
          role="tablist"
          aria-label="Visualization topics"
          className="flex flex-wrap gap-1.5"
        >
          {STRIP_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-pop text-on-pop"
                  : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
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
    <div className="elevated-card overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated p-3 sm:p-4">
      <Viz source={SANDBOX_PAIR_VIZ} embedded />
    </div>
  );
}
