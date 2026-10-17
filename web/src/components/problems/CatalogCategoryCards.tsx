"use client";

import { TOPIC_ART_MAP } from "@/lib/course/catalog/moduleArtMap";
import { familyCssVars } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORIES = [
  "Arrays",
  "Two Pointers",
  "Sliding Window",
  "Binary Trees",
  "Dynamic Programming",
  "Graphs",
  "Heaps",
  "Recursion & Backtracking",
  "Stacks",
  "Intervals",
  "Binary Search",
  "Tries",
];

export function CatalogCategoryCards({
  selectedTopics,
  onToggleTopic,
  topicCounts,
}: {
  selectedTopics: Set<string>;
  onToggleTopic: (name: string) => void;
  topicCounts: Map<string, number>;
}) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-mark" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Browse by Algorithmic Category
          </h2>
        </div>
        {selectedTopics.size > 0 ? (
          <span className="text-xs font-medium text-mark">
            {selectedTopics.size} {selectedTopics.size === 1 ? "category" : "categories"} active
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {FEATURED_CATEGORIES.map((catName) => {
          const isSelected = selectedTopics.has(catName);
          const count = topicCounts.get(catName) ?? 0;
          const info = TOPIC_ART_MAP[catName];

          return (
            <button
              key={catName}
              type="button"
              aria-pressed={isSelected}
              style={info?.familyId ? familyCssVars(info.familyId) : undefined}
              onClick={() => onToggleTopic(catName)}
              className={cn(
                "group inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation cursor-pointer touch-manipulation motion-reduce:transition-none",
                isSelected
                  ? "border-accent bg-accent/[0.15] text-foreground font-semibold ring-1 ring-accent"
                  : "border-border bg-elevated text-foreground hover:border-accent/60 hover:bg-surface",
              )}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: "var(--family-accent)" }}
                aria-hidden
              />
              <span className="font-medium text-xs">{info?.title ?? catName}</span>
              <span className="rounded-full bg-surface/80 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
