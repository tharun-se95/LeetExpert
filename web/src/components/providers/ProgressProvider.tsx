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
import {
  migrateLegacyProgress,
  readSet,
  solvedKey,
  visitedKey,
  writeSet,
} from "./progressStorage";

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

export function ProgressProvider({
  children,
  courseSlug,
  totalCount,
  totalProblemCount,
  lessonProgressIds,
}: {
  children: React.ReactNode;
  courseSlug: string;
  totalCount: number;
  totalProblemCount: number;
  lessonProgressIds: readonly string[];
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const vKey = visitedKey(courseSlug);
  const sKey = solvedKey(courseSlug);

  // Reading localStorage during render would desync server and client
  // HTML, so both restores happen in an effect, once, on mount.
  useEffect(() => {
    migrateLegacyProgress(courseSlug);
    setVisited(readSet(vKey));
    setSolved(readSet(sKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  const markVisited = useCallback(
    (id: string) => {
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
        const next = new Set([...readSet(vKey), ...prev, id]);
        writeSet(vKey, next);
        return next;
      });
    },
    [vKey],
  );

  const markSolved = useCallback(
    (id: string) => {
      setSolved((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set([...readSet(sKey), ...prev, id]);
        writeSet(sKey, next);
        return next;
      });
    },
    [sKey],
  );

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
