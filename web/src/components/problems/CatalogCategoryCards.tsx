"use client";

import Image from "next/image";
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
      <div className="mb-2.5 flex items-center justify-between">
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

      <div className="flex gap-3 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {FEATURED_CATEGORIES.map((catName) => {
          const isSelected = selectedTopics.has(catName);
          const count = topicCounts.get(catName) ?? 0;
          const info = TOPIC_ART_MAP[catName];
          const categoryImage = info?.slug ? `/media/categories/cat-${info.slug}.jpg` : null;

          return (
            <button
              key={catName}
              type="button"
              aria-pressed={isSelected}
              style={info?.familyId ? familyCssVars(info.familyId) : undefined}
              onClick={() => onToggleTopic(catName)}
              className={cn(
                "group relative flex shrink-0 w-[164px] sm:w-[176px] flex-col overflow-hidden rounded-[length:var(--radius-md)] border p-2 text-left transition-[background-color,border-color,transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation motion-reduce:transition-none touch-manipulation",
                isSelected
                  ? "border-accent bg-accent/[0.12] ring-1 ring-accent"
                  : "border-border bg-elevated hover:-translate-y-1 hover:border-accent/60",
              )}
            >
              {/* 3D Marketing Image Thumbnail */}
              <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-[length:var(--radius-sm)] bg-surface border border-border/50">
                {categoryImage ? (
                  <Image
                    src={categoryImage}
                    alt={info?.title ?? catName}
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />
                ) : null}

                {/* Ambient vignette overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/20 to-transparent pointer-events-none"
                  aria-hidden
                />

                {/* Themed corner glowing indicator */}
                <div className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-full bg-surface/90 px-1.5 py-0.5 border border-border/60 backdrop-blur-xs">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--family-accent)" }}
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-foreground group-hover:text-mark transition-colors">
                  {info?.title ?? catName}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                <span className="font-mono text-[10px] font-semibold">{count} Qs</span>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    isSelected ? "text-accent" : "text-muted group-hover:text-foreground",
                  )}
                >
                  {isSelected ? "Active ✓" : "+ Filter"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
