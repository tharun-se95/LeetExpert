"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/components/providers/ProgressProvider";
import type { TopicOption } from "@/components/problems/ProblemFilterPanel";
import { moduleFamily, type ProblemGroup } from "@/lib/course/manifest";
import {
  filterProblems,
  flattenProblems,
  type DifficultyFilter,
  type StatusFilter,
} from "@/lib/course/problemsFilters";
import { getFamilyTheme } from "@/lib/visual/familyTheme";

const NEUTRAL_DOT = "var(--muted)";

/**
 * The practice list's filter state and what follows from it: the filtered
 * problems, the filter panel's props and the empty-state sentence. Shared by
 * the practice page and the landing page's Practice window, so the two can
 * never filter differently.
 */
export function useProblemFilters(groups: ProblemGroup[]) {
  const { solved } = useProgress();
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [topicFilter, setTopicFilter] = useState<Set<string>>(new Set());

  const flat = useMemo(() => flattenProblems(groups), [groups]);

  const filtered = useMemo(
    () =>
      filterProblems(flat, {
        query,
        difficulty: difficultyFilter,
        status: statusFilter,
        topics: topicFilter,
        solved,
      }),
    [flat, query, difficultyFilter, statusFilter, topicFilter, solved],
  );

  const topics: TopicOption[] = useMemo(
    () =>
      groups.map((g) => {
        const familyId = moduleFamily(g.module);
        const solvedInModule = g.problems.filter((p) =>
          solved.has(`${g.module.slug}/${p.slug}`),
        ).length;
        return {
          slug: g.module.slug,
          label: g.module.shortTitle,
          count: g.problems.length,
          solvedCount: solvedInModule,
          color: familyId ? getFamilyTheme(familyId).accent : NEUTRAL_DOT,
        };
      }),
    [groups, solved],
  );

  const toggleTopic = (slug: string) => {
    setTopicFilter((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const activeFilterCount =
    (difficultyFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    topicFilter.size;
  const hasActiveFilters = query.trim().length > 0 || activeFilterCount > 0;

  // Names whichever filters are actually active, so the empty state reads
  // "Nothing matches Hard · Unsolved · Two Pointers" rather than a generic
  // "try loosening a filter" that doesn't say which one to loosen.
  const emptyMessage = useMemo(() => {
    if (!hasActiveFilters) return undefined;
    const parts: string[] = [];
    if (query.trim()) parts.push(`"${query.trim()}"`);
    if (difficultyFilter !== "All") parts.push(difficultyFilter);
    if (statusFilter !== "All") parts.push(statusFilter);
    if (topicFilter.size > 0) {
      const labels = topics
        .filter((t) => topicFilter.has(t.slug))
        .map((t) => t.label);
      parts.push(labels.join(", "));
    }
    return `Nothing matches ${parts.join(" · ")}. Try loosening one filter.`;
  }, [hasActiveFilters, query, difficultyFilter, statusFilter, topicFilter, topics]);

  const clearFilters = () => {
    setQuery("");
    setDifficultyFilter("All");
    setStatusFilter("All");
    setTopicFilter(new Set());
  };

  return {
    query,
    setQuery,
    solved,
    filtered,
    activeFilterCount,
    hasActiveFilters,
    emptyMessage,
    clearFilters,
    filterPanelProps: {
      status: statusFilter,
      onStatusChange: setStatusFilter,
      difficulty: difficultyFilter,
      onDifficultyChange: setDifficultyFilter,
      topics,
      selectedTopics: topicFilter,
      onToggleTopic: toggleTopic,
      hasActiveFilters,
      onClearFilters: clearFilters,
    },
  };
}
