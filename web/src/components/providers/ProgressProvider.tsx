"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { countLessonsProgress } from "@/lib/course/nav";

const VISITED_KEY = "dsa-course-progress";
const SOLVED_KEY = "dsa-course-solved";

interface ProgressContextValue {
  visited: Set<string>;
  markVisited: (id: string) => void;
  visitedCount: number;
  totalCount: number;
  solved: Set<string>;
  markSolved: (id: string) => void;
  solvedCount: number;
  totalProblemCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Reads a JSON string-array key from localStorage, or an empty set on any failure. */
function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, value: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    /* private mode or a full quota — losing the record is survivable */
  }
}

export function ProgressProvider({
  children,
  totalCount,
  totalProblemCount,
  lessonProgressIds,
}: {
  children: React.ReactNode;
  totalCount: number;
  totalProblemCount: number;
  lessonProgressIds: readonly string[];
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState<Set<string>>(new Set());

  // Reading localStorage during render would desync server and client
  // HTML, so both restores happen in an effect, once, on mount.
  useEffect(() => {
    setVisited(readSet(VISITED_KEY));
    setSolved(readSet(SOLVED_KEY));
  }, []);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      // Merge against what's actually on disk, not just React's prior
      // state. VisitTracker calls this from ITS OWN mount effect, and
      // React runs a child's effects before its parent's — so this can
      // fire before the restore effect above has run, meaning `prev` is
      // still the pre-restore empty set. Writing `prev + id` in that case
      // would silently overwrite (not merge with) everything already
      // persisted from earlier sessions. Reading fresh here means the
      // write is always additive, regardless of which effect wins the race.
      const next = new Set([...readSet(VISITED_KEY), ...prev, id]);
      writeSet(VISITED_KEY, next);
      return next;
    });
  }, []);

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set([...readSet(SOLVED_KEY), ...prev, id]);
      writeSet(SOLVED_KEY, next);
      return next;
    });
  }, []);

  const progressIdSet = useMemo(
    () => new Set(lessonProgressIds),
    [lessonProgressIds],
  );

  const value = useMemo(
    () => ({
      visited,
      markVisited,
      visitedCount: countLessonsProgress(visited, progressIdSet),
      totalCount,
      solved,
      markSolved,
      solvedCount: solved.size,
      totalProblemCount,
    }),
    [
      visited,
      markVisited,
      totalCount,
      solved,
      markSolved,
      totalProblemCount,
      progressIdSet,
    ],
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
