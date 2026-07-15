"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/providers/ProgressProvider";
import { buildFlatNav } from "@/lib/content/nav";

export function VisitTracker() {
  const pathname = usePathname();
  const { markVisited } = useProgress();

  useEffect(() => {
    const entry = buildFlatNav().find((e) => e.href === pathname);
    if (entry) markVisited(entry.id);
  }, [pathname, markVisited]);

  return null;
}
