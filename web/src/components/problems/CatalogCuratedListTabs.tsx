"use client";

import { CURATED_LISTS, type CuratedListId } from "@/lib/course/catalog/types";
import { cn } from "@/lib/utils";

export function CatalogCuratedListTabs({
  activeList,
  onListChange,
  listCounts,
}: {
  activeList: CuratedListId;
  onListChange: (list: CuratedListId) => void;
  listCounts: Record<CuratedListId, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter by curated problem list"
      className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {CURATED_LISTS.map((list) => {
        const isActive = activeList === list.id;
        const count = listCounts[list.id] ?? 0;
        return (
          <button
            key={list.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onListChange(list.id)}
            className={cn(
              "flex shrink-0 min-h-9 items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none touch-manipulation",
              isActive
                ? "border-pop bg-pop text-on-pop"
                : "border-border bg-elevated text-muted hover:border-accent/40 hover:text-foreground",
            )}
          >
            <span>{list.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold leading-tight",
                isActive
                  ? "bg-on-pop/20 text-on-pop"
                  : "bg-surface text-muted",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
