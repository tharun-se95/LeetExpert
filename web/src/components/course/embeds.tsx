import type { ComponentType } from "react";
import { BigOObservatory } from "@/components/explorers/BigOObservatory";

/**
 * Interactive explorers embedded above specific lessons, keyed by
 * "module/lesson". Reuses the visual lab investments from v1.
 */
export const LESSON_EMBEDS: Record<string, ComponentType> = {
  "big-o/common-complexity-classes": BigOObservatory,
};
