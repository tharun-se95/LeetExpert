"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/providers/ProgressProvider";
import { courseLessonIdFromPathname } from "@/lib/courses/lessonId";

export function VisitTracker() {
  const pathname = usePathname();
  const { markVisited } = useProgress();

  useEffect(() => {
    const id = courseLessonIdFromPathname(pathname);
    if (id) markVisited(id);
  }, [pathname, markVisited]);

  return null;
}
