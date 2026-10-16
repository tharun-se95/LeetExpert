"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CATALOG_PROBLEMS } from "@/lib/course/catalog/data";
import {
  computeListCounts,
  computeTopicCounts,
  filterCatalog,
  isProblemSolved,
  sortCatalog,
} from "@/lib/course/catalog/filters";
import type {
  CatalogProblem,
  CuratedListId,
  Difficulty,
  SortField,
  SortOrder,
} from "@/lib/course/catalog/types";
import type { CatalogTopicOption } from "@/components/problems/CatalogFilterPanel";

const EXTERNAL_SOLVED_KEY = "catalog-solved-ids";

function readExternalSolved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(EXTERNAL_SOLVED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeExternalSolved(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXTERNAL_SOLVED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage full or private mode */
  }
}

export function useCatalogFilters() {
  const { solved: courseSolved } = useProgress();
  const [externalSolved, setExternalSolved] = useState<Set<string>>(new Set());

  // Mount effect to restore external checkmarks
  useEffect(() => {
    setExternalSolved(readExternalSolved());
  }, []);

  // Combined solved IDs set (both course lesson IDs and external IDs)
  const combinedSolved = useMemo(() => {
    const combined = new Set<string>(courseSolved);
    for (const id of externalSolved) {
      combined.add(id);
    }
    return combined;
  }, [courseSolved, externalSolved]);

  const toggleSolved = useCallback((problem: CatalogProblem) => {
    const idKey = String(problem.id);
    const catalogKey = `catalog/${problem.slug}`;
    setExternalSolved((prev) => {
      const next = new Set(prev);
      if (next.has(idKey) || next.has(problem.slug) || next.has(catalogKey)) {
        next.delete(idKey);
        next.delete(problem.slug);
        next.delete(catalogKey);
      } else {
        next.add(idKey);
        next.add(problem.slug);
        next.add(catalogKey);
      }
      writeExternalSolved(next);
      return next;
    });
  }, []);

  const [query, setQuery] = useState("");
  const [activeList, setActiveList] = useState<CuratedListId>("all");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [status, setStatus] = useState<"All" | "Solved" | "Unsolved">("All");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const listCounts = useMemo(
    () => computeListCounts(CATALOG_PROBLEMS),
    [],
  );

  const topicCountMap = useMemo(
    () => computeTopicCounts(CATALOG_PROBLEMS),
    [],
  );

  const topics: CatalogTopicOption[] = useMemo(() => {
    return Array.from(topicCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [topicCountMap]);

  const toggleTopic = useCallback((name: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const clearTopics = useCallback(() => {
    setSelectedTopics(new Set());
  }, []);

  const filtered = useMemo(() => {
    const result = filterCatalog(CATALOG_PROBLEMS, {
      query,
      list: activeList,
      difficulty,
      status,
      topics: selectedTopics,
      solvedIds: combinedSolved,
      sortBy,
      sortOrder,
    });
    return sortCatalog(result, sortBy, sortOrder, combinedSolved);
  }, [
    query,
    activeList,
    difficulty,
    status,
    selectedTopics,
    combinedSolved,
    sortBy,
    sortOrder,
  ]);

  const solvedCountInCatalog = useMemo(() => {
    let count = 0;
    for (const p of CATALOG_PROBLEMS) {
      if (isProblemSolved(p, combinedSolved)) count++;
    }
    return count;
  }, [combinedSolved]);

  const activeFilterCount =
    (activeList !== "all" ? 1 : 0) +
    (difficulty !== "All" ? 1 : 0) +
    (status !== "All" ? 1 : 0) +
    selectedTopics.size;

  const hasActiveFilters = query.trim().length > 0 || activeFilterCount > 0;

  const emptyMessage = useMemo(() => {
    if (!hasActiveFilters) return undefined;
    const parts: string[] = [];
    if (query.trim()) parts.push(`"${query.trim()}"`);
    if (activeList !== "all") parts.push(`List: ${activeList}`);
    if (difficulty !== "All") parts.push(difficulty);
    if (status !== "All") parts.push(status);
    if (selectedTopics.size > 0) {
      parts.push(Array.from(selectedTopics).join(", "));
    }
    return `Nothing matches ${parts.join(" · ")}. Try loosening one filter.`;
  }, [hasActiveFilters, query, activeList, difficulty, status, selectedTopics]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveList("all");
    setDifficulty("All");
    setStatus("All");
    setSelectedTopics(new Set());
  }, []);

  return {
    query,
    setQuery,
    activeList,
    setActiveList,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    selectedTopics,
    toggleTopic,
    clearTopics,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    listCounts,
    topicCountMap,
    topics,
    filtered,
    totalCount: CATALOG_PROBLEMS.length,
    solvedCount: solvedCountInCatalog,
    combinedSolved,
    toggleSolved,
    activeFilterCount,
    hasActiveFilters,
    emptyMessage,
    clearFilters,
  };
}
