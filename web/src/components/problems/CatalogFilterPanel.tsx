"use client";

import { useState } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { difficultyFilterChipClass } from "@/lib/course/problemDifficulty";
import {
  CURATED_LISTS,
  type CuratedListId,
  type Difficulty,
} from "@/lib/course/catalog/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["All", "Unsolved", "Solved"] as const;
const DIFFICULTY_OPTIONS: ("All" | Difficulty)[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

export interface CatalogTopicOption {
  name: string;
  count: number;
}

export function CatalogFilterPanel({
  activeList,
  onListChange,
  listCounts,
  status,
  onStatusChange,
  difficulty,
  onDifficultyChange,
  topics,
  selectedTopics,
  onToggleTopic,
  onClearTopics,
  hasActiveFilters,
  onClearFilters,
}: {
  activeList: CuratedListId;
  onListChange: (list: CuratedListId) => void;
  listCounts: Record<CuratedListId, number>;
  status: "All" | "Solved" | "Unsolved";
  onStatusChange: (s: "All" | "Solved" | "Unsolved") => void;
  difficulty: "All" | Difficulty;
  onDifficultyChange: (d: "All" | Difficulty) => void;
  topics: CatalogTopicOption[];
  selectedTopics: Set<string>;
  onToggleTopic: (name: string) => void;
  onClearTopics?: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const [topicSearch, setTopicSearch] = useState("");

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(topicSearch.trim().toLowerCase()),
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* Curated list selection */}
      <div role="group" aria-label="Curated list collection" className="shrink-0">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Curated Collection
        </p>
        <div className="flex flex-col gap-1">
          {CURATED_LISTS.map((list) => {
            const active = activeList === list.id;
            const count = listCounts[list.id] ?? 0;
            return (
              <button
                key={list.id}
                type="button"
                aria-pressed={active}
                onClick={() => onListChange(list.id)}
                className={cn(
                  "flex min-h-8 items-center justify-between rounded-[length:var(--radius-md)] border px-2.5 py-1 text-xs font-medium transition-colors text-left touch-manipulation",
                  active
                    ? "border-pop/60 bg-pop/15 text-foreground"
                    : "border-transparent bg-transparent text-muted hover:border-border hover:bg-elevated hover:text-foreground",
                )}
              >
                <span>{list.label}</span>
                <span className="font-mono text-[10px] text-muted">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status segmented control */}
      <div role="group" aria-label="Filter by status" className="shrink-0">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Status
        </p>
        <div className="flex gap-0.5 rounded-[length:var(--radius-md)] border border-border bg-code p-0.5">
          {STATUS_OPTIONS.map((level) => {
            const active = status === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusChange(level)}
                className={cn(
                  "min-h-9 flex-1 touch-manipulation rounded-[length:var(--radius-sm)] text-xs font-medium transition-colors",
                  active
                    ? "bg-pop text-on-pop"
                    : "text-muted hover:text-foreground",
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty chips */}
      <div role="group" aria-label="Filter by difficulty" className="shrink-0">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Difficulty
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {DIFFICULTY_OPTIONS.map((level) => {
            const active = difficulty === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => onDifficultyChange(level)}
                className={cn(
                  "min-h-8 touch-manipulation rounded-[length:var(--radius-md)] border px-2.5 py-1 text-center font-mono text-[11px] uppercase tracking-wide transition-colors",
                  difficultyFilterChipClass(level, active),
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics list */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Topic Tags
          </p>
          {selectedTopics.size > 0 && onClearTopics ? (
            <button
              type="button"
              onClick={onClearTopics}
              className="text-[10px] text-mark hover:opacity-80"
            >
              Reset ({selectedTopics.size})
            </button>
          ) : null}
        </div>

        {/* Topic search filter */}
        <div className="relative mb-2">
          <MagnifyingGlass
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="text"
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search topics..."
            aria-label="Filter topic tags"
            className="w-full rounded-[length:var(--radius-sm)] border border-border bg-code py-1 pl-7 pr-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Scrollable list */}
        <div
          role="group"
          aria-label="Topics"
          className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-56 [scrollbar-width:thin]"
        >
          {filteredTopics.map((topic) => {
            const checked = selectedTopics.has(topic.name);
            return (
              <label
                key={topic.name}
                className={cn(
                  "flex min-h-7 cursor-pointer items-center justify-between rounded-[length:var(--radius-xs)] px-2 py-1 text-xs transition-colors",
                  checked
                    ? "bg-accent/15 text-foreground font-medium"
                    : "text-muted hover:bg-elevated hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={cn(
                      "flex h-3.5 w-3.5 items-center justify-center rounded-[length:var(--radius-xs)] border transition-colors",
                      checked
                        ? "border-accent bg-accent text-on-pop"
                        : "border-border bg-transparent",
                    )}
                  >
                    {checked ? <Check size={10} weight="bold" /> : null}
                  </div>
                  <span className="truncate">{topic.name}</span>
                </div>
                <span className="font-mono text-[10px] text-muted ml-1">
                  {topic.count}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTopic(topic.name)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear all filters */}
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="shrink-0 text-left text-xs font-medium text-mark hover:opacity-80 transition-opacity"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
