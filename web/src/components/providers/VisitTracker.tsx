"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonIdFromPathname } from "@/lib/course/nav";

export function VisitTracker() {
  const pathname = usePathname();
  const { markVisited } = useProgress();

  useEffect(() => {
    const id = lessonIdFromPathname(pathname);
    if (id) markVisited(id);
  }, [pathname, markVisited]);

  return null;
}
