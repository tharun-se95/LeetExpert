"use client";

import { PatternLab } from "@/components/lab/PatternLab";
import type { FamilyId } from "@/lib/content/manifest";
import { getDemo } from "@/lib/visual/demoRegistry";

export interface PatternLabSlotProps {
  familyId: FamilyId | string;
  patternSlug: string;
  patternTitle: string;
}

/** Client boundary: loads registry demo and mounts PatternLab into DocPage stage. */
export function PatternLabSlot({
  familyId,
  patternSlug,
  patternTitle,
}: PatternLabSlotProps) {
  const demo = getDemo(familyId, patternSlug);
  if (!demo) return null;

  return (
    <PatternLab
      familyId={familyId}
      patternSlug={patternSlug}
      patternTitle={patternTitle}
      demo={demo}
    />
  );
}
