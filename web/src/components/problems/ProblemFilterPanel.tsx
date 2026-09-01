import { Check } from "@phosphor-icons/react";
import { difficultyFilterChipClass } from "@/lib/course/problemDifficulty";
import type { DifficultyFilter, StatusFilter } from "@/lib/course/problemsFilters";
import { cn } from "@/lib/utils";

export interface TopicOption {
  slug: string;
  label: string;
  count: number;
  solvedCount: number;
  /** Family accent hex from getFamilyTheme(id).accent, or a neutral fallback. */
  color: string;
}

const STATUS_OPTIONS: StatusFilter[] = ["All", "Unsolved", "Solved"];
const DIFFICULTY_OPTIONS: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

/**
 * The three filter controls (Status, Difficulty, Topics), rendered
 * identically in the desktop sidebar and inside the mobile bottom sheet —
 * this component has no idea which container it's in.
 */
export function ProblemFilterPanel({
  status,
  onStatusChange,
  difficulty,
  onDifficultyChange,
  topics,
  selectedTopics,
  onToggleTopic,
  hasActiveFilters,
  onClearFilters,
}: {
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  difficulty: DifficultyFilter;
  onDifficultyChange: (d: DifficultyFilter) => void;
  topics: TopicOption[];
  selectedTopics: Set<string>;
  onToggleTopic: (slug: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Filter by status">
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

      <div role="group" aria-label="Filter by difficulty">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Difficulty
        </p>
        <div className="flex flex-col gap-1.5">
          {DIFFICULTY_OPTIONS.map((level) => {
            const active = difficulty === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => onDifficultyChange(level)}
                className={cn(
                  "min-h-9 touch-manipulation rounded-[length:var(--radius-md)] border px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide transition-colors",
                  difficultyFilterChipClass(level, active),
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Topics
        </p>
        {/*
          No scroll/fade treatment of its own — the desktop sidebar wraps
          the whole panel (Status + Difficulty + Topics together) in one
          scroll region, and the mobile sheet already scrolls its own body,
          so a second, nested scroll area here would just trap the wheel.
        */}
        <div className="flex flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-code">
          {topics.map((t, i) => {
            const checked = selectedTopics.has(t.slug);
            return (
              <label
                key={t.slug}
                className={cn(
                  "flex min-h-11 touch-manipulation items-center gap-2 px-3 py-2",
                  i > 0 && "border-t border-border",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTopic(t.slug)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] border",
                    checked
                      ? "border-accent bg-accent"
                      : "border-border bg-transparent",
                  )}
                >
                  {checked ? (
                    <Check size={10} weight="bold" className="text-on-pop" />
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[12.5px]",
                    checked ? "text-foreground" : "text-muted",
                  )}
                >
                  {t.label}
                </span>
                <span className="shrink-0 font-mono text-[10.5px] text-muted">
                  {t.solvedCount}/{t.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-left text-xs font-medium text-mark hover:opacity-80"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
