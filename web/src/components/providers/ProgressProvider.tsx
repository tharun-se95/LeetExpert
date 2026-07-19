"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "dsa-course-progress";

interface ProgressContextValue {
  visited: Set<string>;
  markVisited: (id: string) => void;
  visitedCount: number;
  totalCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  totalCount,
}: {
  children: React.ReactNode;
  totalCount: number;
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setVisited(new Set(arr));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      visited,
      markVisited,
      visitedCount: visited.size,
      totalCount,
    }),
    [visited, markVisited, totalCount],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
